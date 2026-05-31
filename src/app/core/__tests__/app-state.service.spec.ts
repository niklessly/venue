import { AppStateService } from '../app-state.service';
import { DEMO_BOOKINGS, DEMO_ROOMS, DEMO_USER } from '../mock-data';

describe('AppStateService', () => {
  let service: AppStateService;

  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('venue-session', JSON.stringify(DEMO_USER));
    }
    // polyfill for crypto.randomUUID in Node/jsdom test environment
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

  it('initializes with demo data when window is undefined', () => {
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
    expect(filtered.every((r) => r.capacity >= 8)).toBeTruthy();
  });

  it('createBooking returns null when room does not exist', () => {
    const result = service.createBooking({
      roomId: 'unknown',
      title: 'Test',
      date: '2026-05-10',
      startTime: '09:00',
      endTime: '10:00',
      participants: 2,
      equipment: [],
    });
    expect(result).toBeNull();
  });

  it('createBooking rejects when participants exceed capacity', () => {
    const room = service.rooms()[0];
    const result = service.createBooking({
      roomId: room.id,
      title: 'Too big',
      date: '2026-05-10',
      startTime: '09:00',
      endTime: '10:00',
      participants: room.capacity + 10,
      equipment: [],
    });
    expect(result).toBeNull();
  });

  it('createBooking succeeds for valid draft and updates rooms/bookings', () => {
    const room = service.rooms().find((r) => r.status === 'free') ?? service.rooms()[0];
    const beforeBookings = service.bookings().length;
    const draft = {
      roomId: room.id,
      title: 'Valid meeting',
      date: '2026-06-01',
      startTime: '11:00',
      endTime: '12:00',
      participants: Math.max(1, Math.min(room.capacity, 2)),
      equipment: [],
    };
    const booking = service.createBooking(draft);
    expect(booking).toBeTruthy();
    expect(service.bookings().length).toBe(beforeBookings + 1);
    expect(service.roomById(room.id)?.status).toBe('busy');
  });

  it('cancelBooking marks booking as cancelled', () => {
    const b = service.bookings()[0];
    service.cancelBooking(b.id);
    const updated = service.bookings().find((x) => x.id === b.id);
    expect(updated?.status).toBe('cancelled');
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
    expect(current.every((b) => b.userId === service.user()?.id)).toBeTruthy();
    expect(current.length).toBeLessThanOrEqual(all.length);
  });
});
