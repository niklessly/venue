import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiNotification } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { AppStateService } from '../../core/app-state.service';
import { Booking, BookingStatus } from '../../models';

type BookingFilter = 'all' | BookingStatus;

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, TuiBadge, TuiButton, TuiNotification],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="stack">
      <div class="summary-grid">
        <div class="summary-card">
          <div class="eyebrow">active</div>
          <h2 style="margin:0;">{{ activeCount() }}</h2>
        </div>
        <div class="summary-card">
          <div class="eyebrow">upcoming rooms</div>
          <h2 style="margin:0;">{{ distinctRooms() }}</h2>
        </div>
        <div class="summary-card">
          <div class="eyebrow">cancelled</div>
          <h2 style="margin:0;">{{ cancelledCount() }}</h2>
        </div>
        <div class="summary-card">
          <div class="eyebrow">today</div>
          <h2 style="margin:0;">{{ todayCount() }}</h2>
        </div>
      </div>

      <div class="card" *ngIf="notifications().length">
        <p class="eyebrow">upcoming notifications</p>
        <div class="stack" style="gap: 10px;">
          <tui-notification *ngFor="let booking of notifications(); trackBy: trackByBookingId">
            {{ booking.date }} at {{ booking.startTime }} · {{ booking.title }} in
            {{ roomName(booking.roomId) }}
          </tui-notification>
        </div>
      </div>

      <div class="card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">my bookings</p>
            <h2 style="margin: 0;">schedule</h2>
          </div>
          <div class="field compact-field">
            <label for="statusFilter">status</label>
            <select id="statusFilter" [value]="statusFilter" (change)="setStatusFilter($event)">
              <option value="all">all</option>
              <option value="active">active</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
        </div>

        <tui-notification *ngIf="error" appearance="negative" class="notice">
          {{ error }}
        </tui-notification>

        <div class="booking-list" *ngIf="visibleBookings().length; else emptyBookings">
          <article
            class="booking-item"
            *ngFor="let booking of visibleBookings(); trackBy: trackByBookingId"
          >
            <div style="display:flex; justify-content:space-between; gap: 10px; align-items:start;">
              <div>
                <strong>{{ booking.title }}</strong>
                <div class="muted">{{ roomName(booking.roomId) }}</div>
              </div>
              <span tuiBadge [appearance]="booking.status === 'active' ? 'positive' : 'neutral'">
                {{ booking.status }}
              </span>
            </div>
            <div>{{ booking.date }} · {{ booking.startTime }} - {{ booking.endTime }}</div>
            <div class="muted">
              {{ booking.participants }} participants · repeat: {{ booking.recurrence }}
            </div>
            <div class="actions-row">
              <a
                tuiButton
                size="s"
                appearance="secondary"
                [routerLink]="['/room-details', booking.roomId]"
              >
                open room
              </a>
              <a
                tuiButton
                size="s"
                appearance="secondary"
                [routerLink]="['/bookings', booking.id, 'edit']"
              >
                edit
              </a>
              <button
                tuiButton
                size="s"
                type="button"
                appearance="warning"
                [disabled]="booking.status === 'cancelled'"
                (click)="cancel(booking.id)"
              >
                cancel
              </button>
              <button
                tuiButton
                size="s"
                type="button"
                appearance="destructive"
                (click)="remove(booking.id)"
              >
                delete
              </button>
            </div>
          </article>
        </div>

        <ng-template #emptyBookings>
          <div class="empty-state">you do not have any bookings for this filter.</div>
        </ng-template>
      </div>
    </section>
  `,
})
export class BookingsComponent {
  private readonly state = inject(AppStateService);

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
    return this.state.roomById(roomId)?.name ?? 'room';
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
