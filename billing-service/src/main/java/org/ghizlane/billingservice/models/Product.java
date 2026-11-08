
package org.ghizlane.billingservice.models;

import java.math.BigDecimal;

public record Product(
        String name,
        BigDecimal price,
        Integer quantity
) {
}
