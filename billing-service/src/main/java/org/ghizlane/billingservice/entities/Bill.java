
package org.ghizlane.billingservice.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime billingDate;

    private Long customerId;

    @Column(precision = 19, scale = 2)
    private BigDecimal totalAmount;

    @OneToMany(
            mappedBy = "bill",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ProductItem> productItems = new ArrayList<>();

    public void addProductItem(ProductItem item) {
        productItems.add(item);
        item.setBill(this);
    }
}
