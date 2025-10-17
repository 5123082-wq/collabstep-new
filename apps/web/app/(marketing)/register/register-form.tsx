'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const MIN_PASSWORD_LENGTH = 6;

type FormState = {
  name: string;
  email: string;
  password: string;
  consent: boolean;
  error: string | null;
  loading: boolean;
};

const initialState: FormState = {
  name: '',
  email: '',
  password: '',
  consent: false,
  error: null,
  loading: false
};

export default function RegisterForm() {
  const router = useRouter();
  const [state, setState] = useState(initialState);

  const handleChange = (field: 'name' | 'email' | 'password') => (event: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleConsentChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, consent: event.target.checked }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state.loading) {
      return;
    }

    if (!state.name.trim() || !state.email.trim() || state.password.length < MIN_PASSWORD_LENGTH || !state.consent) {
      setState((prev) => ({ ...prev, error: 'Заполните все поля и подтвердите dev-режим.' }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          name: state.name.trim(),
          email: state.email.trim(),
          password: state.password
        })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setState((prev) => ({ ...prev, error: data?.error ?? 'Не удалось завершить регистрацию.', loading: false }));
        return;
      }

      const data = (await response.json().catch(() => null)) as { redirect?: string } | null;
      const base = data?.redirect ?? '/app/dashboard';
      const url = new URL(base, window.location.origin);
      url.searchParams.set('toast', 'register-success');
      router.push(`${url.pathname}${url.search}`);
    } catch (error) {
      setState((prev) => ({ ...prev, error: 'Не удалось завершить регистрацию.', loading: false }));
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
      <label className="block text-sm text-neutral-300">
        Имя
        <input
          type="text"
          name="name"
          value={state.name}
          onChange={handleChange('name')}
          className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-indigo-400 focus:outline-none"
          placeholder="Анна Смирнова"
          required
        />
      </label>
      <label className="block text-sm text-neutral-300">
        Почта
        <input
          type="email"
          name="email"
          value={state.email}
          onChange={handleChange('email')}
          className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-indigo-400 focus:outline-none"
          placeholder="user@collabverse.dev"
          required
        />
      </label>
      <label className="block text-sm text-neutral-300">
        Пароль
        <input
          type="password"
          name="password"
          value={state.password}
          onChange={handleChange('password')}
          className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-indigo-400 focus:outline-none"
          placeholder="Минимум 6 символов"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
      </label>
      <label className="flex items-start gap-3 text-sm text-neutral-300">
        <input
          type="checkbox"
          checked={state.consent}
          onChange={handleConsentChange}
          className="mt-1 h-4 w-4 border-neutral-600 text-indigo-500 focus:ring-indigo-500"
          required
        />
        <span>Это тестовый аккаунт (dev-режим)</span>
      </label>
      {state.error ? (
        <p role="alert" className="text-sm text-rose-300">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={state.loading}
        className="w-full rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-500/60"
      >
        {state.loading ? 'Регистрация…' : 'Создать аккаунт'}
      </button>
    </form>
  );
}
