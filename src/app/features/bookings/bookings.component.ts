import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiNotification } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { AppStateService } from '../../core/app-state.service';
import { I18nService } from '../../core/i18n.service';
import { Booking, BookingStatus } from '../../models';

type BookingFilter = 'all' | BookingStatus;

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, TuiBadge, TuiButton, TuiNotification],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="stack page-section">
      <div class="summary-grid">
        <div class="summary-card">
          <div class="eyebrow">{{ i18n.t('active') }}</div>
          <h2 style="margin:0;">{{ activeCount() }}</h2>
        </div>
        <div class="summary-card">
          <div class="eyebrow">{{ i18n.t('upcomingRooms') }}</div>
          <h2 style="margin:0;">{{ distinctRooms() }}</h2>
        </div>
        <div class="summary-card">
          <div class="eyebrow">{{ i18n.t('cancelled') }}</div>
          <h2 style="margin:0;">{{ cancelledCount() }}</h2>
        </div>
        <div class="summary-card">
          <div class="eyebrow">{{ i18n.t('today') }}</div>
          <h2 style="margin:0;">{{ todayCount() }}</h2>
        </div>
      </div>

      <div class="card" *ngIf="notifications().length">
        <p class="eyebrow">{{ i18n.t('upcomingNotifications') }}</p>
        <div class="stack" style="gap: 10px;">
          <tui-notification *ngFor="let booking of notifications(); trackBy: trackByBookingId">
            {{ booking.date }} · {{ booking.startTime }} · {{ i18n.title(booking.title) }}
            {{ i18n.t('inRoom') }}
            {{ roomName(booking.roomId) }}
          </tui-notification>
        </div>
      </div>

      <div class="card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">{{ i18n.t('myBookings') }}</p>
            <h2 style="margin: 0;">{{ i18n.t('schedule') }}</h2>
          </div>
          <div class="field compact-field">
            <label for="statusFilter">{{ i18n.t('status') }}</label>
            <select id="statusFilter" [value]="statusFilter" (change)="setStatusFilter($event)">
              <option value="all">{{ i18n.t('all') }}</option>
              <option value="active">{{ i18n.status('active') }}</option>
              <option value="cancelled">{{ i18n.status('cancelled') }}</option>
            </select>
          </div>
        </div>

        <tui-notification *ngIf="error" appearance="negative" class="notice">
          {{ i18n.message(error) }}
        </tui-notification>

        <div class="booking-list" *ngIf="visibleBookings().length; else emptyBookings">
          <article
            class="booking-item"
            *ngFor="let booking of visibleBookings(); trackBy: trackByBookingId"
          >
            <div style="display:flex; justify-content:space-between; gap: 10px; align-items:start;">
              <div>
                <strong>{{ i18n.title(booking.title) }}</strong>
                <div class="muted">{{ roomName(booking.roomId) }}</div>
              </div>
              <span tuiBadge [appearance]="booking.status === 'active' ? 'positive' : 'neutral'">
                {{ i18n.status(booking.status) }}
              </span>
            </div>
            <div>{{ booking.date }} · {{ booking.startTime }} - {{ booking.endTime }}</div>
            <div class="muted">
              {{ booking.participants }} {{ i18n.t('participants') }} · {{ i18n.t('repeat') }}:
              {{ i18n.recurrence(booking.recurrence) }}
            </div>
            <div class="actions-row">
              <a
                tuiButton
                size="s"
                appearance="secondary"
                [routerLink]="['/room-details', booking.roomId]"
              >
                {{ i18n.t('openRoom') }}
              </a>
              <a
                tuiButton
                size="s"
                appearance="secondary"
                [routerLink]="['/bookings', booking.id, 'edit']"
              >
                {{ i18n.t('edit') }}
              </a>
              <button
                tuiButton
                size="s"
                type="button"
                appearance="warning"
                [disabled]="booking.status === 'cancelled'"
                (click)="cancel(booking.id)"
              >
                {{ i18n.t('cancelBooking') }}
              </button>
              <button
                tuiButton
                size="s"
                type="button"
                appearance="destructive"
                (click)="remove(booking.id)"
              >
                {{ i18n.t('delete') }}
              </button>
            </div>
          </article>
        </div>

        <ng-template #emptyBookings>
          <div class="empty-state">{{ i18n.t('noBookings') }}</div>
        </ng-template>
      </div>
    </section>
  `,
})
export class BookingsComponent {
  private readonly state = inject(AppStateService);
  readonly i18n = inject(I18nService);

  readonly bookings = this.state.currentUserBookings;
  readonly notifications = this.state.upcomingNotifications;
  statusFilter: BookingFilter = 'all';
  error = '';

  visibleBookings(): Booking[] {
    if (this.statusFilter === 'all') {
      return this.bookings();
    }

    return this.bookings().filter((booking) => booking.status === this.statusFilter);
  }

  activeCount(): number {
    return this.bookings().filter((booking) => booking.status === 'active').length;
  }

  distinctRooms(): number {
    return new Set(
      this.bookings()
        .filter((booking) => booking.status === 'active')
        .map((booking) => booking.roomId),
    ).size;
  }

  cancelledCount(): number {
    return this.bookings().filter((booking) => booking.status === 'cancelled').length;
  }

  todayCount(): number {
    const today = new Date().toISOString().slice(0, 10);

    return this.bookings().filter(
      (booking) => booking.date === today && booking.status === 'active',
    ).length;
  }

  roomName(roomId: string): string {
    return this.i18n.roomName(this.state.roomById(roomId) ?? this.i18n.t('room'));
  }

  setStatusFilter(event: Event): void {
    this.statusFilter = (event.target as HTMLSelectElement).value as BookingFilter;
  }

  cancel(bookingId: string): void {
    const result = this.state.cancelBooking(bookingId);
    this.error = result.ok ? '' : (result.error ?? 'Booking was not cancelled.');
  }

  remove(bookingId: string): void {
    const result = this.state.deleteBooking(bookingId);
    this.error = result.ok ? '' : (result.error ?? 'Booking was not deleted.');
  }

  trackByBookingId(_: number, booking: Booking): string {
    return booking.id;
  }
}
