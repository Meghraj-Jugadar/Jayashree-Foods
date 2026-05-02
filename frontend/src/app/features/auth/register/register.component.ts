import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../../core/services/toast.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  showPass = false;
  showConfirm = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private toast: ToastService) {
    this.form = this.fb.group({
      name:            ['', Validators.required],
      email:           ['', [Validators.required, Validators.email]],
      phone:           [''],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatch });
  }

  private passwordMatch(g: AbstractControl): ValidationErrors | null {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const { confirmPassword, ...payload } = this.form.value;
    this.auth.register(payload).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/customer/products']); },
      error: (err) => { this.loading = false; this.toast.error(err.error?.message || 'Registration failed'); },
    });
  }
}
