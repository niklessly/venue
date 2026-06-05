import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TuiButton, TuiLoader, TuiNotification } from '@taiga-ui/core';
import { AppStateService } from '../../core/app-state.service';
import { Room } from '../../models';
import { RoomCardComponent } from '../../shared/room-card.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RoomCardComponent,
    TuiButton,
    TuiLoader,
    TuiNotification,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="panel">
      <tui-notification
        *ngIf="apiMessage()"
        [appearance]="apiReady() ? 'positive' : 'warning'"
        class="notice"
      >
        {{ apiMessage() }}
      </tui-notification>

      <form class="filter-strip" [formGroup]="form">
        <div class="field">
          <label for="date">date</label>
          <input id="date" type="date" formControlName="date" />
        </div>
        <div class="field">
          <label for="time">time</label>
          <input id="time" type="time" formControlName="time" />
        </div>
        <div class="field">
          <label for="capacity">capacity</label>
          <input id="capacity" type="number" min="0" formControlName="capacity" />
        </div>
        <div class="field">
          <label for="equipment">equipment</label>
          <input id="equipment" formControlName="equipment" placeholder="projector or room 4" />
        </div>
        <div class="field">
          <label for="sortBy">sort</label>
          <select id="sortBy" formControlName="sortBy">
            <option value="name">by name</option>
            <option value="capacity">by capacity</option>
            <option value="status">by status</option>
          </select>
        </div>
        <label class="checkbox-field">
          <input type="checkbox" formControlName="availableOnly" />
          <span>available only</span>
        </label>
      </form>

      <div
        style="display:flex; justify-content:space-between; gap: 12px; align-items:center; margin-top: 18px;"
      >
        <div>
          <p class="eyebrow">available rooms</p>
          <h2 style="margin:0;">choose the room that fits your meeting</h2>
        </div>
        <div style="display:flex; gap: 10px; align-items:center; flex-wrap: wrap;">
          <div class="user-chip">{{ rooms().length }} rooms</div>
          <button tuiButton size="s" type="button" appearance="secondary" (click)="reset()">
            reset filters
          </button>
        </div>
      </div>

      <tui-loader [showLoader]="loading()" [overlay]="true">
        <div class="rooms-grid" *ngIf="rooms().length; else emptyRooms">
          <app-room-card
            *ngFor="let room of rooms(); trackBy: trackByRoomId"
            [room]="room"
            (selected)="openRoom($event)"
          />
        </div>
      </tui-loader>

      <ng-template #emptyRooms>
        <div class="empty-state">no rooms match these filters right now.</div>
      </ng-template>
    </section>
  `,
})
export class HomeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly state = inject(AppStateService);
  private readonly router = inject(Router);

  readonly rooms = this.state.filteredRooms;
  readonly loading = this.state.loading;
  readonly apiReady = this.state.apiReady;
  readonly apiMessage = this.state.apiMessage;

  readonly form = this.fb.nonNullable.group({
    date: [''],
    time: [''],
    capacity: [0],
    equipment: [''],
    sortBy: ['name' as const],
    availableOnly: [false],
  });

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.state.setFilters({
        date: value.date ?? '',
        time: value.time ?? '',
        capacity: value.capacity ? Number(value.capacity) : null,
        equipment: value.equipment ?? '',
        sortBy: value.sortBy ?? 'name',
        availableOnly: value.availableOnly ?? false,
      });
    });

    this.state.setFilters(this.form.getRawValue());
  }

  openRoom(roomId: string): void {
    this.state.selectRoom(roomId);
    void this.router.navigate(['/room-details', roomId]);
  }

  reset(): void {
    this.form.reset({
      date: '',
      time: '',
      capacity: 0,
      equipment: '',
      sortBy: 'name',
      availableOnly: false,
    });
    this.state.resetFilters();
  }

  trackByRoomId(_: number, room: Room): string {
    return room.id;
  }
}
