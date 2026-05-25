package com.sgarden.controller;

import com.sgarden.dto.ErrorResponse;
import com.sgarden.exception.InvalidOrderStatusException;
import com.sgarden.model.Order;
import com.sgarden.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrders(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(orderService.getAllOrders(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable String id) {
        return orderService.getOrderById(id)
                .map(order -> ResponseEntity.ok((Object) order))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Order not found")));
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody(required = false) Map<String, Object> requestBody) {
        Order order = orderService.createOrder(requestBody);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Object statusValue = body.get("status");
        if (statusValue == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("status is required"));
        }

        try {
            return orderService.updateOrderStatus(id, String.valueOf(statusValue))
                    .map(order -> ResponseEntity.ok((Object) order))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ErrorResponse("Order not found")));
        } catch (InvalidOrderStatusException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(ex.getMessage()));
        }
    }
}