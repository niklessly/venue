import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { TuiBadge } from '@taiga-ui/kit';
import { I18nService } from '../core/i18n.service';
import { Room } from '../models';

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [CommonModule, TuiBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="room-card"
      [class.room-card-free]="displayStatus === 'free'"
      [class.room-card-busy]="displayStatus === 'busy'"
      type="button"
      (click)="selected.emit(room.id)"
    >
      <div>
        <div class="room-name">{{ i18n.roomName(room) }}</div>
        <div class="muted">{{ i18n.location(room.location) }}</div>
      </div>
      <div class="room-meta">
        <span>{{ i18n.seats(room.capacity) }}</span>
        <span tuiBadge [appearance]="displayStatus === 'free' ? 'positive' : 'warning'">
          {{ i18n.status(displayStatus) }}
        </span>
      </div>
      <div class="equipment-line">{{ i18n.equipmentList(room.equipment) }}</div>
      <div class="card-action">{{ i18n.t('selectAndBook') }}</div>
    </button>
  `,
})
export class RoomCardComponent {
  readonly i18n = inject(I18nService);
  @Input({ required: true }) room!: Room;
  @Input() status: Room['status'] | null = null;
  @Output() readonly selected = new EventEmitter<string>();

  get displayStatus(): Room['status'] {
    return this.status ?? this.room.status;
  }
}
