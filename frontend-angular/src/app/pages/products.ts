
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

import {
  ApiService,
  Product
} from '../services/api.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="page-heading">
      <div>
        <h1>Gestion des produits</h1>
        <p>Catalogue et gestion des stocks</p>
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

      <h2>Ajouter un produit</h2>

      <form
        class="form-grid"
        #productForm="ngForm"
        (ngSubmit)="addProduct()"
      >

        <div class="form-field">
          <label>Nom du produit</label>

          <input
            name="name"
            [(ngModel)]="name"
            placeholder="Ordinateur HP"
            required
          />
        </div>

        <div class="form-field">
          <label>Prix (MAD)</label>

          <input
            type="number"
            name="price"
            [(ngModel)]="price"
            min="0"
            required
          />
        </div>

        <div class="form-field">
          <label>Quantité en stock</label>

          <input
            type="number"
            name="quantity"
            [(ngModel)]="quantity"
            min="0"
            step="1"
            required
          />
        </div>

        <div class="form-action">
          <button
            type="submit"
            [disabled]="productForm.invalid"
          >
            Ajouter le produit
          </button>
        </div>

      </form>
    </div>

    <div class="panel">

      <div class="panel-header">
        <h2>Catalogue des produits</h2>
        <span class="count-badge">
          {{ products().length }} produits
        </span>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Produit</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>Disponibilité</th>
            </tr>
          </thead>

          <tbody>
            @for (p of products(); track p.id) {
              <tr>
                <td>#{{ p.id }}</td>
                <td><strong>{{ p.name }}</strong></td>
                <td>
                  {{ p.price | number:'1.2-2' }} MAD
                </td>
                <td>{{ p.quantity }}</td>
                <td>
                  @if (p.quantity > 0) {
                    <span class="status-success">
                      Disponible
                    </span>
                  } @else {
                    <span class="status-danger">
                      Rupture de stock
                    </span>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty">
                  Aucun produit disponible
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

    </div>
  `
})
export class Products implements OnInit {

  private api = inject(ApiService);

  products = signal<Product[]>([]);
  message = signal('');
  error = signal('');

  name = '';
  price = 0;
  quantity = 1;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getProducts().subscribe({
      next: data => this.products.set(data),
      error: () => this.error.set(
        'Impossible de récupérer les produits.'
      )
    });
  }

  addProduct(): void {
    if (
      !this.name.trim() ||
      this.price < 0 ||
      !Number.isInteger(this.quantity) ||
      this.quantity < 0
    ) {
      this.error.set('Données invalides.');
      return;
    }

    this.api.addProduct({
      name: this.name,
      price: this.price,
      quantity: this.quantity
    }).subscribe({
      next: () => {
        this.name = '';
        this.price = 0;
        this.quantity = 1;

        this.message.set('Produit ajouté avec succès.');
        this.error.set('');

        this.load();
      },
      error: () => this.error.set(
        "Erreur lors de l'ajout du produit."
      )
    });
  }
}
