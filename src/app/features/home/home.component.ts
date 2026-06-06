import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TuiButton, TuiLoader } from '@taiga-ui/core';
import { AppStateService } from '../../core/app-state.service';
import { I18nService } from '../../core/i18n.service';
import { Room } from '../../models';
import { RoomCardComponent } from '../../shared/room-card.component';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RoomCardComponent, TuiButton, TuiLoader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="panel">
      <div class="workflow-strip" [attr.aria-label]="i18n.t('workflowLabel')">
        <div class="workflow-step">
          <strong>1. {{ i18n.t('filterStepTitle') }}</strong>
          <span>{{ i18n.t('filterStepText') }}</span>
        </div>
        <div class="workflow-step">
          <strong>2. {{ i18n.t('pickStepTitle') }}</strong>
          <span>{{ i18n.t('pickStepText') }}</span>
        </div>
        <div class="workflow-step">
          <strong>3. {{ i18n.t('manageStepTitle') }}</strong>
          <span>{{ i18n.t('manageStepText') }}</span>
        </div>
      </div>

      <form class="filter-strip" [formGroup]="form">
        <div class="field">
          <label for="date">{{ i18n.t('date') }}</label>
          <input id="date" type="date" formControlName="date" />
        </div>
        <div class="field">
          <label for="time">{{ i18n.t('time') }}</label>
          <input id="time" type="time" formControlName="time" />
        </div>
        <div class="field">
          <label for="capacity">{{ i18n.t('capacity') }}</label>
          <input id="capacity" type="number" min="0" formControlName="capacity" />
        </div>
        <div class="field">
          <label for="equipment">{{ i18n.t('equipment') }}</label>
          <input
            id="equipment"
            formControlName="equipment"
            [placeholder]="i18n.t('equipmentPlaceholder')"
          />
        </div>
        <div class="field">
          <label for="sortBy">{{ i18n.t('sort') }}</label>
          <select id="sortBy" formControlName="sortBy">
            <option value="name">{{ i18n.sort('name') }}</option>
            <option value="capacity">{{ i18n.sort('capacity') }}</option>
            <option value="status">{{ i18n.sort('status') }}</option>
          </select>
        </div>
        <label class="checkbox-field">
          <input type="checkbox" formControlName="availableOnly" />
          <span>{{ i18n.t('availableOnly') }}</span>
        </label>
      </form>

      <div
        style="display:flex; justify-content:space-between; gap: 12px; align-items:center; margin-top: 18px;"
      >
        <div>
          <p class="eyebrow">{{ i18n.t('availableRooms') }}</p>
          <h2 style="margin:0;">{{ i18n.t('pickStepTitle') }}</h2>
        </div>
        <div style="display:flex; gap: 10px; align-items:center; flex-wrap: wrap;">
          <div class="user-chip">{{ i18n.roomsFound(rooms().length) }}</div>
          <button tuiButton size="s" type="button" appearance="secondary" (click)="reset()">
            {{ i18n.t('resetFilters') }}
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
        <div class="empty-state">{{ i18n.t('noRooms') }}</div>
      </ng-template>
    </section>
  `,
})
export class HomeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly state = inject(AppStateService);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);

  readonly rooms = this.state.filteredRooms;
  readonly loading = this.state.loading;

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
