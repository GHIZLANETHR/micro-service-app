
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface Customer {
  id: number;
  name: string;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface BillItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Bill {
  id: number;
  billingDate: string;
  customerId: number;
  customer: {
    name: string;
    email: string;
  };
  totalAmount: number;
  items: BillItem[];
}

export interface BillRequest {
  customerId: number;
  items: {
    productId: number;
    quantity: number;
  }[];
}

interface HalResource {
  id?: number;
  _links?: {
    self?: {
      href: string;
    };
  };
}

interface HalResponse<T> {
  _embedded?: Record<string, T[]>;
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private http = inject(HttpClient);

  private readonly baseUrl = '/api';
  private extractId(resource: HalResource): number {
    if (resource.id != null) {
      return resource.id;
    }

    const href = resource._links?.self?.href ?? '';
    const withoutQuery = href.split('?')[0];

    return Number(
      withoutQuery.substring(
        withoutQuery.lastIndexOf('/') + 1
      )
    );
  }

  // CLIENTS

  getCustomers(): Observable<Customer[]> {
    return this.http.get<HalResponse<Customer & HalResource>>(
      `${this.baseUrl}/customers?size=100`
    ).pipe(
      map(response =>
        (response._embedded?.['customers'] ?? []).map(c => ({
          id: this.extractId(c),
          name: c.name,
          email: c.email
        }))
      )
    );
  }

  addCustomer(data: Omit<Customer, 'id'>) {
    return this.http.post(
      `${this.baseUrl}/customers`,
      data
    );
  }

  // PRODUITS

  getProducts(): Observable<Product[]> {
    return this.http.get<HalResponse<Product & HalResource>>(
      `${this.baseUrl}/products?size=100`
    ).pipe(
      map(response =>
        (response._embedded?.['products'] ?? []).map(p => ({
          id: this.extractId(p),
          name: p.name,
          price: p.price,
          quantity: p.quantity
        }))
      )
    );
  }

  addProduct(data: Omit<Product, 'id'>) {
    return this.http.post(
      `${this.baseUrl}/products`,
      data
    );
  }

  // FACTURES

  getBills(): Observable<Bill[]> {
    return this.http.get<Bill[]>(
      `${this.baseUrl}/bills`
    );
  }

  getBillById(id: number): Observable<Bill> {
    return this.http.get<Bill>(
      `${this.baseUrl}/bills/${id}`
    );
  }

  addBill(data: BillRequest): Observable<Bill> {
    return this.http.post<Bill>(
      `${this.baseUrl}/bills`,
      data
    );
  }
}
