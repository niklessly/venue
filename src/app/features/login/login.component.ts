import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { AppStateService } from '../../core/app-state.service';
import { I18nService, Language } from '../../core/i18n.service';

type LoginField = 'name' | 'email' | 'password';

function nonBlank(control: AbstractControl): ValidationErrors | null {
  return String(control.value ?? '').trim() ? null : { required: true };
}

function personName(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim();

  if (!value) {
    return { required: true };
  }

  return value.length >= 2 ? null : { shortName: true };
}

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
        </div>

        <div class="auth-copy">
          <p class="eyebrow">{{ i18n.t('meetingRooms') }}</p>
          <h2>{{ i18n.t('authSlogan') }}</h2>
          <p>{{ i18n.t('authDescription') }}</p>
        </div>
      </aside>

      <div class="auth-card">
        <div class="card">
          <p class="eyebrow">{{ i18n.t('welcomeBack') }}</p>
          <h1 style="margin: 0 0 8px;">{{ i18n.t('login') }}</h1>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field">
              <label for="name">{{ i18n.t('name') }}</label>
              <input id="name" formControlName="name" placeholder="Анна Петрова" />
              <p class="field-error" *ngIf="errorFor('name')">{{ errorFor('name') }}</p>
            </div>

            <div class="field">
              <label for="email">{{ i18n.t('email') }}</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="name@company.ru"
              />
              <p class="field-error" *ngIf="errorFor('email')">{{ errorFor('email') }}</p>
            </div>

            <div class="field">
              <label for="password">{{ i18n.t('password') }}</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="••••••••"
              />
              <p class="field-error" *ngIf="errorFor('password')">{{ errorFor('password') }}</p>
            </div>

            <button tuiButton class="btn auth-submit" type="submit">
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
  submitted = false;

  readonly form = this.fb.nonNullable.group({
    name: ['', personName],
    email: ['', [Validators.required, Validators.email]],
    password: ['', nonBlank],
  });

  submit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.state.login(value.email.trim(), value.name.trim() || value.email.split('@')[0]);
    void this.router.navigate(['/rooms']);
  }

  setLanguage(language: Language): void {
    this.i18n.setLanguage(language);
  }

  errorFor(field: LoginField): string {
    const control = this.form.controls[field];

    if ((!this.submitted && !control.touched) || !control.errors) {
      return '';
    }

    if (field === 'name') {
      if (control.hasError('required')) {
        return this.i18n.t('nameRequired');
      }

      if (control.hasError('shortName')) {
        return this.i18n.t('nameTooShort');
      }
    }

    if (field === 'email') {
      if (control.hasError('required')) {
        return this.i18n.t('emailRequired');
      }

      if (control.hasError('email')) {
        return this.i18n.t('emailInvalid');
      }
    }

    if (field === 'password' && control.hasError('required')) {
      return this.i18n.t('passwordRequired');
    }

    return '';
  }
}
