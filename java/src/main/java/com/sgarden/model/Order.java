package com.sgarden.model;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {

    private static final String DEFAULT_STATUS = "pending";

    @Id
    private String id;

    private String status = DEFAULT_STATUS;

    @JsonIgnore
    private Map<String, Object> attributes = new LinkedHashMap<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @JsonAnyGetter
    public Map<String, Object> getAttributesForJson() {
        return attributes;
    }

    @JsonAnySetter
    public void addAttribute(String key, Object value) {
        if (key == null) {
            return;
        }

        if ("id".equals(key) || "status".equals(key) || "createdAt".equals(key) || "updatedAt".equals(key)) {
            return;
        }

        attributes.put(key, value);
    }

    public void setAttributesFromRequest(Map<String, Object> requestBody) {
        attributes.clear();
        if (requestBody == null) {
            return;
        }

        requestBody.forEach(this::addAttribute);
    }

    public static String defaultStatus() {
        return DEFAULT_STATUS;
    }
}