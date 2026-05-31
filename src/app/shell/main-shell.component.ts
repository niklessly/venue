import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppStateService } from '../core/app-state.service';

@Component({
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">venue</div>
        <nav class="menu">
          <a routerLink="/rooms" routerLinkActive="active">dashboard</a>
          <a routerLink="/bookings" routerLinkActive="active">bookings</a>
          <a routerLink="/statistics" routerLinkActive="active">statistics</a>
          <a *ngIf="isAdmin()" routerLink="/admin" routerLinkActive="active">admin</a>
        </nav>
        <div class="sidebar-footer">
          <div class="muted">pink & yellow office booking prototype</div>
          <button class="btn-ghost" type="button" (click)="logout()">logout</button>
        </div>
      </aside>

      <main class="content">
        <header class="topbar">
          <div>
            <p class="eyebrow">meeting rooms</p>
            <h1>{{ title }}</h1>
          </div>
          <div class="user-chip">{{ userName() }}</div>
        </header>

        <router-outlet />
      </main>
    </div>
  `,
})
export class MainShellComponent {
    private readonly state = inject(AppStateService);
    private readonly router = inject(Router);

    readonly userName = computed(() => this.state.user()?.name ?? 'guest');
    readonly isAdmin = computed(() => this.state.user()?.role === 'admin');

    get title(): string {
        const url = this.router.url;
        if (url.includes('/statistics')) {
            return 'statistics';
        }
        if (url.includes('/room-details')) {
            return 'room details';
        }
        if (url.includes('/bookings')) {
            return 'my bookings';
        }
        if (url.includes('/admin')) {
            return 'admin panel';
        }
        return 'available rooms';
    }

    logout(): void {
        this.state.logout();
        void this.router.navigate(['/auth/login']);
    }
}