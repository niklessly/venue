import { Routes } from '@angular/router';
import { adminGuard } from './core/admin.guard';
import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guest.guard';

export const routes: Routes = [
    {
        path: 'auth/login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('./shell/main-shell.component').then((m) => m.MainShellComponent),
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'rooms' },
            {
                path: 'rooms',
                loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
            },
            {
                path: 'room-details/:id',
                loadComponent: () => import('./features/room-details/room-details.component').then((m) => m.RoomDetailsComponent),
            },
            {
                path: 'rooms/:id',
                loadComponent: () => import('./features/room-details/room-details.component').then((m) => m.RoomDetailsComponent),
            },
            {
                path: 'rooms/:id/book',
                loadComponent: () => import('./features/booking/booking.component').then((m) => m.BookingComponent),
            },
            {
                path: 'page',
                loadComponent: () => import('./features/booking/booking.component').then((m) => m.BookingComponent),
            },
            {
                path: 'room-details',
                redirectTo: 'rooms',
                pathMatch: 'full',
            },
            {
                path: 'bookings',
                loadComponent: () => import('./features/bookings/bookings.component').then((m) => m.BookingsComponent),
            },
            {
                path: 'statistics',
                loadComponent: () => import('./features/statistics/statistics.component').then((m) => m.StatisticsComponent),
            },
            {
                path: 'admin',
                canActivate: [adminGuard],
                loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent),
            },
        ],
    },
    { path: '**', redirectTo: 'rooms' },
];