
import { Routes } from '@angular/router';

// @ts-ignore
import { Dashboard } from './pages/dashboard';
// @ts-ignore
import { Customers } from './pages/customers';
// @ts-ignore
import { Products } from './pages/products';
// @ts-ignore
import { Bills } from './pages/bills';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Tableau de bord'
  },
  {
    path: 'customers',
    component: Customers,
    title: 'Gestion des clients'
  },
  {
    path: 'products',
    component: Products,
    title: 'Gestion des produits'
  },
  {
    path: 'bills',
    component: Bills,
    title: 'Gestion des factures'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
