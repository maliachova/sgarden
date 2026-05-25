package com.sgarden.service;

import com.sgarden.exception.InvalidOrderStatusException;
import com.sgarden.model.Order;
import com.sgarden.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class OrderService {

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "pending",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled"
    );

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> getAllOrders(String status) {
        if (status == null || status.isBlank()) {
            return orderRepository.findAll();
        }

        String normalizedStatus = normalizeStatus(status);
        validateKnownStatus(normalizedStatus);
        return orderRepository.findByStatus(normalizedStatus);
    }

    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    public Order createOrder(Map<String, Object> requestBody) {
        Order order = new Order();
        order.setStatus(Order.defaultStatus());
        order.setAttributesFromRequest(requestBody);
        return orderRepository.save(order);
    }

    public Optional<Order> updateOrderStatus(String id, String requestedStatus) {
        String normalizedRequestedStatus = normalizeStatus(requestedStatus);
        validateKnownStatus(normalizedRequestedStatus);

        return orderRepository.findById(id).map(order -> {
            String currentStatus = normalizeStatus(order.getStatus());
            validateTransition(currentStatus, normalizedRequestedStatus);
            order.setStatus(normalizedRequestedStatus);
            return orderRepository.save(order);
        });
    }

    private void validateKnownStatus(String status) {
        if (!ALLOWED_STATUSES.contains(status)) {
            throw new InvalidOrderStatusException("Invalid order status: " + status);
        }
    }

    private void validateTransition(String currentStatus, String requestedStatus) {
        if (currentStatus.equals(requestedStatus)) {
            throw new InvalidOrderStatusException("Order status cannot remain unchanged");
        }

        if ("delivered".equals(currentStatus) || "cancelled".equals(currentStatus)) {
            throw new InvalidOrderStatusException("Delivered or cancelled orders cannot change status");
        }

        if ("pending".equals(currentStatus)) {
            if ("confirmed".equals(requestedStatus) || "cancelled".equals(requestedStatus)) {
                return;
            }
        } else if ("confirmed".equals(currentStatus)) {
            if ("shipped".equals(requestedStatus)) {
                return;
            }
        } else if ("shipped".equals(currentStatus)) {
            if ("delivered".equals(requestedStatus)) {
                return;
            }
        }

        throw new InvalidOrderStatusException(
                "Invalid order status transition from " + currentStatus + " to " + requestedStatus
        );
    }

    private String normalizeStatus(String status) {
        return status == null ? "" : status.trim().toLowerCase();
    }
}