import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppStateService } from '../../core/app-state.service';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <section class="panel">
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
          <input id="equipment" formControlName="equipment" placeholder="projector" />
        </div>
        <div class="field">
          <label for="sortBy">sort</label>
          <select id="sortBy" formControlName="sortBy">
            <option value="name">by name</option>
            <option value="capacity">by capacity</option>
            <option value="status">by status</option>
          </select>
        </div>
      </form>

      <div style="display:flex; justify-content:space-between; gap: 12px; align-items:center; margin-top: 18px;">
        <div>
          <p class="eyebrow">available rooms</p>
          <h2 style="margin:0;">choose the room that fits your meeting</h2>
        </div>
        <div class="user-chip">{{ rooms().length }} rooms</div>
      </div>

      <div class="rooms-grid" *ngIf="rooms().length; else emptyRooms">
        <button class="room-card" *ngFor="let room of rooms()" type="button" (click)="openRoom(room.id)">
          <div class="room-name">{{ room.name }}</div>
          <div class="room-meta">
            <span>{{ room.capacity }} seats</span>
            <span>{{ room.status }}</span>
          </div>
        </button>
      </div>

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

    readonly form = this.fb.nonNullable.group({
        date: [''],
        time: [''],
        capacity: [0],
        equipment: [''],
        sortBy: ['name' as const],
    });

    constructor() {
        this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
            this.state.setFilters({
                date: value.date ?? '',
                time: value.time ?? '',
                capacity: value.capacity ? Number(value.capacity) : null,
                equipment: value.equipment ?? '',
                sortBy: value.sortBy ?? 'name',
            });
        });

        this.state.setFilters(this.form.getRawValue());
    }

    openRoom(roomId: string): void {
        this.state.selectRoom(roomId);
        void this.router.navigate(['/room-details', roomId]);
    }
}