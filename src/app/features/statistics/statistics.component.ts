import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppStateService } from '../../core/app-state.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="stack">
      <div class="summary-grid">
        <div class="summary-card">
          <div class="eyebrow">active bookings</div>
          <h2 style="margin:0;">{{ stats().activeBookings }}</h2>
        </div>
        <div class="summary-card">
          <div class="eyebrow">cancelled</div>
          <h2 style="margin:0;">{{ stats().cancelledBookings }}</h2>
        </div>
        <div class="summary-card">
          <div class="eyebrow">popular room</div>
          <h2 style="margin:0;">{{ stats().popularRoom }}</h2>
        </div>
        <div class="summary-card">
          <div class="eyebrow">utilization</div>
          <h2 style="margin:0;">{{ stats().utilization }}%</h2>
        </div>
      </div>

      <div class="split-layout">
        <div class="card">
          <p class="eyebrow">room usage</p>
          <div class="stack">
            <div *ngFor="let room of rooms()" style="display:grid; gap: 8px;">
              <div style="display:flex; justify-content:space-between; gap: 10px;">
                <strong>{{ room.name }}</strong>
                <span>{{ usage(room.id) }} bookings</span>
              </div>
              <div
                style="height: 12px; background: rgba(0, 0, 0, 0.06); border-radius: 999px; overflow: hidden;"
              >
                <div
                  [style.width.%]="bar(room.id)"
                  style="height: 100%; background: var(--accent-yellow);"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="aside-info">
          <div class="card">
            <p class="eyebrow">free room</p>
            <h2 style="margin:0;">{{ stats().freeRoom }}</h2>
          </div>
          <div class="card">
            <p class="eyebrow">next steps</p>
            <ul class="muted" style="margin:0; padding-left: 18px; display:grid; gap: 8px;">
              <li>check peak time slots before creating new bookings</li>
              <li>move long meetings into larger rooms</li>
              <li>keep the yellow filter strip visible on the main page</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class StatisticsComponent {
  private readonly state = inject(AppStateService);

  readonly rooms = this.state.rooms;
  readonly stats = this.state.statistics;

  usage(roomId: string): number {
    return this.state
      .bookings()
      .filter((booking) => booking.roomId === roomId && booking.status === 'active').length;
  }

  bar(roomId: string): number {
    const max = Math.max(...this.rooms().map((room) => this.usage(room.id)), 1);
    return Math.round((this.usage(roomId) / max) * 100);
  }
}
