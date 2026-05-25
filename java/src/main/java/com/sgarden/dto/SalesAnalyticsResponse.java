package com.sgarden.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class SalesAnalyticsResponse {
    private double totalRevenue;
    private long totalOrders;
    private List<TopProductResponse> topProducts;
    private List<RevenueByPeriodResponse> revenueByPeriod;
}