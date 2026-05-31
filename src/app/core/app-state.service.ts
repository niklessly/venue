import { Injectable, computed, effect, signal } from '@angular/core';
import { AppStatistics, Booking, BookingDraft, Room, RoomFilters, User } from '../models';
import { DEMO_BOOKINGS, DEMO_ROOMS, DEMO_USER } from './mock-data';

const STORAGE_KEY = 'venue-session';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  readonly user = signal<User | null>(this.readUser());
  readonly rooms = signal<Room[]>(DEMO_ROOMS);
  readonly bookings = signal<Booking[]>(DEMO_BOOKINGS);
  readonly filters = signal<RoomFilters>({
    date: '',
    time: '',
    capacity: null,
    equipment: '',
    sortBy: 'name',
  });
  readonly selectedRoomId = signal<string>(DEMO_ROOMS[0]?.id ?? 'room-1');

  readonly selectedRoom = computed(() => this.roomById(this.selectedRoomId()));

  readonly filteredRooms = computed(() => {
    const filters = this.filters();
    const query = filters.equipment.trim().toLowerCase();
    const base = this.rooms().filter((room) => {
      const fitsCapacity = !filters.capacity || room.capacity >= filters.capacity;
      const fitsEquipment =
        !query || room.equipment.some((item) => item.toLowerCase().includes(query));
      return fitsCapacity && fitsEquipment;
    });

    return [...base].sort((left, right) => {
      if (filters.sortBy === 'capacity') {
        return right.capacity - left.capacity;
      }

      if (filters.sortBy === 'status') {
        return left.status.localeCompare(right.status);
      }

      return left.name.localeCompare(right.name);
    });
  });

  readonly currentUserBookings = computed(() => {
    const user = this.user();
    if (!user) {
      return [];
    }

    return this.bookings().filter((booking) => booking.userId === user.id);
  });

  readonly statistics = computed<AppStatistics>(() => {
    const activeBookings = this.bookings().filter((booking) => booking.status === 'active');
    const cancelledBookings = this.bookings().filter((booking) => booking.status === 'cancelled');
    const roomUsage = this.rooms().map((room) => {
      const count = activeBookings.filter((booking) => booking.roomId === room.id).length;
      return { room, count };
    });
    const topRoom =
      [...roomUsage].sort((left, right) => right.count - left.count)[0]?.room.name ?? 'room 1';
    const freeRoom =
      this.rooms().find((room) => room.status === 'free')?.name ?? this.rooms()[0]?.name ?? 'room';
    const utilization = this.rooms().length
      ? Math.round((activeBookings.length / this.rooms().length) * 25)
      : 0;

    return {
      activeBookings: activeBookings.length,
      cancelledBookings: cancelledBookings.length,
      popularRoom: topRoom,
      freeRoom,
      utilization,
    };
  });

  constructor() {
    effect(() => {
      const user = this.user();
      if (typeof window === 'undefined') {
        return;
      }

      if (user) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    });
  }

  login(email: string, name: string): User {
    const role = email.includes('admin') ? 'admin' : 'employee';
    const user: User = {
      id: DEMO_USER.id,
      name,
      email,
      role,
      token: 'demo-token',
    };

    this.user.set(user);
    return user;
  }

  logout(): void {
    this.user.set(null);
  }

  setFilters(patch: Partial<RoomFilters>): void {
    this.filters.update((current) => ({ ...current, ...patch }));
  }

  resetFilters(): void {
    this.filters.set({
      date: '',
      time: '',
      capacity: null,
      equipment: '',
      sortBy: 'name',
    });
  }

  selectRoom(roomId: string): void {
    this.selectedRoomId.set(roomId);
  }

  roomById(roomId: string | null | undefined): Room | null {
    return this.rooms().find((room) => room.id === roomId) ?? null;
  }

  createBooking(draft: BookingDraft): Booking | null {
    const user = this.user();
    const room = this.roomById(draft.roomId);
    if (!user || !room) {
      return null;
    }

    if (draft.participants > room.capacity) {
      return null;
    }

    const booking: Booking = {
      id: `booking-${crypto.randomUUID()}`,
      roomId: room.id,
      userId: user.id,
      title: draft.title.trim() || `${room.name} booking`,
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      participants: draft.participants,
      equipment: draft.equipment,
      status: 'active',
    };

    this.bookings.update((current) => [booking, ...current]);
    this.rooms.update((current) =>
      current.map((item) => (item.id === room.id ? { ...item, status: 'busy' } : item)),
    );

    return booking;
  }

  cancelBooking(bookingId: string): void {
    this.bookings.update((current) =>
      current.map((booking) =>
        booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking,
      ),
    );
  }

  updateRoom(roomId: string, patch: Partial<Room>): void {
    this.rooms.update((current) =>
      current.map((room) => (room.id === roomId ? { ...room, ...patch } : room)),
    );
  }

  private readUser(): User | null {
    if (typeof window === 'undefined') {
      return DEMO_USER;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
