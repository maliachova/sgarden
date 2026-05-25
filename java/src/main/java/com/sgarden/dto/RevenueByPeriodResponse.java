package com.sgarden.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RevenueByPeriodResponse {
    private String period;
    private double totalRevenue;
}