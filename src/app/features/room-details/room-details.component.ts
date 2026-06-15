import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { AppStateService } from '../../core/app-state.service';
import { I18nService } from '../../core/i18n.service';
import { Booking } from '../../models';

@Component({
  standalone: true,
  imports: [CommonModule, TuiBadge, TuiButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="split-layout">
      <article class="card stack">
        <div class="room-hero">{{ i18n.roomName(room) || i18n.t('room') }}</div>

        <div>
          <p class="eyebrow">{{ i18n.t('roomDetails') }}</p>
          <h2 style="margin: 0 0 8px;">{{ i18n.roomName(room) }}</h2>
          <p class="muted" style="margin: 0; max-width: 60ch;">
            {{ i18n.description(room?.description) }}
          </p>
        </div>

        <button tuiButton class="btn" type="button" (click)="book()">
          {{ i18n.t('bookThisRoom') }}
        </button>
      </article>

      <aside class="aside-info">
        <div class="card">
          <p class="eyebrow">{{ i18n.t('status') }}</p>
          <span tuiBadge [appearance]="status() === 'free' ? 'positive' : 'warning'">
            {{ i18n.status(status()) }}
          </span>
        </div>

        <div class="card">
          <p class="eyebrow">{{ i18n.t('capacity') }}</p>
          <h2 style="margin: 0;">{{ i18n.seats(room?.capacity) }}</h2>
        </div>

        <div class="card">
          <p class="eyebrow">{{ i18n.t('equipment') }}</p>
          <div class="stack" style="gap: 10px;">
            <span *ngFor="let item of room?.equipment">{{ i18n.equipment(item) }}</span>
          </div>
        </div>

        <div class="card">
          <p class="eyebrow">{{ i18n.t('location') }}</p>
          <div>{{ i18n.location(room?.location) }}</div>
        </div>

        <div class="card">
          <p class="eyebrow">{{ i18n.t('activeSchedule') }}</p>
          <div class="stack" style="gap: 10px;" *ngIf="activeBookings().length; else freeSchedule">
            <div *ngFor="let booking of activeBookings(); trackBy: trackByBookingId">
              <strong>{{ i18n.title(booking.title) }}</strong>
              <div class="muted">
                {{ booking.date }} · {{ booking.startTime }} - {{ booking.endTime }}
              </div>
            </div>
          </div>
          <ng-template #freeSchedule>
            <div class="muted">{{ i18n.t('noActiveBookings') }}</div>
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
  readonly i18n = inject(I18nService);

  readonly roomId = this.route.snapshot.paramMap.get('id') ?? this.state.selectedRoomId();
  readonly room = this.state.roomById(this.roomId) ?? this.state.selectedRoom();
  readonly dateFromRoute = this.route.snapshot.queryParamMap.get('date') ?? '';
  readonly timeFromRoute = this.route.snapshot.queryParamMap.get('time') ?? '';

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
    void this.router.navigate(['/rooms', this.room.id, 'book'], {
      queryParams: this.slotQueryParams(),
    });
  }

  status(): 'free' | 'busy' {
    if (!this.room) {
      return 'free';
    }

    return this.dateFromRoute
      ? this.state.roomStatusAt(this.room.id, this.dateFromRoute, this.timeFromRoute)
      : this.state.roomStatus(this.room.id);
  }

  activeBookings(): Booking[] {
    return this.room ? this.state.activeBookingsForRoom(this.room.id) : [];
  }

  trackByBookingId(_: number, booking: Booking): string {
    return booking.id;
  }

  private slotQueryParams(): { date?: string; time?: string } {
    return {
      ...(this.dateFromRoute ? { date: this.dateFromRoute } : {}),
      ...(this.timeFromRoute ? { time: this.timeFromRoute } : {}),
    };
  }
}
