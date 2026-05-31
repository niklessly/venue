export type BookingStatus = 'active' | 'cancelled';
export type UserRole = 'employee' | 'admin';

export interface Room {
  id: string;
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
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: number;
  equipment: string[];
  status: BookingStatus;
}

export interface User {
  id: string;
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
  sortBy: 'name' | 'capacity' | 'status';
}

export interface BookingDraft {
  roomId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: number;
  equipment: string[];
}

export interface AppStatistics {
  activeBookings: number;
  cancelledBookings: number;
  popularRoom: string;
  freeRoom: string;
  utilization: number;
}
