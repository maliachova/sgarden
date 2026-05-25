package com.sgarden.service;

import com.sgarden.dto.RevenueByPeriodResponse;
import com.sgarden.dto.SalesAnalyticsResponse;
import com.sgarden.dto.TopProductResponse;
import com.sgarden.model.Order;
import com.sgarden.model.Product;
import com.sgarden.repository.OrderRepository;
import com.sgarden.repository.ProductRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;

@Service
public class AnalyticsService {

    private static final ZoneOffset ANALYTICS_ZONE = ZoneOffset.UTC;
    private static final Set<String> ITEM_COLLECTION_KEYS = Set.of("items", "products", "orderItems", "lineItems");

    private final MongoTemplate mongoTemplate;
    private final ProductRepository productRepository;
    public AnalyticsService(MongoTemplate mongoTemplate, ProductRepository productRepository, OrderRepository orderRepository) {
        this.mongoTemplate = mongoTemplate;
        this.productRepository = productRepository;
    }

    public SalesAnalyticsResponse getSalesAnalytics(String startDate, String endDate) {
        LocalDate start = parseDate(startDate, "startDate");
        LocalDate end = parseDate(endDate, "endDate");

        if (start != null && end != null && start.isAfter(end)) {
            throw new IllegalArgumentException("startDate must be before or equal to endDate");
        }

        List<Order> orders = findOrders(start, end);
        Map<String, ProductSummary> productSummaries = new LinkedHashMap<>();
        Map<String, Double> revenueByPeriod = new TreeMap<>();
        double totalRevenue = 0.0;

        Map<String, Product> productsById = loadProductsIndex(orders);

        for (Order order : orders) {
            OrderMetrics metrics = extractOrderMetrics(order, productsById);
            totalRevenue += metrics.orderRevenue;

            String period = order.getCreatedAt() != null
                    ? order.getCreatedAt().atZone(ANALYTICS_ZONE).toLocalDate().toString()
                    : "unknown";
            revenueByPeriod.merge(period, metrics.orderRevenue, Double::sum);

            for (OrderLineItem item : metrics.lineItems) {
                if (item.productKey().isBlank()) {
                    continue;
                }

                ProductSummary summary = productSummaries.computeIfAbsent(item.productKey(), key -> new ProductSummary(item.productId(), item.name()));
                summary.totalQuantity += item.quantity();
                summary.totalRevenue += item.revenue();
                if (summary.productId == null || summary.productId.isBlank()) {
                    summary.productId = item.productId();
                }
                if (summary.name == null || summary.name.isBlank()) {
                    summary.name = item.name();
                }
            }
        }

        List<TopProductResponse> topProducts = productSummaries.values().stream()
            .sorted(Comparator
                .comparingDouble(ProductSummary::getTotalRevenue).reversed()
                .thenComparing(Comparator.comparingLong(ProductSummary::getTotalQuantity).reversed()))
                .map(summary -> new TopProductResponse(
                        summary.productId,
                        summary.name,
                        summary.totalQuantity,
                        roundMoney(summary.totalRevenue)))
                .toList();

        List<RevenueByPeriodResponse> periodResponses = revenueByPeriod.entrySet().stream()
                .map(entry -> new RevenueByPeriodResponse(entry.getKey(), roundMoney(entry.getValue())))
                .toList();

        return new SalesAnalyticsResponse(
                roundMoney(totalRevenue),
                orders.size(),
                topProducts,
                periodResponses
        );
    }

    private List<Order> findOrders(LocalDate start, LocalDate end) {
        Query query = new Query();
        List<Criteria> criteria = new ArrayList<>();

        if (start != null) {
            criteria.add(Criteria.where("createdAt").gte(start.atStartOfDay(ANALYTICS_ZONE).toInstant()));
        }
        if (end != null) {
            criteria.add(Criteria.where("createdAt").lt(end.plusDays(1).atStartOfDay(ANALYTICS_ZONE).toInstant()));
        }

        if (!criteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
        }

        return mongoTemplate.find(query, Order.class);
    }

    private Map<String, Product> loadProductsIndex(List<Order> orders) {
        List<String> productIds = new ArrayList<>();
        for (Order order : orders) {
            for (OrderLineItem item : extractLineItems(order, Map.<String, Product>of())) {
                if (item.productId() != null && !item.productId().isBlank()) {
                    productIds.add(item.productId());
                }
            }
        }

        if (productIds.isEmpty()) {
            return Map.of();
        }

        Map<String, Product> index = new HashMap<>();
        for (Product product : productRepository.findAllById(productIds)) {
            index.put(product.getId(), product);
        }
        return index;
    }

