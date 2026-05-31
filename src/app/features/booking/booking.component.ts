import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppStateService } from '../../core/app-state.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="dialog-overlay">
      <div class="dialog-card">
        <div class="dialog-grid">
          <div style="display:flex; justify-content:space-between; gap: 12px; align-items:start;">
            <div>
              <p class="eyebrow">create booking</p>
              <h2 style="margin: 0;">{{ room?.name ?? 'choose room' }}</h2>
            </div>
            <button class="btn-ghost" type="button" (click)="close()">x</button>
          </div>

          <form class="dialog-grid" [formGroup]="form" (ngSubmit)="submit()">
            <div class="field">
              <label for="roomId">room</label>
              <select id="roomId" formControlName="roomId">
                <option *ngFor="let item of rooms()" [value]="item.id">{{ item.name }}</option>
              </select>
            </div>

            <div class="field">
              <label for="title">title</label>
              <input id="title" formControlName="title" placeholder="team sync" />
            </div>

            <div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px;">
              <div class="field">
                <label for="date">date</label>
                <input id="date" type="date" formControlName="date" />
              </div>
              <div class="field">
                <label for="startTime">time</label>
                <input id="startTime" type="time" formControlName="startTime" />
              </div>
              <div class="field">
                <label for="endTime">end</label>
                <input id="endTime" type="time" formControlName="endTime" />
              </div>
            </div>

            <div class="field">
              <label for="participants">participants</label>
              <input id="participants" type="number" min="1" formControlName="participants" />
            </div>

            <div>
              <p class="eyebrow">required equipment</p>
              <div class="checkbox-list">
                <label *ngFor="let item of equipmentOptions">
                  <input type="checkbox" [checked]="selectedEquipment.has(item)" (change)="toggleEquipment(item, $event)" />
                  <span>{{ item }}</span>
                </label>
              </div>
            </div>

            <div class="stack">
              <div class="muted" *ngIf="error">{{ error }}</div>
              <button class="btn" type="submit">create booking</button>
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

  readonly rooms = this.state.rooms;
  readonly roomIdFromRoute = this.route.snapshot.queryParamMap.get('roomId') ?? this.route.snapshot.paramMap.get('id') ?? this.state.selectedRoomId();
  selectedEquipment = new Set<string>();
  error = '';

  readonly form = this.fb.nonNullable.group({
    roomId: [this.roomIdFromRoute],
    title: [''],
    date: ['2026-05-05', Validators.required],
    startTime: ['10:00', Validators.required],
    endTime: ['10:45', Validators.required],
    participants: [4, [Validators.required, Validators.min(1)]],
  });

  get room() {
    return this.state.roomById(this.form.getRawValue().roomId) ?? this.state.selectedRoom();
  }

  constructor() {
    const room = this.state.roomById(this.roomIdFromRoute) ?? this.state.selectedRoom();
    if (room) {
      this.state.selectRoom(room.id);
      this.selectedEquipment = new Set(room.equipment);
    }

    this.form.controls.roomId.valueChanges.pipe(takeUntilDestroyed()).subscribe((roomId) => {
      const selected = this.state.roomById(roomId);
      if (selected) {
        this.state.selectRoom(selected.id);
        this.selectedEquipment = new Set(selected.equipment);
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
    void this.router.navigate(['/room-details', this.form.getRawValue().roomId]);
  }

  submit(): void {
    if (this.form.invalid) {
      this.error = 'please fill all required fields';
      return;
    }

    const value = this.form.getRawValue();
    const booking = this.state.createBooking({
      roomId: value.roomId,
      title: value.title,
      date: value.date,
      startTime: value.startTime,
      endTime: value.endTime,
      participants: Number(value.participants),
      equipment: [...this.selectedEquipment],
    });

    if (!booking) {
      this.error = 'the room capacity is smaller than the selected group size';
      return;
    }

    this.error = '';
    void this.router.navigate(['/bookings']);
  }
}