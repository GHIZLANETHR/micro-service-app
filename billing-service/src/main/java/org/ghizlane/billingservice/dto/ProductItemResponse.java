
package org.ghizlane.billingservice.dto;

import java.math.BigDecimal;

public record ProductItemResponse(
        Long productId,
        String productName,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal amount
) {
}
