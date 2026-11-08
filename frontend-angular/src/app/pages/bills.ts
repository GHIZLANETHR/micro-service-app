
import {
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ApiService,
  Customer,
  Product,
  Bill,
  BillRequest
} from '../services/api.service';

interface SelectedItem {
  productId: number;
  quantity: number;
}

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-heading">
      <div>
        <h1>Gestion des factures</h1>
        <p>Créer et consulter les factures clients</p>
      </div>

      <button class="btn-secondary" (click)="load()">
        Actualiser
      </button>
    </div>

    @if (message()) {
      <div class="alert-success">{{ message() }}</div>
    }

    @if (error()) {
      <div class="alert-error">{{ error() }}</div>
    }

    <div class="panel">

      <h2>Nouvelle facture</h2>

      <div class="form-field">
        <label>Client</label>

        <select
          name="customerId"
          [(ngModel)]="customerId"
        >
          <option [ngValue]="null">
            Sélectionner un client
          </option>

          @for (c of customers(); track c.id) {
            <option [ngValue]="c.id">
              {{ c.name }}
            </option>
          }
        </select>
      </div>

      <h3>Ajouter un produit</h3>

      <div class="form-grid">
        <div class="form-field">
          <label>Produit</label>

          <select
            name="productId"
            [(ngModel)]="productId"
          >
            <option [ngValue]="null">
              Sélectionner un produit
            </option>

            @for (p of products(); track p.id) {
              <option [ngValue]="p.id">
                {{ p.name }} — {{ p.price }} MAD
              </option>
            }
          </select>
        </div>

        <div class="form-field">
          <label>Quantité</label>

          <input
            type="number"
            name="quantity"
            [(ngModel)]="quantity"
            min="1"
            step="1"
          />
        </div>

        <div class="form-action">
          <button
            type="button"
            (click)="addItem()"
          >
            Ajouter à la facture
          </button>
        </div>
      </div>

      <h3>Produits de la facture</h3>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix</th>
              <th>Montant</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            @for (item of items(); track item.productId) {
              <tr>
                <td>{{ productName(item.productId) }}</td>
                <td>{{ item.quantity }}</td>
                <td>
                  {{ productPrice(item.productId) }} MAD
                </td>
                <td>
                  {{
                    productPrice(item.productId) *
                    item.quantity | number:'1.2-2'
                  }}
                  MAD
                </td>
                <td>
                  <button
                    type="button"
                    class="btn-danger"
                    (click)="removeItem(item.productId)"
                  >
                    Retirer
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty">
                  Aucun produit ajouté
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="bill-total">
        <span>Total estimé :</span>
        <strong>
          {{ estimatedTotal() | number:'1.2-2' }} MAD
        </strong>
      </div>

      <button
        type="button"
        (click)="createBill()"
        [disabled]="saving() || customerId === null || items().length === 0"
      >
        {{ saving() ? 'Enregistrement...' : 'Créer la facture' }}
      </button>

    </div>

    <div class="panel">

      <div class="panel-header">
        <h2>Historique des factures</h2>

        <span class="count-badge">
          {{ bills().length }} factures
        </span>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Client</th>
              <th>Date</th>
              <th>Montant</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            @for (b of bills(); track b.id) {
              <tr>
                <td>#{{ b.id }}</td>
                <td>{{ b.customer.name }}</td>
                <td>
                  {{ b.billingDate | date:'dd/MM/yyyy' }}
                </td>
                <td>
                  {{ b.totalAmount | number:'1.2-2' }}
                  MAD
                </td>
                <td>
                  <button
                    class="btn-secondary"
                    (click)="selectedBill.set(b)"
                  >
                    Détails
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty">
                  Aucune facture enregistrée
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

    </div>

    @if (selectedBill(); as bill) {
      <div class="panel">

        <div class="panel-header">
          <h2>Détail de la facture #{{ bill.id }}</h2>

          <button
            class="btn-secondary"
            (click)="selectedBill.set(null)"
          >
            Fermer
          </button>
        </div>

        <p>
          <strong>Client :</strong>
          {{ bill.customer.name }}
        </p>

        <p>
          <strong>Email :</strong>
          {{ bill.customer.email }}
        </p>

        <p>
          <strong>Date :</strong>
          {{ bill.billingDate | date:'dd/MM/yyyy HH:mm' }}
        </p>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Montant</th>
              </tr>
            </thead>

            <tbody>
              @for (item of bill.items; track $index) {
                <tr>
                  <td>{{ item.productName }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.unitPrice }} MAD</td>
                  <td>{{ item.amount }} MAD</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="bill-total">
          <strong>Total :</strong>
          <strong>
            {{ bill.totalAmount | number:'1.2-2' }}
            MAD
          </strong>
        </div>

      </div>
    }
  `
})
export class Bills implements OnInit {

  private api = inject(ApiService);

  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);
  bills = signal<Bill[]>([]);

  items = signal<SelectedItem[]>([]);
  selectedBill = signal<Bill | null>(null);

  message = signal('');
  error = signal('');
  saving = signal(false);

  customerId: number | null = null;
  productId: number | null = null;
  quantity = 1;

  estimatedTotal = computed(() =>
    this.items().reduce(
      (total, item) =>
        total +
        this.productPrice(item.productId) *
        item.quantity,
      0
    )
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getCustomers().subscribe({
      next: data => this.customers.set(data),
      error: () => this.error.set(
        'Erreur de chargement des clients.'
      )
    });

    this.api.getProducts().subscribe({
      next: data => this.products.set(data),
      error: () => this.error.set(
        'Erreur de chargement des produits.'
      )
    });

    this.api.getBills().subscribe({
      next: data => this.bills.set(data),
      error: () => this.error.set(
        'Erreur de chargement des factures.'
      )
    });
  }

  productName(id: number): string {
    return this.products().find(p => p.id === id)?.name
      ?? 'Produit inconnu';
  }

  productPrice(id: number): number {
    return this.products().find(p => p.id === id)?.price
      ?? 0;
  }

  addItem(): void {
    if (
      this.productId === null ||
      !Number.isInteger(this.quantity) ||
      this.quantity <= 0
    ) {
      this.error.set('Produit ou quantité invalide.');
      return;
    }

    const id = this.productId;
    const product = this.products().find(p => p.id === id);

    if (!product) {
      this.error.set('Produit introuvable.');
      return;
    }

    const existing = this.items().find(
      item => item.productId === id
    );

    const newQuantity =
      (existing?.quantity ?? 0) + this.quantity;

    if (newQuantity > product.quantity) {
      this.error.set(
        `Stock insuffisant pour ${product.name}.`
      );
      return;
    }

    if (existing) {
      this.items.update(list =>
        list.map(item =>
          item.productId === id
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } else {
      this.items.update(list => [
        ...list,
        {
          productId: id,
          quantity: this.quantity
        }
      ]);
    }

    this.error.set('');
    this.productId = null;
    this.quantity = 1;
  }

  removeItem(productId: number): void {
    this.items.update(list =>
      list.filter(item => item.productId !== productId)
    );
  }

  createBill(): void {
    if (
      this.customerId === null ||
      this.items().length === 0
    ) {
      this.error.set(
        'Sélectionnez un client et au moins un produit.'
      );
      return;
    }

    const request: BillRequest = {
      customerId: this.customerId,
      items: this.items()
    };

    this.saving.set(true);

    this.api.addBill(request).subscribe({
      next: bill => {
        this.message.set(
          `Facture #${bill.id} créée avec succès.`
        );

        this.error.set('');
        this.items.set([]);
        this.customerId = null;
        this.selectedBill.set(bill);
        this.saving.set(false);

        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.error.set(
          `Création refusée (HTTP ${err.status}). Vérifiez les données et le stock.`
        );
      }
    });
  }
}
