"use client";

import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface PhoneFormProps {
  content: string;
  setContent: (content: string) => void;
}

export default function PhoneForm({ content, setContent }: PhoneFormProps) {
  // Format phone number
  const formatPhone = (phone: string) => {
    if (!phone) return '';
    // Remove all non-numeric characters for consistent formatting
    const digits = phone.replace(/\D/g, '');
    // Add tel: prefix
    return `tel:${digits}`;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContent(formatPhone(content.replace(/^tel:/, '')));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={content.replace(/^tel:/, '')}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter a phone number to create a QR code that initiates a call when scanned
        </p>
      </div>
      
      <Button type="submit" className="w-full" disabled={!content.replace(/^tel:/, '')}>
        Generate QR Code
      </Button>
    </form>
  );
}