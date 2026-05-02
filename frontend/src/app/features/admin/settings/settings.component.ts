import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class AdminSettingsComponent implements OnInit {
  form!: FormGroup;
  saving = false;

  get addressPreview(): string {
    const v = this.form?.value;
    if (!v) return '';
    return [v.factory_line1, v.factory_line2, v.factory_city, v.factory_state, v.factory_pincode]
      .filter(Boolean).join(', ');
  }

  constructor(private fb: FormBuilder, private http: HttpClient, private toast: ToastService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      factory_name:    [''],
      factory_phone:   [''],
      factory_email:   [''],
      factory_line1:   [''],
      factory_line2:   [''],
      factory_city:    [''],
      factory_state:   [''],
      factory_pincode: [''],
      currency:        ['INR'],
      tax_rate:        [18],
    });
    this.http.get<any>(`${environment.apiUrl}/settings`).subscribe(res => {
      if (res.data) this.form.patchValue(res.data);
    });
  }

  save(): void {
    const val = this.form.value;
    const factory_address = this.addressPreview;
    const payload = { ...val, factory_address };
    this.saving = true;
    this.http.put<any>(`${environment.apiUrl}/settings`, payload).subscribe({
      next: () => { this.saving = false; this.toast.success('Settings saved'); },
      error: () => { this.saving = false; this.toast.error('Failed to save settings'); },
    });
  }
}
