import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiNotification } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { AppStateService } from '../../core/app-state.service';
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
            <p class="eyebrow">{{ selectedRoomId ? 'edit room' : 'create room' }}</p>
            <h2 style="margin: 0;">room catalog</h2>
          </div>
          <button tuiButton size="s" type="button" appearance="secondary" (click)="newRoom()">
            new room
          </button>
        </div>

        <div class="field">
          <label for="roomId">room</label>
          <select id="roomId" [value]="selectedRoomId ?? ''" (change)="pickRoom($event)">
            <option value="">new room</option>
            <option *ngFor="let room of rooms(); trackBy: trackByRoomId" [value]="room.id">
              {{ room.name }}
            </option>
          </select>
        </div>

        <form class="stack" [formGroup]="form" (ngSubmit)="save()">
          <div class="field">
            <label for="name">name</label>
            <input id="name" formControlName="name" />
          </div>
          <div class="field">
            <label for="capacity">capacity</label>
            <input id="capacity" type="number" min="1" formControlName="capacity" />
          </div>
          <div class="field">
            <label for="location">location</label>
            <input id="location" formControlName="location" />
          </div>
          <div class="field">
            <label for="description">description</label>
            <textarea id="description" rows="4" formControlName="description"></textarea>
          </div>
          <div class="field">
            <label for="equipment">equipment (comma separated)</label>
            <input id="equipment" formControlName="equipment" />
          </div>
          <div class="field">
            <label for="status">manual status</label>
            <select id="status" formControlName="status">
              <option value="free">free</option>
              <option value="busy">busy</option>
            </select>
          </div>

          <tui-notification *ngIf="message" [appearance]="messageType" class="notice">
            {{ message }}
          </tui-notification>

          <div class="actions-row">
            <button tuiButton class="btn" type="submit" [disabled]="form.invalid">
              {{ selectedRoomId ? 'save room' : 'create room' }}
            </button>
            <button
              tuiButton
              type="button"
              appearance="destructive"
              [disabled]="!selectedRoomId"
              (click)="deleteSelected()"
            >
              delete room
            </button>
          </div>
        </form>
      </div>

      <aside class="aside-info">
        <div class="card">
          <p class="eyebrow">room catalog</p>
          <div class="stack">
            <button
              *ngFor="let room of rooms(); trackBy: trackByRoomId"
              class="booking-item admin-room-button"
              type="button"
              (click)="loadRoom(room.id)"
            >
              <div style="display:flex; justify-content:space-between; gap: 10px;">
                <strong>{{ room.name }}</strong>
                <span
                  tuiBadge
                  [appearance]="state.roomStatus(room.id) === 'free' ? 'positive' : 'warning'"
                >
                  {{ state.roomStatus(room.id) }}
                </span>
              </div>
              <div class="muted">{{ room.capacity }} seats · {{ room.location }}</div>
              <div>{{ room.equipment.join(', ') }}</div>
            </button>
          </div>
        </div>
      </aside>
    </section>
  `,
})
export class AdminComponent {
  readonly state = inject(AppStateService);
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
    const room = this.state.roomById(roomId);
    if (!room) {
      return;
    }

    this.selectedRoomId = roomId;
    this.message = '';
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
      this.loadRoom(this.selectedRoomId);
    } else {
      this.newRoom();
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
