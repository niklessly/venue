import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiNotification } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { AppStateService } from '../../core/app-state.service';
import { I18nService } from '../../core/i18n.service';
import { Room } from '../../models';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiBadge, TuiButton, TuiNotification],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="split-layout">
      <div class="card stack">
        <div class="section-heading">
          <div>
            <p class="eyebrow">
              {{ selectedRoomId ? i18n.t('editRoom') : i18n.t('createRoom') }}
            </p>
            <h2 style="margin: 0;">{{ i18n.t('roomCatalog') }}</h2>
          </div>
          <button tuiButton size="s" type="button" appearance="secondary" (click)="newRoom()">
            {{ i18n.t('newRoom') }}
          </button>
        </div>

        <div class="field">
          <label for="roomId">{{ i18n.t('room') }}</label>
          <select id="roomId" [value]="selectedRoomId ?? ''" (change)="pickRoom($event)">
            <option value="">{{ i18n.t('newRoom') }}</option>
            <option *ngFor="let room of rooms(); trackBy: trackByRoomId" [value]="room.id">
              {{ i18n.roomName(room) }}
            </option>
          </select>
        </div>

        <form class="stack" [formGroup]="form" (ngSubmit)="save()">
          <div class="field">
            <label for="name">{{ i18n.t('name') }}</label>
            <input id="name" formControlName="name" />
          </div>
          <div class="field">
            <label for="capacity">{{ i18n.t('capacity') }}</label>
            <input id="capacity" type="number" min="1" formControlName="capacity" />
          </div>
          <div class="field">
            <label for="location">{{ i18n.t('location') }}</label>
            <input id="location" formControlName="location" />
          </div>
          <div class="field">
            <label for="description">{{ i18n.t('description') }}</label>
            <textarea id="description" rows="4" formControlName="description"></textarea>
          </div>
          <div class="field">
            <label for="equipment">{{ i18n.t('equipmentComma') }}</label>
            <input id="equipment" formControlName="equipment" />
          </div>
          <div class="field">
            <label for="status">{{ i18n.t('manualStatus') }}</label>
            <select id="status" formControlName="status">
              <option value="free">{{ i18n.status('free') }}</option>
              <option value="busy">{{ i18n.status('busy') }}</option>
            </select>
          </div>

          <tui-notification *ngIf="message" [appearance]="messageType" class="notice">
            {{ i18n.message(message) }}
          </tui-notification>

          <div class="actions-row">
            <button tuiButton class="btn" type="submit" [disabled]="form.invalid">
              {{ selectedRoomId ? i18n.t('saveRoom') : i18n.t('createRoom') }}
            </button>
            <button
              tuiButton
              type="button"
              appearance="destructive"
              [disabled]="!selectedRoomId"
              (click)="deleteSelected()"
            >
              {{ i18n.t('deleteRoom') }}
            </button>
          </div>
        </form>
      </div>

      <aside class="aside-info">
        <div class="card">
          <p class="eyebrow">{{ i18n.t('roomCatalog') }}</p>
          <div class="stack">
            <button
              *ngFor="let room of rooms(); trackBy: trackByRoomId"
              class="booking-item admin-room-button"
              type="button"
              (click)="loadRoom(room.id)"
            >
              <div style="display:flex; justify-content:space-between; gap: 10px;">
                <strong>{{ i18n.roomName(room) }}</strong>
                <span
                  tuiBadge
                  [appearance]="state.roomStatus(room.id) === 'free' ? 'positive' : 'warning'"
                >
                  {{ i18n.status(state.roomStatus(room.id)) }}
                </span>
              </div>
              <div class="muted">
                {{ i18n.seats(room.capacity) }} · {{ i18n.location(room.location) }}
              </div>
              <div>{{ i18n.equipmentList(room.equipment) }}</div>
            </button>
          </div>
        </div>
      </aside>
    </section>
  `,
})
export class AdminComponent {
  readonly state = inject(AppStateService);
  readonly i18n = inject(I18nService);
  private readonly fb = inject(FormBuilder);

  readonly rooms = this.state.rooms;
  selectedRoomId: string | null = this.rooms()[0]?.id ?? null;
  message = '';
  messageType: 'positive' | 'negative' = 'positive';

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    capacity: [4, [Validators.required, Validators.min(1)]],
    location: ['', Validators.required],
    description: [''],
    equipment: [''],
    status: ['free' as 'free' | 'busy'],
  });

  constructor() {
    if (this.selectedRoomId) {
      this.loadRoom(this.selectedRoomId);
    }
  }

  pickRoom(event: Event): void {
    const roomId = (event.target as HTMLSelectElement).value;
    if (!roomId) {
      this.newRoom();
      return;
    }

    this.loadRoom(roomId);
  }

  newRoom(): void {
    this.selectedRoomId = null;
    this.message = '';
    this.form.reset({
      name: '',
      capacity: 4,
      location: '',
      description: '',
      equipment: '',
      status: 'free',
    });
  }

  loadRoom(roomId: string): void {
    this.setRoomForm(roomId, true);
  }

  private setRoomForm(roomId: string, clearMessage: boolean): void {
    const room = this.state.roomById(roomId);
    if (!room) {
      return;
    }

    this.selectedRoomId = roomId;
    if (clearMessage) {
      this.message = '';
    }
    this.form.setValue({
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      description: room.description,
      equipment: room.equipment.join(', '),
      status: room.status,
    });
  }

  save(): void {
    const draft = this.formDraft();
    const result = this.selectedRoomId
      ? this.state.updateRoom(this.selectedRoomId, draft)
      : this.state.createRoom(draft);

    if (!result.ok) {
      this.messageType = 'negative';
      this.message = result.error ?? 'Room was not saved.';
      return;
    }

    const created = !this.selectedRoomId;
    this.selectedRoomId = result.value?.id ?? this.selectedRoomId;
    this.messageType = 'positive';
    this.message = created ? 'Room created.' : 'Room saved.';
  }

  deleteSelected(): void {
    if (!this.selectedRoomId) {
      return;
    }

    const result = this.state.deleteRoom(this.selectedRoomId);
    if (!result.ok) {
      this.messageType = 'negative';
      this.message = result.error ?? 'Room was not deleted.';
      return;
    }

    this.messageType = 'positive';
    this.message = 'Room deleted.';
    this.selectedRoomId = this.rooms()[0]?.id ?? null;
    if (this.selectedRoomId) {
      this.setRoomForm(this.selectedRoomId, false);
    } else {
      this.newRoom();
      this.messageType = 'positive';
      this.message = 'Room deleted.';
    }
  }

  trackByRoomId(_: number, room: Room): string {
    return room.id;
  }

  private formDraft() {
    const value = this.form.getRawValue();

    return {
      name: value.name,
      capacity: Number(value.capacity),
      location: value.location,
      description: value.description,
      equipment: value.equipment
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      status: value.status,
    };
  }
}
