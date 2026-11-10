import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Logo } from '../../../shared/components/logo/logo';

@Component({
  imports: [RouterOutlet, Logo],
  selector: 'app-auth-layout',
  styleUrl: './auth-layout.css',
  host: { class: 'block min-h-screen bg-[#f4f5f4]' },
  templateUrl: './auth-layout.html',
})
export class AuthLayout {
  year = new Date().getFullYear();

  features = [
    {
      icon: 'hgi-restaurant-01',
      title: 'Easy order management',
      text: 'Manage orders efficiently with an intuitive interface',
    },
    {
      icon: 'hgi-analytics-01',
      title: 'Real-time analytics',
      text: 'Track sales and performance as they happen',
    },
    {
      icon: 'hgi-security-check',
      title: 'Secure & reliable',
      text: 'Enterprise-grade security for your business',
    },
  ];
}
