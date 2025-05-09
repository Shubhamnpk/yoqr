"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SMSFormProps {
  setContent: (content: string) => void;
}

export default function SMSForm({ setContent }: SMSFormProps) {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  // Update the SMS content when fields change
  useEffect(() => {
    if (phone) {
      // Remove all non-numeric characters for consistent formatting
      const digits = phone.replace(/\D/g, '');
      
      let smsString = `sms:${digits}`;
      
      // Add message if provided
      if (message) {
        smsString += `?body=${encodeURIComponent(message)}`;
      }
      
      setContent(smsString);
    }
  }, [phone, message, setContent]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    // Remove all non-numeric characters for consistent formatting
    const digits = phone.replace(/\D/g, '');
    
    let smsString = `sms:${digits}`;
    
    // Add message if provided
    if (message) {
      smsString += `?body=${encodeURIComponent(message)}`;
    }
    
    setContent(smsString);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          placeholder="Pre-written message text..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        Creates a QR code that opens the device's messaging app with the number and optional message pre-filled
      </p>
      
      <Button type="submit" className="w-full" disabled={!phone}>
        Generate QR Code
      </Button>
    </form>
  );
}