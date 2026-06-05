export type BookingStatus = 'active' | 'cancelled';
export type Recurrence = 'none' | 'daily' | 'weekly';
export type SortBy = 'name' | 'capacity' | 'status';
export type UserRole = 'employee' | 'admin';

export interface Room {
  id: string;
  companyId: string;
  name: string;
  capacity: number;
  equipment: string[];
  description: string;
  location: string;
  status: 'free' | 'busy';
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  companyId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: number;
  equipment: string[];
  status: BookingStatus;
  recurrence: Recurrence;
  recurrenceParentId?: string;
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface RoomFilters {
  date: string;
  time: string;
  capacity: number | null;
  equipment: string;
  sortBy: SortBy;
  availableOnly: boolean;
}

export interface BookingDraft {
  roomId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: number;
  equipment: string[];
  recurrence: Recurrence;
  occurrences: number;
}

export interface RoomDraft {
  name: string;
  capacity: number;
  equipment: string[];
  description: string;
  location: string;
  status: 'free' | 'busy';
}

export interface AppStatistics {
  activeBookings: number;
  cancelledBookings: number;
  popularRoom: string;
  freeRoom: string;
  utilization: number;
}

export interface OperationResult<T> {
  ok: boolean;
  value?: T;
  error?: string;
}
