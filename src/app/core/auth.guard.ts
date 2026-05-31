import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from './app-state.service';

export const authGuard: CanActivateFn = () => {
    const state = inject(AppStateService);
    const router = inject(Router);

    if (state.user()) {
        return true;
    }

    return router.createUrlTree(['/auth/login']);
};