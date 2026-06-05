import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiProgressBar } from '@taiga-ui/kit';
import { AppStateService } from '../../core/app-state.service';
import { Room } from '../../models';

@Component({
  standalone: true,
  imports: [CommonModule, TuiProgressBar],
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
            <div
              *ngFor="let room of rooms(); trackBy: trackByRoomId"
              style="display:grid; gap: 8px;"
            >
              <div style="display:flex; justify-content:space-between; gap: 10px;">
                <strong>{{ room.name }}</strong>
                <span>{{ usage(room.id) }} bookings</span>
              </div>
              <progress tuiProgressBar max="100" [value]="bar(room.id)"></progress>
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

  trackByRoomId(_: number, room: Room): string {
    return room.id;
  }
}
