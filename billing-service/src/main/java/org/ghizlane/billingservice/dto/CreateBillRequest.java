
package org.ghizlane.billingservice.dto;

import java.util.List;

public record CreateBillRequest(
        Long customerId,
        List<ProductItemRequest> items
) {
}
