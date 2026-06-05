import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { AppStateService } from '../../core/app-state.service';
import { Booking } from '../../models';

@Component({
  standalone: true,
  imports: [CommonModule, TuiBadge, TuiButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="split-layout">
      <article class="card stack">
        <div class="room-hero">{{ room?.name ?? 'room' }}</div>

        <div>
          <p class="eyebrow">about this room</p>
          <h2 style="margin: 0 0 8px;">{{ room?.name }}</h2>
          <p class="muted" style="margin: 0; max-width: 60ch;">{{ room?.description }}</p>
        </div>

        <button tuiButton class="btn" type="button" (click)="book()">book this room</button>
      </article>

      <aside class="aside-info">
        <div class="card">
          <p class="eyebrow">status</p>
          <span tuiBadge [appearance]="status() === 'free' ? 'positive' : 'warning'">
            {{ status() }}
          </span>
        </div>

        <div class="card">
          <p class="eyebrow">capacity</p>
          <h2 style="margin: 0;">{{ room?.capacity }} people</h2>
        </div>

        <div class="card">
          <p class="eyebrow">equipment</p>
          <div class="stack" style="gap: 10px;">
            <span *ngFor="let item of room?.equipment">{{ item }}</span>
          </div>
        </div>

        <div class="card">
          <p class="eyebrow">location</p>
          <div>{{ room?.location }}</div>
        </div>

        <div class="card">
          <p class="eyebrow">active schedule</p>
          <div class="stack" style="gap: 10px;" *ngIf="activeBookings().length; else freeSchedule">
            <div *ngFor="let booking of activeBookings(); trackBy: trackByBookingId">
              <strong>{{ booking.title }}</strong>
              <div class="muted">
                {{ booking.date }} · {{ booking.startTime }} - {{ booking.endTime }}
              </div>
            </div>
          </div>
          <ng-template #freeSchedule>
            <div class="muted">no active bookings for this room.</div>
          </ng-template>
        </div>
      </aside>
    </section>
  `,
})
export class RoomDetailsComponent {
  private readonly state = inject(AppStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly roomId = this.route.snapshot.paramMap.get('id') ?? this.state.selectedRoomId();
  readonly room = this.state.roomById(this.roomId) ?? this.state.selectedRoom();

  constructor() {
    if (this.room) {
      this.state.selectRoom(this.room.id);
    }
  }

  book(): void {
    if (!this.room) {
      return;
    }

    this.state.selectRoom(this.room.id);
    void this.router.navigate(['/rooms', this.room.id, 'book']);
  }

  status(): 'free' | 'busy' {
    return this.room ? this.state.roomStatus(this.room.id) : 'free';
  }

  activeBookings(): Booking[] {
    return this.room ? this.state.activeBookingsForRoom(this.room.id) : [];
  }

  trackByBookingId(_: number, booking: Booking): string {
    return booking.id;
  }
}
