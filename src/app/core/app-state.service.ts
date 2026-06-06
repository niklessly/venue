import { Injectable, computed, effect, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import {
  AppStatistics,
  Booking,
  BookingDraft,
  OperationResult,
  Recurrence,
  Room,
  RoomDraft,
  RoomFilters,
  User,
} from '../models';
import { DEMO_BOOKINGS, DEMO_ROOMS, DEMO_USER } from './mock-data';
import { VenueApiService } from './venue-api.service';

const STORAGE_KEY = 'venue-session';
const MAX_RECURRENCES = 12;

@Injectable({ providedIn: 'root' })
export class AppStateService {
  readonly user = signal<User | null>(this.readUser());
  readonly loading = signal(false);
  readonly error = signal('');
  readonly apiReady = signal(false);
  readonly apiMessage = signal('Local demo data is active until mock API responds.');

  private readonly allUsers = signal<User[]>([DEMO_USER]);
  private readonly allRooms = signal<Room[]>(DEMO_ROOMS);
  private readonly allBookings = signal<Booking[]>(DEMO_BOOKINGS);

  readonly filters = signal<RoomFilters>({
    date: '',
    time: '',
    capacity: null,
    equipment: '',
    sortBy: 'name',
    availableOnly: false,
  });
  readonly selectedRoomId = signal<string>(DEMO_ROOMS[0]?.id ?? 'room-1');

  private readonly currentCompanyId = computed(() => this.user()?.companyId ?? DEMO_USER.companyId);

  readonly rooms = computed(() =>
    this.allRooms().filter((room) => room.companyId === this.currentCompanyId()),
  );

  readonly bookings = computed(() =>
    this.allBookings().filter((booking) => booking.companyId === this.currentCompanyId()),
  );

  readonly selectedRoom = computed(() => this.roomById(this.selectedRoomId()));

  readonly filteredRooms = computed(() => {
    const filters = this.filters();
    const equipmentQuery = filters.equipment.trim().toLowerCase();
    const normalizedEquipmentQuery = this.normalizeSearchQuery(equipmentQuery);
    const base = this.rooms().filter((room) => {
      const fitsCapacity = !filters.capacity || room.capacity >= filters.capacity;
      const fitsEquipment =
        !equipmentQuery ||
        [equipmentQuery, normalizedEquipmentQuery].some(
          (query) =>
            room.equipment.some((item) => item.toLowerCase().includes(query)) ||
            room.name.toLowerCase().includes(query) ||
            room.location.toLowerCase().includes(query),
        );
      const fitsAvailability =
        !filters.availableOnly ||
        !filters.date ||
        this.isRoomAvailable(room.id, filters.date, filters.time);

      return fitsCapacity && fitsEquipment && fitsAvailability;
    });

    return [...base].sort((left, right) => {
      if (filters.sortBy === 'capacity') {
        return right.capacity - left.capacity;
      }

      if (filters.sortBy === 'status') {
        return this.roomStatus(left.id).localeCompare(this.roomStatus(right.id));
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

  readonly upcomingNotifications = computed(() => {
    const today = this.today();

    return [...this.currentUserBookings()]
      .filter((booking) => booking.status === 'active' && booking.date >= today)
      .sort((left, right) =>
        `${left.date}T${left.startTime}`.localeCompare(`${right.date}T${right.startTime}`),
      )
      .slice(0, 3);
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
      this.rooms().find((room) => this.roomStatus(room.id) === 'free')?.name ??
      this.rooms()[0]?.name ??
      'room';
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

  constructor(private readonly api?: VenueApiService) {
    this.refreshRoomStatuses();

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

    if (this.api) {
      void this.loadInitialData();
    }
  }

  async loadInitialData(): Promise<void> {
    if (!this.api) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      const snapshot = await firstValueFrom(this.api.loadAll());
      this.allRooms.set(snapshot.rooms);
      this.allBookings.set(snapshot.bookings);
      this.allUsers.set(snapshot.users);
      this.refreshRoomStatuses();
      this.apiReady.set(true);
      this.apiMessage.set('Mock API connected.');
    } catch {
      this.apiReady.set(false);
      this.apiMessage.set('Mock API is offline. Local demo data is used.');
    } finally {
      this.loading.set(false);
    }
  }

  login(email: string, name: string): User {
    const normalizedEmail = email.trim().toLowerCase();
    const knownUser = this.allUsers().find((item) => item.email.toLowerCase() === normalizedEmail);
    const role = normalizedEmail.includes('admin') ? 'admin' : (knownUser?.role ?? 'employee');
    const companyId =
      knownUser?.companyId ?? (normalizedEmail.includes('partner') ? 'company-2' : 'company-1');
    const user: User = {
      id: knownUser?.id ?? `user-${this.slug(normalizedEmail)}`,
      companyId,
      name: name.trim() || knownUser?.name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      role,
      token: knownUser?.token ?? 'demo-token',
    };

    if (!knownUser) {
      this.allUsers.update((current) => [...current, user]);
    }

    this.user.set(user);
    this.selectedRoomId.set(this.rooms()[0]?.id ?? DEMO_ROOMS[0]?.id ?? 'room-1');

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
      availableOnly: false,
    });
  }

  selectRoom(roomId: string): void {
    this.selectedRoomId.set(roomId);
  }

  roomById(roomId: string | null | undefined): Room | null {
    return this.rooms().find((room) => room.id === roomId) ?? null;
  }

  bookingById(bookingId: string | null | undefined): Booking | null {
    return this.bookings().find((booking) => booking.id === bookingId) ?? null;
  }

  roomStatus(roomId: string): 'free' | 'busy' {
    const active = this.bookings().some(
      (booking) => booking.roomId === roomId && booking.status === 'active',
    );

    return active ? 'busy' : 'free';
  }

  isRoomAvailable(roomId: string, date: string, time = ''): boolean {
    if (!date) {
      return true;
    }

    if (!time) {
      return !this.bookings().some(
        (booking) =>
          booking.roomId === roomId && booking.date === date && booking.status === 'active',
      );
    }

    const slot: BookingDraft = {
      roomId,
      title: 'Availability check',
      date,
      startTime: time,
      endTime: this.addMinutes(time, 30),
      participants: 1,
      equipment: [],
      recurrence: 'none',
      occurrences: 1,
    };

    return !this.hasConflict(slot);
  }

  createBooking(draft: BookingDraft): OperationResult<Booking[]> {
    const validation = this.validateBookingDraft(draft);
    if (validation) {
      return { ok: false, error: validation };
    }

    const user = this.user();
    const room = this.roomById(draft.roomId);
    if (!user || !room) {
      return { ok: false, error: 'Room or user is missing.' };
    }

    const parentId = `booking-${this.uuid()}`;
    const bookings = this.expandRecurringDraft(draft).map((item, index) => ({
      id: index === 0 ? parentId : `booking-${this.uuid()}`,
      roomId: room.id,
      userId: user.id,
      companyId: user.companyId,
      title: item.title.trim() || `${room.name} booking`,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      participants: item.participants,
      equipment: item.equipment,
      status: 'active' as const,
      recurrence: draft.recurrence,
      recurrenceParentId: draft.recurrence === 'none' ? undefined : parentId,
    }));

    this.allBookings.update((current) => [...bookings, ...current]);
    this.refreshRoomStatuses();
    bookings.forEach((booking) => this.sync(() => this.api?.createBooking(booking)));

    return { ok: true, value: bookings };
  }

  updateBooking(bookingId: string, draft: BookingDraft): OperationResult<Booking> {
    const existing = this.bookingById(bookingId);
    if (!existing) {
      return { ok: false, error: 'Booking was not found.' };
    }

    const validation = this.validateBookingDraft(
      { ...draft, recurrence: 'none', occurrences: 1 },
      bookingId,
    );
    if (validation) {
      return { ok: false, error: validation };
    }

    const updated: Booking = {
      ...existing,
      roomId: draft.roomId,
      title: draft.title.trim() || existing.title,
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      participants: draft.participants,
      equipment: draft.equipment,
      recurrence: 'none',
      recurrenceParentId: existing.recurrenceParentId,
      status: 'active',
    };

    this.allBookings.update((current) =>
      current.map((booking) => (booking.id === bookingId ? updated : booking)),
    );
    this.refreshRoomStatuses();
    this.sync(() => this.api?.updateBooking(updated));

    return { ok: true, value: updated };
  }

  cancelBooking(bookingId: string): OperationResult<Booking> {
    const existing = this.bookingById(bookingId);
    if (!existing) {
      return { ok: false, error: 'Booking was not found.' };
    }

    const updated: Booking = { ...existing, status: 'cancelled' };
    this.allBookings.update((current) =>
      current.map((booking) => (booking.id === bookingId ? updated : booking)),
    );
    this.refreshRoomStatuses();
    this.sync(() => this.api?.updateBooking(updated));

    return { ok: true, value: updated };
  }

  deleteBooking(bookingId: string): OperationResult<void> {
    const existing = this.bookingById(bookingId);
    if (!existing) {
      return { ok: false, error: 'Booking was not found.' };
    }

    this.allBookings.update((current) => current.filter((booking) => booking.id !== bookingId));
    this.refreshRoomStatuses();
    this.sync(() => this.api?.deleteBooking(bookingId));

    return { ok: true };
  }

  createRoom(draft: RoomDraft): OperationResult<Room> {
    const user = this.user();
    if (!user) {
      return { ok: false, error: 'User is missing.' };
    }

    const validation = this.validateRoomDraft(draft);
    if (validation) {
      return { ok: false, error: validation };
    }

    const room: Room = {
      id: `room-${this.uuid()}`,
      companyId: user.companyId,
      ...draft,
      capacity: Number(draft.capacity),
      status: draft.status,
    };

    this.allRooms.update((current) => [room, ...current]);
    this.sync(() => this.api?.createRoom(room));

    return { ok: true, value: room };
  }

  updateRoom(roomId: string, patch: Partial<RoomDraft>): OperationResult<Room> {
    const room = this.roomById(roomId);
    if (!room) {
      return { ok: false, error: 'Room was not found.' };
    }

    const updated: Room = {
      ...room,
      ...patch,
      capacity: Number(patch.capacity ?? room.capacity),
      equipment: patch.equipment ?? room.equipment,
    };
    const validation = this.validateRoomDraft(updated);
    if (validation) {
      return { ok: false, error: validation };
    }

    this.allRooms.update((current) => current.map((item) => (item.id === roomId ? updated : item)));
    this.sync(() => this.api?.updateRoom(updated));

    return { ok: true, value: updated };
  }

  deleteRoom(roomId: string): OperationResult<void> {
    const room = this.roomById(roomId);
    if (!room) {
      return { ok: false, error: 'Room was not found.' };
    }

    const hasActiveBookings = this.bookings().some(
      (booking) => booking.roomId === roomId && booking.status === 'active',
    );
    if (hasActiveBookings) {
      return { ok: false, error: 'Cancel or move active bookings before deleting this room.' };
    }

    this.allRooms.update((current) => current.filter((item) => item.id !== roomId));
    this.sync(() => this.api?.deleteRoom(roomId));

    return { ok: true };
  }

  activeBookingsForRoom(roomId: string): Booking[] {
    return this.bookings().filter(
      (booking) => booking.roomId === roomId && booking.status === 'active',
    );
  }

  hasConflict(draft: BookingDraft, excludeBookingId = ''): boolean {
    return this.expandRecurringDraft(draft).some((item) =>
      this.bookings().some(
        (booking) =>
          booking.id !== excludeBookingId &&
          booking.roomId === item.roomId &&
          booking.date === item.date &&
          booking.status === 'active' &&
          this.timesOverlap(item.startTime, item.endTime, booking.startTime, booking.endTime),
      ),
    );
  }

  private validateBookingDraft(draft: BookingDraft, excludeBookingId = ''): string | null {
    const room = this.roomById(draft.roomId);
    const user = this.user();
    if (!user || !room) {
      return 'Choose a valid room before booking.';
    }

    if (draft.participants < 1) {
      return 'Participants count must be at least 1.';
    }

    if (draft.participants > room.capacity) {
      return 'The room capacity is smaller than the selected group size.';
    }

    if (!draft.date || !draft.startTime || !draft.endTime) {
      return 'Date, start time and end time are required.';
    }

    if (this.toMinutes(draft.startTime) >= this.toMinutes(draft.endTime)) {
      return 'End time must be later than start time.';
    }

    const missingEquipment = draft.equipment.filter((item) => !room.equipment.includes(item));
    if (missingEquipment.length) {
      return `Room does not include: ${missingEquipment.join(', ')}.`;
    }

    if (this.hasConflict(draft, excludeBookingId)) {
      return 'This room already has an active booking in the selected time slot.';
    }

    return null;
  }

  private validateRoomDraft(draft: RoomDraft): string | null {
    if (!draft.name.trim()) {
      return 'Room name is required.';
    }

    if (Number(draft.capacity) < 1) {
      return 'Room capacity must be at least 1.';
    }

    if (!draft.location.trim()) {
      return 'Room location is required.';
    }

    return null;
  }

  private expandRecurringDraft(draft: BookingDraft): BookingDraft[] {
    const occurrences =
      draft.recurrence === 'none'
        ? 1
        : Math.min(Math.max(Number(draft.occurrences) || 1, 1), MAX_RECURRENCES);

    return Array.from({ length: occurrences }, (_, index) => ({
      ...draft,
      date: this.addOccurrence(draft.date, draft.recurrence, index),
    }));
  }

  private addOccurrence(date: string, recurrence: Recurrence, index: number): string {
    if (recurrence === 'none' || index === 0) {
      return date;
    }

    const value = new Date(`${date}T00:00:00`);
    value.setDate(value.getDate() + (recurrence === 'daily' ? index : index * 7));

    return value.toISOString().slice(0, 10);
  }

  private refreshRoomStatuses(): void {
    const activeRoomIds = new Set(
      this.allBookings()
        .filter((booking) => booking.status === 'active')
        .map((booking) => booking.roomId),
    );

    this.allRooms.update((rooms) =>
      rooms.map((room) => ({ ...room, status: activeRoomIds.has(room.id) ? 'busy' : 'free' })),
    );
  }

  private timesOverlap(
    firstStart: string,
    firstEnd: string,
    secondStart: string,
    secondEnd: string,
  ): boolean {
    return (
      this.toMinutes(firstStart) < this.toMinutes(secondEnd) &&
      this.toMinutes(secondStart) < this.toMinutes(firstEnd)
    );
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
  }

  private addMinutes(time: string, minutesToAdd: number): string {
    const total = this.toMinutes(time) + minutesToAdd;
    const hours = Math.floor(total / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (total % 60).toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private uuid(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return Math.random().toString(36).slice(2);
  }

  private slug(value: string): string {
    return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || this.uuid();
  }

  private normalizeSearchQuery(value: string): string {
    return value
      .replaceAll('проектор', 'projector')
      .replaceAll('видеосвязь', 'video conference')
      .replaceAll('видео', 'video')
      .replaceAll('доска', 'whiteboard')
      .replaceAll('вайфай', 'wifi')
      .replaceAll('wi-fi', 'wifi')
      .replaceAll('зал', 'room')
      .replaceAll('этаж', 'floor');
  }

  private sync<T>(requestFactory: () => Observable<T> | undefined): void {
    if (!this.apiReady()) {
      return;
    }

    const request = requestFactory();
    if (!request) {
      return;
    }

    void firstValueFrom(request).catch(() => {
      this.error.set('Mock API sync failed. Local changes are kept in memory.');
    });
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
