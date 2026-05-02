import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule, MatMenuModule, MatDividerModule],
  templateUrl: './customer-layout.component.html',
  styleUrl: './customer-layout.component.scss',
})
export class CustomerLayoutComponent {
  constructor(public auth: AuthService, public cart: CartService) {}

  get initials(): string {
    const name = this.auth.currentUser()?.name || '';
    return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  }
}
