"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      return;
    }

    try {
      const stored = JSON.parse(localStorage.getItem('yoqr-subscribers') || '[]');
      stored.push({ email: trimmed, date: new Date().toISOString() });
      localStorage.setItem('yoqr-subscribers', JSON.stringify(stored));
    } catch (err) {
      console.warn('Newsletter storage failed:', err);
    }

    setEmail('');
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <p className="text-sm font-medium text-primary">
        Thanks for subscribing! You&apos;re on the list.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
      <input
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setStatus('idle');
        }}
        aria-label="Email address"
        className={`flex-1 px-4 py-2 rounded-md border border-border bg-background ${status === 'error' ? 'border-red-500' : ''}`}
      />
      <Button type="submit">Subscribe</Button>
    </form>
  );
}
