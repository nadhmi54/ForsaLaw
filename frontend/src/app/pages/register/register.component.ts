import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('motDePasse')?.value;
  const confirm = group.get('motDePasseConfirm')?.value;
  if (!pass || !confirm) {
    return null;
  }
  return pass === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);

  /** Champs alignés sur {@code RegisterRequest} (nom, prenom, email, motDePasse, roleUser). */
  readonly form = this.fb.nonNullable.group(
    {
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      prenom: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      motDePasse: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      motDePasseConfirm: ['', [Validators.required]],
      roleUser: ['client', Validators.required]
    },
    { validators: passwordMatchValidator }
  );

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { motDePasseConfirm: _c, ...payload } = this.form.getRawValue();
    // TODO: POST /api/auth/register
    console.debug('Inscription (à brancher sur l’API)', payload);
  }
}
