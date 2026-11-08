
package org.ghizlane.billingservice.controllers;

import lombok.RequiredArgsConstructor;
import org.ghizlane.billingservice.dto.BillResponse;
import org.ghizlane.billingservice.dto.CreateBillRequest;
import org.ghizlane.billingservice.services.BillingService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bills")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BillResponse createBill(
            @RequestBody CreateBillRequest request) {
        return billingService.createBill(request);
    }

    @GetMapping
    public List<BillResponse> getAllBills() {
        return billingService.getAllBills();
    }

    @GetMapping("/{id}")
    public BillResponse getBill(@PathVariable Long id) {
        return billingService.getBill(id);
    }
}
