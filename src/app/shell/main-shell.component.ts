import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { AppStateService } from '../core/app-state.service';
import { I18nService, Language } from '../core/i18n.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TuiBadge, TuiButton],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">venue</div>
        <nav class="menu">
          <a routerLink="/rooms" routerLinkActive="active">{{ i18n.t('dashboard') }}</a>
          <a routerLink="/bookings" routerLinkActive="active">{{ i18n.t('myBookings') }}</a>
          <a routerLink="/statistics" routerLinkActive="active">{{ i18n.t('statistics') }}</a>
          <a *ngIf="isAdmin()" routerLink="/admin" routerLinkActive="active">
            {{ i18n.t('adminPanel') }}
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="language-switch" [attr.aria-label]="i18n.t('language')">
            <button
              type="button"
              [class.active]="i18n.language() === 'ru'"
              (click)="setLanguage('ru')"
            >
              RU
            </button>
            <button
              type="button"
              [class.active]="i18n.language() === 'en'"
              (click)="setLanguage('en')"
            >
              EN
            </button>
          </div>
          <button tuiButton size="s" appearance="secondary" type="button" (click)="logout()">
            {{ i18n.t('logout') }}
          </button>
        </div>
      </aside>

      <main class="content">
        <header class="topbar">
          <div>
            <p class="eyebrow">{{ i18n.t('meetingRooms') }}</p>
            <h1>{{ title }}</h1>
          </div>
          <div style="display:flex; gap: 10px; align-items:center; flex-wrap: wrap;">
            <a
              *ngIf="notificationCount() > 0"
              tuiBadge
              appearance="info"
              routerLink="/bookings"
            >
              {{ i18n.t('upcomingNotifications') }}: {{ notificationCount() }}
            </a>
            <div class="user-chip">
              <span class="chip-label">{{ i18n.t('currentUser') }}</span>
              <span>{{ userName() }}</span>
            </div>
          </div>
        </header>

        <router-outlet />
      </main>
    </div>
  `,
})
export class MainShellComponent {
  private readonly state = inject(AppStateService);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);

  readonly userName = computed(() => this.state.user()?.name ?? 'guest');
  readonly isAdmin = computed(() => this.state.user()?.role === 'admin');
  readonly notificationCount = computed(() => this.state.upcomingNotifications().length);

  get title(): string {
    const url = this.router.url;
    if (url.includes('/statistics')) {
      return this.i18n.t('statistics');
    }
    if (url.includes('/room-details')) {
      return this.i18n.t('roomDetails');
    }
    if (url.includes('/bookings')) {
      return this.i18n.t('myBookings');
    }
    if (url.includes('/admin')) {
      return this.i18n.t('adminPanel');
    }
    return this.i18n.t('availableRooms');
  }

  logout(): void {
    this.state.logout();
    void this.router.navigate(['/auth/login']);
  }

  setLanguage(language: Language): void {
    this.i18n.setLanguage(language);
  }
}