    private OrderMetrics extractOrderMetrics(Order order, Map<String, Product> productsById) {
        List<OrderLineItem> lineItems = extractLineItems(order, productsById);
        double explicitTotal = readNumber(order.getAttributes(), "total", "orderTotal", "amount", "grandTotal");
        double lineTotal = lineItems.stream().mapToDouble(OrderLineItem::revenue).sum();
        double orderRevenue = explicitTotal > 0.0 ? explicitTotal : lineTotal;
        return new OrderMetrics(orderRevenue, lineItems);
    }

    private List<OrderLineItem> extractLineItems(Order order, Map<String, Product> productsById) {
        List<OrderLineItem> lineItems = new ArrayList<>();
        Map<String, Object> attributes = order.getAttributes();

        for (String key : ITEM_COLLECTION_KEYS) {
            Object rawItems = attributes == null ? null : attributes.get(key);
            if (rawItems instanceof Collection<?> collection) {
                for (Object entry : collection) {
                    if (entry instanceof Map<?, ?> map) {
                        lineItems.add(parseLineItem((Map<String, Object>) map, productsById));
                    }
                }
            }
        }

        if (!lineItems.isEmpty()) {
            return lineItems;
        }

        if (attributes != null && attributes.containsKey("productId")) {
            lineItems.add(parseLineItem(attributes, productsById));
        }

        return lineItems;
    }

    private OrderLineItem parseLineItem(Map<String, Object> rawItem, Map<String, Product> productsById) {
        String productId = readString(rawItem, "productId", "id", "sku");
        if (productId == null || productId.isBlank()) {
            Object productValue = rawItem.get("product");
            if (productValue instanceof Map<?, ?> productMap) {
                Object nestedId = productMap.get("id");
                if (nestedId != null) {
                    productId = String.valueOf(nestedId);
                }
            } else if (productValue != null) {
                productId = String.valueOf(productValue);
            }
        }

        String name = readString(rawItem, "name", "productName", "title");
        if ((name == null || name.isBlank()) && rawItem.get("product") instanceof Map<?, ?> productMap) {
            Object nestedName = productMap.get("name");
            if (nestedName != null) {
                name = String.valueOf(nestedName);
            }
        }

        if ((name == null || name.isBlank()) && productId != null && productsById.containsKey(productId)) {
            name = Optional.ofNullable(productsById.get(productId).getName()).orElse(productId);
        }

        if (name == null || name.isBlank()) {
            name = productId != null && !productId.isBlank() ? productId : "unknown";
        }

        long quantity = Math.max(1L, Math.round(readNumber(rawItem, "quantity", "qty", "count", "units")));
        double unitPrice = readNumber(rawItem, "price", "unitPrice", "unit_cost");
        double lineRevenue = readNumber(rawItem, "total", "lineTotal", "subtotal", "amount");
        if (lineRevenue <= 0.0 && unitPrice > 0.0) {
            lineRevenue = unitPrice * quantity;
        }

        return new OrderLineItem(productId, name, quantity, roundMoney(lineRevenue));
    }

    private LocalDate parseDate(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException(fieldName + " must be a valid ISO date (yyyy-MM-dd)");
        }
    }

    private String readString(Map<String, Object> source, String... keys) {
        if (source == null) {
            return null;
        }

        for (String key : keys) {
            Object value = source.get(key);
            if (value != null) {
                return String.valueOf(value);
            }
        }
        return null;
    }

    private double readNumber(Map<String, Object> source, String... keys) {
        if (source == null) {
            return 0.0;
        }

        for (String key : keys) {
            Object value = source.get(key);
            if (value instanceof Number number) {
                return number.doubleValue();
            }
            if (value != null) {
                try {
                    return Double.parseDouble(String.valueOf(value));
                } catch (NumberFormatException ignored) {
                    // Keep trying other keys.
                }
            }
        }
        return 0.0;
    }

    private double roundMoney(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private record OrderMetrics(double orderRevenue, List<OrderLineItem> lineItems) {
    }

    private record OrderLineItem(String productId, String name, long quantity, double revenue) {
        String productKey() {
            if (productId != null && !productId.isBlank()) {
                return productId;
            }
            if (name != null && !name.isBlank()) {
                return name.toLowerCase(Locale.ROOT);
            }
            return "";
        }
    }

    private static class ProductSummary {
        private String productId;
        private String name;
        private long totalQuantity;
        private double totalRevenue;

        private ProductSummary(String productId, String name) {
            this.productId = productId;
            this.name = name;
        }

        private long getTotalQuantity() {
            return totalQuantity;
        }

        private double getTotalRevenue() {
            return totalRevenue;
        }
    }
}