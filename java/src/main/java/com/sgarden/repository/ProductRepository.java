package com.sgarden.repository;

import com.sgarden.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    List<Product> findByCategory(String category);

    List<Product> findByNameContainingIgnoreCase(String name);

    // Expose pageable findAll so sorting and paging applied by PageRequest are supported
    Page<Product> findAll(Pageable pageable);
}
