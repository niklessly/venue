import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AppStateService } from '../../core/app-state.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="split-layout">
      <div class="card stack">
        <div>
          <p class="eyebrow">edit room</p>
          <div class="field">
            <label for="roomId">room</label>
            <select
              id="roomId"
              [value]="selectedRoomId"
              (change)="pickRoom($any($event.target).value)"
            >
              <option *ngFor="let room of rooms()" [value]="room.id">{{ room.name }}</option>
            </select>
          </div>
        </div>

        <form class="stack" [formGroup]="form" (ngSubmit)="save()">
          <div class="field">
            <label for="name">name</label>
            <input id="name" formControlName="name" />
          </div>
          <div class="field">
            <label for="capacity">capacity</label>
            <input id="capacity" type="number" formControlName="capacity" />
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
          <button class="btn" type="submit">save room</button>
        </form>
      </div>

      <aside class="aside-info">
        <div class="card">
          <p class="eyebrow">room catalog</p>
          <div class="stack">
            <div *ngFor="let room of rooms()" class="booking-item">
              <strong>{{ room.name }}</strong>
              <div class="muted">{{ room.capacity }} seats · {{ room.location }}</div>
              <div>{{ room.equipment.join(', ') }}</div>
            </div>
          </div>
        </div>
      </aside>
    </section>
  `,
})
export class AdminComponent {
  private readonly state = inject(AppStateService);
  private readonly fb = inject(FormBuilder);

  readonly rooms = this.state.rooms;
  selectedRoomId = this.rooms()[0]?.id ?? 'room-1';

  readonly form = this.fb.nonNullable.group({
    name: [''],
    capacity: [4],
    location: [''],
    description: [''],
    equipment: [''],
  });

  constructor() {
    this.loadRoom(this.selectedRoomId);
  }

  pickRoom(roomId: string): void {
    this.selectedRoomId = roomId;
    this.loadRoom(roomId);
  }

  save(): void {
    const value = this.form.getRawValue();
    this.state.updateRoom(this.selectedRoomId, {
      name: value.name,
      capacity: Number(value.capacity),
      location: value.location,
      description: value.description,
      equipment: value.equipment
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    });
  }

  private loadRoom(roomId: string): void {
    const room = this.state.roomById(roomId);
    if (!room) {
      return;
    }

    this.form.setValue({
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      description: room.description,
      equipment: room.equipment.join(', '),
    });
  }
}
