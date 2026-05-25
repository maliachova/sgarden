package com.sgarden.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopProductResponse {
    private String productId;
    private String name;
    private long totalQuantity;
    private double totalRevenue;
}