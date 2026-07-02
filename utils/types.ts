/** Tipos compartidos para Data Driven Testing. */

export interface LoginCase {
  caso: string;
  username: string;
  password: string;
  esperado: 'success' | 'error';
  mensajeError?: string;
}

export interface CheckoutCustomer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface CheckoutCase {
  caso: string;
  cliente: Partial<CheckoutCustomer>;
  esperado: 'success' | 'error';
  mensajeError?: string;
}

export interface SeoPage {
  nombre: string;
  path: string;
  requiereLogin: boolean;
}
