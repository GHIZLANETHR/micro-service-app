
import {
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  ApiService,
  Customer
} from '../services/api.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-heading">
      <div>
        <h1>Gestion des clients</h1>
        <p>Ajouter et consulter vos clients</p>
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
      <h2>Ajouter un client</h2>

      <form
        class="form-grid"
        #customerForm="ngForm"
        (ngSubmit)="addCustomer()"
      >
        <div class="form-field">
          <label>Nom complet</label>
          <input
            type="text"
            name="name"
            [(ngModel)]="name"
            placeholder="Ahmed Benali"
            required
          />
        </div>

        <div class="form-field">
          <label>Adresse email</label>
          <input
            type="email"
            name="email"
            [(ngModel)]="email"
            placeholder="ahmed@gmail.com"
            required
            email
          />
        </div>

        <div class="form-action">
          <button
            type="submit"
            [disabled]="customerForm.invalid"
          >
            Ajouter le client
          </button>
        </div>
      </form>
    </div>

    <div class="panel">

      <div class="panel-header">
        <h2>Liste des clients</h2>
        <span class="count-badge">
          {{ filteredCustomers().length }} clients
        </span>
      </div>

      <input
        class="search-input"
        name="search"
        [ngModel]="search()"
        (ngModelChange)="search.set($event)"
        placeholder="Rechercher un client..."
      />

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom complet</th>
              <th>Email</th>
            </tr>
          </thead>

          <tbody>
            @for (c of filteredCustomers(); track c.id) {
              <tr>
                <td>#{{ c.id }}</td>
                <td><strong>{{ c.name }}</strong></td>
                <td>{{ c.email }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="3" class="empty">
                  Aucun client trouvé
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

    </div>
  `
})
export class Customers implements OnInit {

  private api = inject(ApiService);

  customers = signal<Customer[]>([]);
  search = signal('');
  message = signal('');
  error = signal('');

  name = '';
  email = '';

  filteredCustomers = computed(() => {
    const term = this.search().toLowerCase();

    return this.customers().filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getCustomers().subscribe({
      next: data => this.customers.set(data),
      error: () => this.error.set(
        'Impossible de récupérer les clients.'
      )
    });
  }

  addCustomer(): void {
    if (!this.name.trim() || !this.email.trim()) {
      this.error.set('Nom et email obligatoires.');
      return;
    }

    this.api.addCustomer({
      name: this.name,
      email: this.email
    }).subscribe({
      next: () => {
        this.name = '';
        this.email = '';

        this.message.set('Client ajouté avec succès.');
        this.error.set('');

        this.load();
      },
      error: () => this.error.set(
        "Erreur lors de l'ajout du client."
      )
    });
  }
}
