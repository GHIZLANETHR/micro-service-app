
package org.ghizlane.billingservice.dto;

public record ProductItemRequest(
        Long productId,
        int quantity
) {
}
