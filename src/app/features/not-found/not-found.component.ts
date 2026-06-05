import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, TuiButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card not-found">
      <p class="eyebrow">404</p>
      <h2>page not found</h2>
      <p class="muted">The requested screen is not part of the booking workspace.</p>
      <a tuiButton routerLink="/rooms">back to rooms</a>
    </section>
  `,
})
export class NotFoundComponent {}
