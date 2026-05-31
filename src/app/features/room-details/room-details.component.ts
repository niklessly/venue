import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppStateService } from '../../core/app-state.service';

@Component({
  standalone: true,
  imports: [CommonModule],
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

        <button class="btn" type="button" (click)="book()">book this room</button>
      </article>

      <aside class="aside-info">
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
    void this.router.navigate(['/page'], { queryParams: { roomId: this.room.id } });
  }
}
