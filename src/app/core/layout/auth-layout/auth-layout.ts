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
      title: 'Easy Order Management',
      text: 'Manage orders efficiently with intuitive interface',
    },
    {
      icon: 'hgi-analytics-01',
      title: 'Real-time Analytics',
      text: 'Track sales and performance in real-time',
    },
    {
      icon: 'hgi-security-check',
      title: 'Secure & Reliable',
      text: 'Enterprise-grade security for your business',
    },
  ];
}
