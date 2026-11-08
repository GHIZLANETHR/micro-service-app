package org.ghizlane.inventoryservice.repositories;

import org.ghizlane.inventoryservice.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "products")
public interface ProductRepository
        extends JpaRepository<Product, Long> {
}