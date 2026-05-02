import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule,
    MatIconModule, MatButtonModule, MatMenuModule,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  isMobile = signal(false);
  sidenavOpen = signal(true);

  // On mobile sidenav overlays; on desktop it's side-by-side
  sidenavMode = computed(() => this.isMobile() ? 'over' : 'side');

  private bp = inject(BreakpointObserver);
  private sub!: Subscription;

  constructor(public auth: AuthService) {}

  get initials(): string {
    const name = this.auth.currentUser()?.name || '';
    return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  ngOnInit(): void {
    this.sub = this.bp.observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .subscribe(result => {
        this.isMobile.set(result.matches);
        // Auto-close on mobile, auto-open on desktop
        this.sidenavOpen.set(!result.matches);
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleSidenav(): void {
    this.sidenavOpen.set(!this.sidenavOpen());
  }

  // Close sidenav after nav on mobile
  onNavClick(): void {
    if (this.isMobile()) this.sidenavOpen.set(false);
  }
}
