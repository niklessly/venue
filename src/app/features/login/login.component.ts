import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStateService } from '../../core/app-state.service';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <section class="auth-layout">
      <aside class="auth-visual">
        <div>
          <div class="brand">venue</div>
          <p class="muted" style="max-width: 28rem; margin-top: 10px;">
            simple room booking prototype with a soft pink and yellow interface.
          </p>
        </div>

        <div class="stack">
          <div class="room-card">
            <div class="room-name">dashboard</div>
            <div class="room-meta"><span>filter by date</span><span>capacity</span></div>
          </div>
          <div class="room-card">
            <div class="room-name">room 1</div>
            <div class="room-meta"><span>quiet room</span><span>projector</span></div>
          </div>
        </div>
      </aside>

      <div class="auth-card">
        <div class="card">
          <p class="eyebrow">welcome back</p>
          <h1 style="margin: 0 0 8px;">login</h1>
          <p class="muted" style="margin: 0 0 24px;">
            sign in to view rooms, create bookings and manage your schedule.
          </p>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field">
              <label for="name">name</label>
              <input id="name" formControlName="name" placeholder="Mila Ivanova" />
            </div>

            <div class="field">
              <label for="email">email</label>
              <input id="email" type="email" formControlName="email" placeholder="mila@venue.local" />
            </div>

            <div class="field">
              <label for="password">password</label>
              <input id="password" type="password" formControlName="password" placeholder="••••••••" />
            </div>

            <button class="btn" type="submit" [disabled]="form.invalid">enter dashboard</button>
          </form>
        </div>
      </div>
    </section>
  `,
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly state = inject(AppStateService);
    private readonly router = inject(Router);

    readonly form = this.fb.nonNullable.group({
        name: ['Mila Ivanova', Validators.required],
        email: ['mila@venue.local', [Validators.required, Validators.email]],
        password: ['demo-password', Validators.required],
    });

    submit(): void {
        if (this.form.invalid) {
            return;
        }

        const value = this.form.getRawValue();
        this.state.login(value.email, value.name || value.email.split('@')[0]);
        void this.router.navigate(['/rooms']);
    }
}