
package org.ghizlane.billingservice.dto;

import org.ghizlane.billingservice.models.Customer;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BillResponse(
        Long id,
        LocalDateTime billingDate,
        Long customerId,
        Customer customer,
        BigDecimal totalAmount,
        List<ProductItemResponse> items
) {
}
