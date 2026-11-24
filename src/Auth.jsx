import React, { useState } from 'react';
import { supabase } from './supabase';

const ADMIN_EMAIL = 'a17395314@gmail.com';

export default function Auth({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = username.trim().toLowerCase() === 'admin'
      ? ADMIN_EMAIL
      : `${username.trim().toLowerCase()}@starfeed.local`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (error) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      return;
    }

    onLogin(data.user);
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleLogin}>
        <h1>STAR FEED</h1>
        <p>نظام تتبع عربات التفريخ</p>

        <label>اسم المستخدم</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="admin"
          required
        />

        <label>كلمة المرور</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="كلمة المرور"
          required
        />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
        </button>
      </form>
    </div>
  );
}
