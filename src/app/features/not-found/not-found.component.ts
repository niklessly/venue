import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { I18nService } from '../../core/i18n.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, TuiButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card not-found">
      <p class="eyebrow">404</p>
      <h2>{{ i18n.t('pageNotFound') }}</h2>
      <p class="muted">{{ i18n.t('pageNotFoundText') }}</p>
      <a tuiButton routerLink="/rooms">{{ i18n.t('backToRooms') }}</a>
    </section>
  `,
})
export class NotFoundComponent {
  readonly i18n = inject(I18nService);
}
