
package org.ghizlane.billingservice.clients;

import org.ghizlane.billingservice.models.Product;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "inventory-service")
public interface InventoryRestClient {

    @GetMapping("/products/{id}")
    Product findProductById(@PathVariable("id") Long id);
}
