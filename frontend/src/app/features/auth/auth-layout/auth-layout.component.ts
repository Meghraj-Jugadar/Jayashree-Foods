import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, MatIconModule],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {}
