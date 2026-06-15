import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiProgressBar } from '@taiga-ui/kit';
import { AppStateService } from '../../core/app-state.service';
import { I18nService } from '../../core/i18n.service';
import { Booking, Room } from '../../models';

@Component({
  standalone: true,
  imports: [CommonModule, TuiProgressBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="stack">
      <div class="summary-grid">
        <div class="summary-card">
          <div class="eyebrow">{{ i18n.t('activeBookings') }}</div>
          <h2 style="margin:0;">{{ stats().activeBookings }}</h2>
        </div>
        <div class="summary-card">
          <div class="eyebrow">{{ i18n.t('cancelled') }}</div>
          <h2 style="margin:0;">{{ stats().cancelledBookings }}</h2>
        </div>
        <div class="summary-card">
          <div class="eyebrow">{{ i18n.t('popularRoom') }}</div>
          <h2 style="margin:0;">{{ i18n.roomName(stats().popularRoom) }}</h2>
        </div>
        <div class="summary-card">
          <div class="eyebrow">{{ i18n.t('utilization') }}</div>
          <h2 style="margin:0;">{{ stats().utilization }}%</h2>
        </div>
      </div>

      <div class="split-layout">
        <div class="card">
          <p class="eyebrow">{{ i18n.t('roomUsage') }}</p>
          <div class="stack">
            <div
              *ngFor="let room of rooms(); trackBy: trackByRoomId"
              style="display:grid; gap: 8px;"
            >
              <div style="display:flex; justify-content:space-between; gap: 10px;">
                <strong>{{ i18n.roomName(room) }}</strong>
                <span>{{ usage(room.id) }} {{ i18n.t('bookings') }}</span>
              </div>
              <progress tuiProgressBar max="100" [value]="bar(room.id)"></progress>
            </div>
          </div>
        </div>

        <div class="aside-info">
          <div class="card">
            <p class="eyebrow">{{ i18n.t('freeRoom') }}</p>
            <h2 style="margin:0;">{{ i18n.roomName(stats().freeRoom) }}</h2>
          </div>
          <div class="card">
            <p class="eyebrow">{{ i18n.t('upcomingNotifications') }}</p>
            <div class="stack" style="gap: 10px;" *ngIf="notifications().length; else noUpcoming">
              <div
                class="booking-item booking-item--compact"
                *ngFor="let booking of notifications(); trackBy: trackByBookingId"
              >
                <strong>{{ i18n.title(booking.title) }}</strong>
                <div class="muted">
                  {{ booking.date }} · {{ booking.startTime }} · {{ roomName(booking.roomId) }}
                </div>
              </div>
            </div>
            <ng-template #noUpcoming>
              <div class="muted">{{ i18n.t('noUpcomingBookings') }}</div>
            </ng-template>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class StatisticsComponent {
  private readonly state = inject(AppStateService);
  readonly i18n = inject(I18nService);

  readonly rooms = this.state.rooms;
  readonly stats = this.state.statistics;
  readonly notifications = this.state.upcomingNotifications;

  usage(roomId: string): number {
    return this.state
      .bookings()
      .filter((booking) => booking.roomId === roomId && booking.status === 'active').length;
  }

  bar(roomId: string): number {
    const max = Math.max(...this.rooms().map((room) => this.usage(room.id)), 1);
    return Math.round((this.usage(roomId) / max) * 100);
  }

  roomName(roomId: string): string {
    return this.i18n.roomName(this.state.roomById(roomId) ?? this.i18n.t('room'));
  }

  trackByRoomId(_: number, room: Room): string {
    return room.id;
  }

  trackByBookingId(_: number, booking: Booking): string {
    return booking.id;
  }
}
