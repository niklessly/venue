import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { Booking, Room, User } from '../models';

export interface VenueApiSnapshot {
  rooms: Room[];
  bookings: Booking[];
  users: User[];
}

@Injectable({ providedIn: 'root' })
export class VenueApiService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private readonly http: HttpClient) {}

  loadAll(): Observable<VenueApiSnapshot> {
    return forkJoin({
      rooms: this.http.get<Room[]>(`${this.baseUrl}/rooms`),
      bookings: this.http.get<Booking[]>(`${this.baseUrl}/bookings`),
      users: this.http.get<User[]>(`${this.baseUrl}/users`),
    });
  }

  createRoom(room: Room): Observable<Room> {
    return this.http.post<Room>(`${this.baseUrl}/rooms`, room);
  }

  updateRoom(room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.baseUrl}/rooms/${room.id}`, room);
  }

  deleteRoom(roomId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rooms/${roomId}`);
  }

  createBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/bookings`, booking);
  }

  updateBooking(booking: Booking): Observable<Booking> {
    return this.http.put<Booking>(`${this.baseUrl}/bookings/${booking.id}`, booking);
  }

  deleteBooking(bookingId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/bookings/${bookingId}`);
  }
}
