import { BookingDraft } from '../../models';
import { AppStateService } from '../app-state.service';
import { DEMO_BOOKINGS, DEMO_ROOMS, DEMO_USER } from '../mock-data';

describe('AppStateService', () => {
  let service: AppStateService;

  const makeDraft = (patch: Partial<BookingDraft> = {}): BookingDraft => ({
    roomId: 'room-4',
    title: 'Test meeting',
    date: '2026-06-20',
    startTime: '09:00',
    endTime: '10:00',
    participants: 2,
    equipment: [],
    recurrence: 'none',
    occurrences: 1,
    ...patch,
  });

  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('venue-session', JSON.stringify(DEMO_USER));
    }
    if (typeof (globalThis as any).crypto === 'undefined') {
      (globalThis as any).crypto = {
        randomUUID: () => `test-${Math.random().toString(36).slice(2)}`,
      };
    } else if (typeof (globalThis as any).crypto.randomUUID !== 'function') {
      (globalThis as any).crypto.randomUUID = () => `test-${Math.random().toString(36).slice(2)}`;
    }

    service = new AppStateService();
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('venue-session');
    }
  });

  it('initializes with demo data', () => {
    const user = service.user();
    expect(user).toBeTruthy();
    expect(user?.email).toBe(DEMO_USER.email);
    expect(service.rooms().length).toBe(DEMO_ROOMS.length);
    expect(service.bookings().length).toBe(DEMO_BOOKINGS.length);
  });

  it('login sets user and logout clears it', () => {
    service.login('john@company.local', 'John');
    expect(service.user()).toBeTruthy();
    expect(service.user()?.email).toBe('john@company.local');

    service.logout();
    expect(service.user()).toBeNull();
  });

  it('setFilters updates filters and filteredRooms uses capacity', () => {
    service.setFilters({ capacity: 8 });
    const filters = service.filters();
    expect(filters.capacity).toBe(8);
    const filtered = service.filteredRooms();
    expect(filtered.every((room) => room.capacity >= 8)).toBeTruthy();
  });

  it('filters by active booking availability', () => {
    service.setFilters({
      date: '2026-06-06',
      time: '10:15',
      availableOnly: true,
    });

    expect(service.filteredRooms().some((room) => room.id === 'room-1')).toBe(false);
  });

  it('filters by Russian equipment aliases', () => {
    service.setFilters({ equipment: 'проектор' });

    expect(service.filteredRooms()).toHaveLength(3);
    expect(service.filteredRooms().every((room) => room.equipment.includes('projector'))).toBe(
      true,
    );
  });

  it('createBooking returns an error when room does not exist', () => {
    const result = service.createBooking(makeDraft({ roomId: 'unknown' }));
    expect(result.ok).toBe(false);
  });

  it('createBooking rejects when participants exceed capacity', () => {
    const room = service.rooms()[0];
    const result = service.createBooking(
      makeDraft({ roomId: room.id, participants: room.capacity + 10 }),
    );
    expect(result.ok).toBe(false);
  });

  it('createBooking rejects conflicting room time', () => {
    const result = service.createBooking(
      makeDraft({
        roomId: 'room-1',
        date: '2026-06-06',
        startTime: '10:15',
        endTime: '10:30',
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain('already has an active booking');
  });

  it('createBooking succeeds for valid draft and updates rooms/bookings', () => {
    const beforeBookings = service.bookings().length;
    const result = service.createBooking(makeDraft());
    expect(result.ok).toBe(true);
    expect(result.value?.length).toBe(1);
    expect(service.bookings().length).toBe(beforeBookings + 1);
    expect(service.roomStatus('room-4')).toBe('busy');
  });

  it('createBooking supports weekly recurring bookings', () => {
    const beforeBookings = service.bookings().length;
    const result = service.createBooking(
      makeDraft({ recurrence: 'weekly', occurrences: 3, date: '2026-07-01' }),
    );

    expect(result.ok).toBe(true);
    expect(result.value?.length).toBe(3);
    expect(service.bookings().length).toBe(beforeBookings + 3);
  });

  it('updateBooking moves an existing booking', () => {
    const created = service.createBooking(makeDraft({ title: 'Move target' })).value?.[0];
    expect(created).toBeTruthy();

    const result = service.updateBooking(
      created?.id ?? '',
      makeDraft({ title: 'Moved', date: '2026-06-21', startTime: '11:00', endTime: '12:00' }),
    );

    expect(result.ok).toBe(true);
    expect(service.bookingById(created?.id)?.date).toBe('2026-06-21');
  });

  it('cancelBooking marks booking as cancelled and frees room with no other active bookings', () => {
    const created = service.createBooking(makeDraft({ title: 'Cancel target' })).value?.[0];
    expect(created).toBeTruthy();

    const result = service.cancelBooking(created?.id ?? '');
    expect(result.ok).toBe(true);
    expect(service.bookingById(created?.id)?.status).toBe('cancelled');
    expect(service.roomStatus('room-4')).toBe('free');
  });

  it('deleteBooking removes booking', () => {
    const created = service.createBooking(makeDraft({ title: 'Delete target' })).value?.[0];
    expect(created).toBeTruthy();

    const result = service.deleteBooking(created?.id ?? '');
    expect(result.ok).toBe(true);
    expect(service.bookingById(created?.id)).toBeNull();
  });

  it('supports room create, update and delete', () => {
    const created = service.createRoom({
      name: 'focus room',
      capacity: 2,
      equipment: ['wifi'],
      description: 'Small focus space.',
      location: 'floor 1',
      status: 'free',
    });
    expect(created.ok).toBe(true);

    const roomId = created.value?.id ?? '';
    const updated = service.updateRoom(roomId, { capacity: 3 });
    expect(updated.ok).toBe(true);
    expect(service.roomById(roomId)?.capacity).toBe(3);

    const deleted = service.deleteRoom(roomId);
    expect(deleted.ok).toBe(true);
    expect(service.roomById(roomId)).toBeNull();
  });

  it('blocks deleting a room with active bookings', () => {
    const result = service.deleteRoom('room-1');
    expect(result.ok).toBe(false);
  });

  it('statistics computed returns expected shape and values', () => {
    const stats = service.statistics();
    expect(stats).toHaveProperty('activeBookings');
    expect(stats).toHaveProperty('cancelledBookings');
    expect(typeof stats.utilization).toBe('number');
  });

  it('currentUserBookings returns only bookings for current user', () => {
    const current = service.currentUserBookings();
    const all = service.bookings();
    expect(current.every((booking) => booking.userId === service.user()?.id)).toBeTruthy();
    expect(current.length).toBeLessThanOrEqual(all.length);
  });
});
