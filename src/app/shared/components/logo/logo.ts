import { Component, computed, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-logo',
  styleUrl: './logo.css',
  templateUrl: './logo.html',
})
export class Logo {
  width = input(30);
  // logo.svg is 1332 × 729
  height = computed(() => Math.round((this.width() * 729) / 1332));
}
