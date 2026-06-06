import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TuiButton, TuiNotification } from '@taiga-ui/core';
import { AppStateService } from '../../core/app-state.service';
import { I18nService } from '../../core/i18n.service';
import { Recurrence } from '../../models';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiButton, TuiNotification],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="dialog-overlay">
      <div class="dialog-card">
        <div class="dialog-grid">
          <div style="display:flex; justify-content:space-between; gap: 12px; align-items:start;">
            <div>
              <p class="eyebrow">
                {{ isEditing ? i18n.t('editBooking') : i18n.t('createBooking') }}
              </p>
              <h2 style="margin: 0;">{{ i18n.roomName(room) || i18n.t('chooseRoom') }}</h2>
            </div>
            <button tuiButton size="s" appearance="secondary" type="button" (click)="close()">
              {{ i18n.t('close') }}
            </button>
          </div>

          <form class="dialog-grid" [formGroup]="form" (ngSubmit)="submit()">
            <div class="field">
              <label for="roomId">{{ i18n.t('room') }}</label>
              <select id="roomId" formControlName="roomId">
                <option *ngFor="let item of rooms(); trackBy: trackByRoomId" [value]="item.id">
                  {{ i18n.roomName(item) }}
                </option>
              </select>
            </div>

            <div class="field">
              <label for="title">{{ i18n.t('bookingTitle') }}</label>
              <input
                id="title"
                formControlName="title"
                [placeholder]="i18n.t('bookingTitlePlaceholder')"
              />
            </div>

            <div class="time-grid">
              <div class="field">
                <label for="date">{{ i18n.t('date') }}</label>
                <input id="date" type="date" formControlName="date" />
              </div>
              <div class="field">
                <label for="startTime">{{ i18n.t('startTime') }}</label>
                <input id="startTime" type="time" formControlName="startTime" />
              </div>
              <div class="field">
                <label for="endTime">{{ i18n.t('end') }}</label>
                <input id="endTime" type="time" formControlName="endTime" />
              </div>
            </div>

            <div class="field">
              <label for="participants">{{ i18n.t('participants') }}</label>
              <input id="participants" type="number" min="1" formControlName="participants" />
            </div>

            <div class="time-grid" *ngIf="!isEditing">
              <div class="field">
                <label for="recurrence">{{ i18n.t('repeat') }}</label>
                <select id="recurrence" formControlName="recurrence">
                  <option value="none">{{ i18n.recurrence('none') }}</option>
                  <option value="daily">{{ i18n.recurrence('daily') }}</option>
                  <option value="weekly">{{ i18n.recurrence('weekly') }}</option>
                </select>
              </div>
              <div class="field">
                <label for="occurrences">{{ i18n.t('occurrences') }}</label>
                <input
                  id="occurrences"
                  type="number"
                  min="1"
                  max="12"
                  formControlName="occurrences"
                />
              </div>
            </div>

            <div>
              <p class="eyebrow">{{ i18n.t('requiredEquipment') }}</p>
              <div class="checkbox-list">
                <label *ngFor="let item of equipmentOptions; trackBy: trackByEquipment">
                  <input
                    type="checkbox"
                    [checked]="selectedEquipment.has(item)"
                    (change)="toggleEquipment(item, $event)"
                  />
                  <span>{{ i18n.equipment(item) }}</span>
                </label>
              </div>
            </div>

            <div class="stack">
              <tui-notification *ngIf="error" appearance="negative">
                {{ i18n.message(error) }}
              </tui-notification>
              <button tuiButton class="btn" type="submit" [disabled]="form.invalid">
                {{ isEditing ? i18n.t('saveChanges') : i18n.t('createBooking') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `,
})
export class BookingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly state = inject(AppStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);

  readonly rooms = this.state.rooms;
  readonly bookingIdFromRoute = this.route.snapshot.paramMap.get('bookingId');
  readonly editingBooking = this.state.bookingById(this.bookingIdFromRoute);
  readonly isEditing = Boolean(this.editingBooking);
  readonly roomIdFromRoute =
    this.editingBooking?.roomId ??
    this.route.snapshot.queryParamMap.get('roomId') ??
    this.route.snapshot.paramMap.get('id') ??
    this.state.selectedRoomId();
  selectedEquipment = new Set<string>();
  error = '';

  readonly form = this.fb.nonNullable.group({
    roomId: [this.roomIdFromRoute],
    title: [this.editingBooking?.title ?? ''],
    date: [this.editingBooking?.date ?? '2026-06-06', Validators.required],
    startTime: [this.editingBooking?.startTime ?? '10:00', Validators.required],
    endTime: [this.editingBooking?.endTime ?? '10:45', Validators.required],
    participants: [
      this.editingBooking?.participants ?? 4,
      [Validators.required, Validators.min(1)],
    ],
    recurrence: ['none' as Recurrence],
    occurrences: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
  });

  get room() {
    return this.state.roomById(this.form.getRawValue().roomId) ?? this.state.selectedRoom();
  }

  constructor() {
    const room = this.state.roomById(this.roomIdFromRoute) ?? this.state.selectedRoom();
    if (room) {
      this.state.selectRoom(room.id);
      this.selectedEquipment = new Set(this.editingBooking?.equipment ?? room.equipment);
    }

    this.form.controls.roomId.valueChanges.pipe(takeUntilDestroyed()).subscribe((roomId) => {
      const selected = this.state.roomById(roomId);
      if (selected) {
        this.state.selectRoom(selected.id);
        this.selectedEquipment = new Set(
          [...this.selectedEquipment].filter((item) => selected.equipment.includes(item)),
        );
      }
    });
  }

  get equipmentOptions(): string[] {
    const room = this.state.roomById(this.form.getRawValue().roomId) ?? this.state.selectedRoom();

    return room?.equipment ?? [];
  }

  toggleEquipment(item: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedEquipment.add(item);
    } else {
      this.selectedEquipment.delete(item);
    }
    this.selectedEquipment = new Set(this.selectedEquipment);
  }

  close(): void {
    if (this.isEditing) {
      void this.router.navigate(['/bookings']);
      return;
    }

    void this.router.navigate(['/room-details', this.form.getRawValue().roomId]);
  }

  submit(): void {
    if (this.form.invalid) {
      this.error = 'please fill all required fields';
      return;
    }

    const value = this.form.getRawValue();
    const draft = {
      roomId: value.roomId,
      title: value.title,
      date: value.date,
      startTime: value.startTime,
      endTime: value.endTime,
      participants: Number(value.participants),
      equipment: [...this.selectedEquipment],
      recurrence: this.isEditing ? ('none' as Recurrence) : value.recurrence,
      occurrences: this.isEditing ? 1 : Number(value.occurrences),
    };
    const result =
      this.isEditing && this.bookingIdFromRoute
        ? this.state.updateBooking(this.bookingIdFromRoute, draft)
        : this.state.createBooking(draft);

    if (!result.ok) {
      this.error = result.error ?? 'Booking was not saved.';
      return;
    }

    this.error = '';
    void this.router.navigate(['/bookings']);
  }

  trackByRoomId(_: number, room: { id: string }): string {
    return room.id;
  }

  trackByEquipment(_: number, item: string): string {
    return item;
  }
}
