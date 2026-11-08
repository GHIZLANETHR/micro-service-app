
package org.ghizlane.billingservice.services;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.ghizlane.billingservice.clients.CustomerRestClient;
import org.ghizlane.billingservice.clients.InventoryRestClient;
import org.ghizlane.billingservice.dto.*;
import org.ghizlane.billingservice.entities.Bill;
import org.ghizlane.billingservice.entities.ProductItem;
import org.ghizlane.billingservice.models.Customer;
import org.ghizlane.billingservice.models.Product;
import org.ghizlane.billingservice.repositories.BillRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final BillRepository billRepository;
    private final CustomerRestClient customerClient;
    private final InventoryRestClient inventoryClient;

    @Transactional
    public BillResponse createBill(CreateBillRequest request) {

        if (request == null || request.customerId() == null ||
                request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Client et produits obligatoires"
            );
        }

        Customer customer = getCustomer(request.customerId());

        Bill bill = new Bill();
        bill.setCustomerId(request.customerId());
        bill.setBillingDate(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;

        for (ProductItemRequest itemRequest : request.items()) {

            if (itemRequest == null ||
                    itemRequest.productId() == null ||
                    itemRequest.quantity() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Produit ou quantité invalide"
                );
            }

            Product product = getProduct(itemRequest.productId());

            if (product.price() == null ||
                    product.price().signum() < 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Prix du produit invalide"
                );
            }

            if (product.quantity() != null &&
                    itemRequest.quantity() > product.quantity()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Stock insuffisant pour le produit " +
                                itemRequest.productId()
                );
            }

            ProductItem item = new ProductItem();
            item.setProductId(itemRequest.productId());
            item.setQuantity(itemRequest.quantity());
            item.setUnitPrice(product.price());

            bill.addProductItem(item);

            BigDecimal amount = product.price().multiply(
                    BigDecimal.valueOf(itemRequest.quantity())
            );

            total = total.add(amount);
        }

        bill.setTotalAmount(total);

        Bill savedBill = billRepository.saveAndFlush(bill);

        return toResponse(savedBill, customer);
    }

    @Transactional(readOnly = true)
    public BillResponse getBill(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Facture introuvable"
                ));

        return toResponse(bill, getCustomer(bill.getCustomerId()));
    }

    @Transactional(readOnly = true)
    public List<BillResponse> getAllBills() {
        return billRepository.findAll().stream()
                .map(bill -> toResponse(
                        bill,
                        getCustomer(bill.getCustomerId())
                ))
                .toList();
    }

    private Customer getCustomer(Long id) {
        try {
            return customerClient.findCustomerById(id);
        } catch (FeignException.NotFound e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Client introuvable : " + id
            );
        }
    }

    private Product getProduct(Long id) {
        try {
            return inventoryClient.findProductById(id);
        } catch (FeignException.NotFound e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Produit introuvable : " + id
            );
        }
    }

    private BillResponse toResponse(Bill bill, Customer customer) {

        List<ProductItemResponse> items =
                bill.getProductItems().stream().map(item -> {

                    Product product = getProduct(item.getProductId());

                    BigDecimal amount = item.getUnitPrice().multiply(
                            BigDecimal.valueOf(item.getQuantity())
                    );

                    return new ProductItemResponse(
                            item.getProductId(),
                            product.name(),
                            item.getQuantity(),
                            item.getUnitPrice(),
                            amount
                    );
                }).toList();

        return new BillResponse(
                bill.getId(),
                bill.getBillingDate(),
                bill.getCustomerId(),
                customer,
                bill.getTotalAmount(),
                items
        );
    }
}
