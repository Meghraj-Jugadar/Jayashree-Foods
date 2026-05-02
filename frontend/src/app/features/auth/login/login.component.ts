import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../../core/services/toast.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPass = false;

  get isPhone(): boolean {
    const v: string = this.form?.get('identifier')?.value || '';
    return /^[\d\s\-+]+$/.test(v) && v.trim().length > 0;
  }

  private identifierValidator = (c: AbstractControl): ValidationErrors | null => {
    const v: string = (c.value || '').trim();
    if (!v) return null;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const phoneOk = /^[+]?[\d\s\-]{7,15}$/.test(v);
    return emailOk || phoneOk ? null : { invalidIdentifier: true };
  };

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private toast: ToastService) {
    this.form = this.fb.group({
      identifier: ['', [Validators.required, this.identifierValidator]],
      password:   ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        this.loading = false;
        const role = res.data.user.role.name;
        this.router.navigate([role === 'admin' ? '/admin/dashboard' : '/customer/products']);
      },
      error: (err) => { this.loading = false; this.toast.error(err.error?.message || 'Login failed'); },
    });
  }
}
