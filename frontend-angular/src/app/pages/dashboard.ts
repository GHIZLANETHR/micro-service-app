
import {
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  ApiService,
  Bill
} from "../services/api.service";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-heading">
      <div>
        <h1>Tableau de bord</h1>
        <p>Vue générale de votre activité commerciale</p>
      </div>
      <button class="btn-secondary" (click)="load()">
        Actualiser
      </button>
    </div>

    @if (error()) {
      <div class="alert-error">{{ error() }}</div>
    }

    <div class="stats-grid">

      <div class="stat-card">
        <span>Total clients</span>
        <strong>{{ customerCount() }}</strong>
        <small>Clients enregistrés</small>
      </div>

      <div class="stat-card">
        <span>Total produits</span>
        <strong>{{ productCount() }}</strong>
        <small>Produits disponibles</small>
      </div>

      <div class="stat-card">
        <span>Total factures</span>
        <strong>{{ bills().length }}</strong>
        <small>Factures créées</small>
      </div>

      <div class="stat-card">
        <span>Montant facturé</span>
        <strong>
          {{ totalAmount() | number:'1.2-2' }}
        </strong>
        <small>MAD</small>
      </div>

    </div>

    <div class="panel">

      <div class="panel-header">
        <h2>Dernières factures</h2>
        <a routerLink="/bills" class="text-link">
          Voir les factures
        </a>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Numéro</th>
              <th>Client</th>
              <th>Date</th>
              <th>Montant</th>
            </tr>
          </thead>

          <tbody>
            @for (bill of recentBills(); track bill.id) {
              <tr>
                <td>#{{ bill.id }}</td>
                <td>{{ bill.customer.name }}</td>
                <td>
                  {{ bill.billingDate | date:'dd/MM/yyyy' }}
                </td>
                <td>
                  {{ bill.totalAmount | number:'1.2-2' }}
                  MAD
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="empty">
                  Aucune facture disponible
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

    </div>
  `
})
export class Dashboard implements OnInit {

  private api = inject(ApiService);

  customerCount = signal(0);
  productCount = signal(0);
  bills = signal<Bill[]>([]);
  error = signal('');

  totalAmount = computed(() =>
    this.bills().reduce(
      (total, bill) => total + bill.totalAmount,
      0
    )
  );

  recentBills = computed(() =>
    [...this.bills()]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5)
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error.set('');

    this.api.getCustomers().subscribe({
      next: data => this.customerCount.set(data.length),
      error: () => this.error.set(
        'Impossible de charger les clients.'
      )
    });

    this.api.getProducts().subscribe({
      next: data => this.productCount.set(data.length),
      error: () => this.error.set(
        'Impossible de charger les produits.'
      )
    });

    this.api.getBills().subscribe({
      next: data => this.bills.set(data),
      error: () => this.error.set(
        'Impossible de charger les factures.'
      )
    });
  }
}
