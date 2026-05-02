import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
})
export class AdminCustomersComponent implements OnInit {
  users: User[] = [];
  search = '';
  page = 1;
  limit = 12;
  total = 0;
  selected: User | null = null;
  searchFocused = false;

  get activeCount(): number { return this.users.filter(u => u.isActive).length; }

  constructor(private userService: UserService, private toast: ToastService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.userService.getUsers({ page: this.page, limit: this.limit, search: this.search, role: 'customer' })
      .subscribe(res => { this.users = res.data; this.total = res.pagination.total; });
  }

  onSearch(): void { this.page = 1; this.load(); }

  get pageStart(): number { return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1; }
  get pageEnd(): number   { return Math.min(this.page * this.limit, this.total); }

  prevPage(): void { if (this.page > 1) { this.page--; this.load(); } }
  nextPage(): void { if (this.pageEnd < this.total) { this.page++; this.load(); } }

  select(user: User): void {
    this.selected = this.selected?.id === user.id ? null : user;
  }

  toggleStatus(user: User): void {
    this.userService.toggleStatus(user.id).subscribe({
      next: (res) => {
        user.isActive = res.data.isActive;
        if (this.selected?.id === user.id) this.selected = { ...user };
        this.toast.success(`Customer ${res.data.isActive ? 'activated' : 'deactivated'}`);
      },
      error: () => this.toast.error('Failed to update status'),
    });
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
}
