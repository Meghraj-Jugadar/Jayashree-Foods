import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

const BASE: MatSnackBarConfig = {
  horizontalPosition: 'center',
  verticalPosition: 'top',
  duration: 3000,
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private snack: MatSnackBar) {}

  success(msg: string): void {
    this.snack.open(msg, '✕', { ...BASE, panelClass: ['toast-success'] });
  }

  error(msg: string): void {
    this.snack.open(msg, '✕', { ...BASE, duration: 4000, panelClass: ['toast-error'] });
  }

  info(msg: string): void {
    this.snack.open(msg, '✕', { ...BASE, panelClass: ['toast-info'] });
  }
}
