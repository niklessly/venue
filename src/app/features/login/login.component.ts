import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { AppStateService } from '../../core/app-state.service';
import { I18nService, Language } from '../../core/i18n.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="auth-layout">
      <aside class="auth-visual">
        <div>
          <div style="display:flex; justify-content:space-between; gap: 14px; align-items:start;">
            <div class="brand">venue</div>
            <div class="language-switch" [attr.aria-label]="i18n.t('language')">
              <button
                type="button"
                [class.active]="i18n.language() === 'ru'"
                (click)="setLanguage('ru')"
              >
                RU
              </button>
              <button
                type="button"
                [class.active]="i18n.language() === 'en'"
                (click)="setLanguage('en')"
              >
                EN
              </button>
            </div>
          </div>
          <p class="muted" style="max-width: 28rem; margin-top: 10px;">
            {{ i18n.t('loginVisualLead') }}
          </p>
        </div>

        <div class="stack">
          <div class="room-card">
            <div class="room-name">{{ i18n.t('filterStepTitle') }}</div>
            <div class="room-meta">
              <span>{{ i18n.t('date') }}</span>
              <span>{{ i18n.t('capacity') }}</span>
            </div>
          </div>
          <div class="room-card">
            <div class="room-name">{{ i18n.roomName('room 1') }}</div>
            <div class="room-meta">
              <span>{{ i18n.equipment('whiteboard') }}</span>
              <span>{{ i18n.equipment('projector') }}</span>
            </div>
          </div>
        </div>
      </aside>

      <div class="auth-card">
        <div class="card">
          <p class="eyebrow">{{ i18n.t('welcomeBack') }}</p>
          <h1 style="margin: 0 0 8px;">{{ i18n.t('login') }}</h1>
          <p class="muted" style="margin: 0 0 24px;">
            {{ i18n.t('loginLead') }}
          </p>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field">
              <label for="name">{{ i18n.t('name') }}</label>
              <input id="name" formControlName="name" placeholder="Mila Ivanova" />
            </div>

            <div class="field">
              <label for="email">{{ i18n.t('email') }}</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="mila@venue.local"
              />
            </div>

            <div class="field">
              <label for="password">{{ i18n.t('password') }}</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="••••••••"
              />
            </div>

            <button tuiButton class="btn" type="submit" [disabled]="form.invalid">
              {{ i18n.t('enterDashboard') }}
            </button>
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
  readonly i18n = inject(I18nService);

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

  setLanguage(language: Language): void {
    this.i18n.setLanguage(language);
  }
}
