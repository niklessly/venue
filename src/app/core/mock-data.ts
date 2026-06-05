import { Booking, Room, User } from '../models';

export const DEMO_ROOMS: Room[] = [
  {
    id: 'room-1',
    companyId: 'company-1',
    name: 'room 1',
    capacity: 4,
    equipment: ['projector', 'wifi'],
    description: 'Compact room for short meetings and quick decisions.',
    location: 'floor 2, east wing',
    status: 'free',
  },
  {
    id: 'room-2',
    companyId: 'company-1',
    name: 'room 2',
    capacity: 6,
    equipment: ['projector', 'video conference', 'wifi'],
    description: 'Good for team reviews and hybrid meetings.',
    location: 'floor 2, north wing',
    status: 'busy',
  },
  {
    id: 'room-3',
    companyId: 'company-1',
    name: 'room 3',
    capacity: 8,
    equipment: ['video conference', 'whiteboard', 'wifi'],
    description: 'A slightly larger room for planning sessions.',
    location: 'floor 3, west wing',
    status: 'free',
  },
  {
    id: 'room-4',
    companyId: 'company-1',
    name: 'room 4',
    capacity: 10,
    equipment: ['projector', 'video conference', 'whiteboard', 'wifi'],
    description: 'Largest room in the office for workshops.',
    location: 'floor 3, south wing',
    status: 'free',
  },
];

export const DEMO_USER: User = {
  id: 'user-1',
  companyId: 'company-1',
  name: 'Mila Ivanova',
  email: 'mila@venue.local',
  role: 'employee',
  token: 'demo-token',
};

export const DEMO_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    roomId: 'room-1',
    userId: 'user-1',
    companyId: 'company-1',
    title: 'Project kickoff',
    date: '2026-06-06',
    startTime: '10:00',
    endTime: '10:45',
    participants: 3,
    equipment: ['projector'],
    status: 'active',
    recurrence: 'none',
  },
  {
    id: 'booking-2',
    roomId: 'room-3',
    userId: 'user-1',
    companyId: 'company-1',
    title: 'Design review',
    date: '2026-06-07',
    startTime: '14:00',
    endTime: '15:00',
    participants: 5,
    equipment: ['video conference', 'whiteboard'],
    status: 'active',
    recurrence: 'none',
  },
];
