import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { AddressService } from '../../../core/services/address.service';
import { ToastService } from '../../../core/services/toast.service';
import { Address } from '../../../core/models/address.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  addressForm!: FormGroup;

  addresses: Address[] = [];
  editingId: number | null = null;
  showForm = false;
  activeTab: 'info' | 'addresses' | 'password' = 'info';
  showCurrent = false;
  showNew = false;

  readonly labels = ['Home', 'Work', 'Other'];

  get initials(): string {
    const name = this.auth.currentUser()?.name || '';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  constructor(
    public auth: AuthService,
    private addressService: AddressService,
    private fb: FormBuilder,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser();
    this.profileForm = this.fb.group({
      name: [user?.name || '', Validators.required],
      email: [{ value: user?.email || '', disabled: true }],
      phone: [user?.phone || ''],
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.buildAddressForm();
    this.loadAddresses();
  }

  buildAddressForm(addr?: Address): void {
    this.addressForm = this.fb.group({
      label:     [addr?.label || 'Home'],
      fullName:  [addr?.fullName || '', Validators.required],
      phone:     [addr?.phone || '', Validators.required],
      line1:     [addr?.line1 || '', Validators.required],
      line2:     [addr?.line2 || ''],
      city:      [addr?.city || '', Validators.required],
      state:     [addr?.state || '', Validators.required],
      pincode:   [addr?.pincode || '', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      isDefault: [addr?.isDefault || false],
    });
  }

  loadAddresses(): void {
    this.addressService.getAddresses().subscribe(res => this.addresses = res.data);
  }

  openAdd(): void { this.editingId = null; this.buildAddressForm(); this.showForm = true; }

  openEdit(addr: Address): void { this.editingId = addr.id; this.buildAddressForm(addr); this.showForm = true; }

  cancelForm(): void { this.showForm = false; this.editingId = null; }

  saveAddress(): void {
    if (this.addressForm.invalid) return;
    const data = this.addressForm.value;
    const req = this.editingId
      ? this.addressService.updateAddress(this.editingId, data)
      : this.addressService.createAddress(data);
    req.subscribe({
      next: () => {
        this.toast.success(this.editingId ? 'Address updated' : 'Address added');
        this.showForm = false;
        this.editingId = null;
        this.loadAddresses();
      },
      error: (err) => this.toast.error(err.error?.message || 'Failed to save address'),
    });
  }

  deleteAddress(id: number): void {
    this.addressService.deleteAddress(id).subscribe({
      next: () => { this.toast.success('Address removed'); this.loadAddresses(); },
      error: () => this.toast.error('Failed to remove address'),
    });
  }

  setDefault(id: number): void {
    this.addressService.setDefault(id).subscribe({
      next: () => { this.toast.success('Default address updated'); this.loadAddresses(); },
      error: () => this.toast.error('Failed to update default'),
    });
  }

  saveProfile(): void {
    this.auth.updateProfile(this.profileForm.value).subscribe({
      next: () => this.toast.success('Profile updated'),
      error: () => this.toast.error('Failed to update profile'),
    });
  }

  changePassword(): void {
    this.auth.changePassword(this.passwordForm.value).subscribe({
      next: () => { this.toast.success('Password changed'); this.passwordForm.reset(); },
      error: (err) => this.toast.error(err.error?.message || 'Failed'),
    });
  }
}
