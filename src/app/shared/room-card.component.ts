import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TuiBadge } from '@taiga-ui/kit';
import { Room } from '../models';

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [CommonModule, TuiBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="room-card" type="button" (click)="selected.emit(room.id)">
      <div>
        <div class="room-name">{{ room.name }}</div>
        <div class="muted">{{ room.location }}</div>
      </div>
      <div class="room-meta">
        <span>{{ room.capacity }} seats</span>
        <span tuiBadge [appearance]="room.status === 'free' ? 'positive' : 'warning'">
          {{ room.status }}
        </span>
      </div>
      <div class="equipment-line">{{ room.equipment.join(', ') }}</div>
    </button>
  `,
})
export class RoomCardComponent {
  @Input({ required: true }) room!: Room;
  @Output() readonly selected = new EventEmitter<string>();
}
