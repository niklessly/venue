import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppStateService } from '../../core/app-state.service';

@Component({
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <section class="stack">
      <div class="summary-grid">
        <div class="summary-card">
          <div class="eyebrow">active</div>
          <h2 style="margin:0;">{{ bookings().length }}</h2>
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

      <div class="card">
        <p class="eyebrow">my bookings</p>
        <div class="booking-list" *ngIf="bookings().length; else emptyBookings">
          <article class="booking-item" *ngFor="let booking of bookings()">
            <div style="display:flex; justify-content:space-between; gap: 10px; align-items:start;">
              <div>
                <strong>{{ booking.title }}</strong>
                <div class="muted">{{ roomName(booking.roomId) }}</div>
              </div>
              <span>{{ booking.status }}</span>
            </div>
            <div>{{ booking.date }} · {{ booking.startTime }} - {{ booking.endTime }}</div>
            <div class="muted">{{ booking.participants }} participants</div>
            <div style="display:flex; gap: 10px;">
              <a class="btn-ghost" [routerLink]="['/room-details', booking.roomId]">open room</a>
              <button class="btn" type="button" (click)="cancel(booking.id)">cancel</button>
            </div>
          </article>
        </div>

        <ng-template #emptyBookings>
          <div class="empty-state">you do not have any bookings yet.</div>
        </ng-template>
      </div>
    </section>
  `,
})
export class BookingsComponent {
    private readonly state = inject(AppStateService);

    readonly bookings = this.state.currentUserBookings;

    distinctRooms(): number {
        return new Set(this.bookings().map((booking) => booking.roomId)).size;
    }

    cancelledCount(): number {
        return this.state.bookings().filter((booking) => booking.status === 'cancelled').length;
    }

    todayCount(): number {
        const today = new Date().toISOString().slice(0, 10);
        return this.bookings().filter((booking) => booking.date === today).length;
    }

    roomName(roomId: string): string {
        return this.state.roomById(roomId)?.name ?? 'room';
    }

    cancel(bookingId: string): void {
        this.state.cancelBooking(bookingId);
    }
}