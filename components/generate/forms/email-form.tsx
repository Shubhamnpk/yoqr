"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EmailFormProps {
  setContent: (content: string) => void;
}

export default function EmailForm({ setContent }: EmailFormProps) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  
  // Update the email content when fields change
  useEffect(() => {
    if (email) {
      let mailtoString = `mailto:${email}`;
      
      // Add subject and body if provided
      const params = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      
      if (params.length > 0) {
        mailtoString += `?${params.join('&')}`;
      }
      
      setContent(mailtoString);
    }
  }, [email, subject, body, setContent]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    let mailtoString = `mailto:${email}`;
    
    // Add subject and body if provided
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    
    if (params.length > 0) {
      mailtoString += `?${params.join('&')}`;
    }
    
    setContent(mailtoString);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="contact@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="subject">Subject (Optional)</Label>
        <Input
          id="subject"
          placeholder="Email subject line"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="body">Message (Optional)</Label>
        <Textarea
          id="body"
          placeholder="Pre-populated email message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        Creates a QR code that opens the device's email app with the address and optional subject/message pre-filled
      </p>
      
      <Button type="submit" className="w-full" disabled={!email}>
        Generate QR Code
      </Button>
    </form>
  );
}