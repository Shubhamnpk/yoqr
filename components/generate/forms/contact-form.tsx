"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ContactFormProps {
  setContent: (content: string) => void;
}

export default function ContactForm({ setContent }: ContactFormProps) {
  // vCard fields
  const [name, setName] = useState({ first: '', last: '' });
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [address, setAddress] = useState('');
  
  // Generate vCard format
  useEffect(() => {
    if (name.first || name.last || email || phone) {
      const fullName = `${name.first} ${name.last}`.trim();
      
      // Create vCard format
      let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
      
      if (fullName) vcard += `FN:${fullName}\n`;
      if (name.first || name.last) vcard += `N:${name.last};${name.first};;;\n`;
      if (email) vcard += `EMAIL:${email}\n`;
      if (phone) vcard += `TEL:${phone}\n`;
      if (company) vcard += `ORG:${company}\n`;
      if (title) vcard += `TITLE:${title}\n`;
      if (url) vcard += `URL:${url}\n`;
      if (address) vcard += `ADR:;;${address};;;;\n`;
      
      vcard += "END:VCARD";
      
      setContent(vcard);
    }
  }, [name, email, phone, company, title, url, address, setContent]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullName = `${name.first} ${name.last}`.trim();
    
    if (!fullName && !email && !phone) return;
    
    // Create vCard format
    let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
    
    if (fullName) vcard += `FN:${fullName}\n`;
    if (name.first || name.last) vcard += `N:${name.last};${name.first};;;\n`;
    if (email) vcard += `EMAIL:${email}\n`;
    if (phone) vcard += `TEL:${phone}\n`;
    if (company) vcard += `ORG:${company}\n`;
    if (title) vcard += `TITLE:${title}\n`;
    if (url) vcard += `URL:${url}\n`;
    if (address) vcard += `ADR:;;${address};;;;\n`;
    
    vcard += "END:VCARD";
    
    setContent(vcard);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first-name">First Name</Label>
          <Input
            id="first-name"
            placeholder="John"
            value={name.first}
            onChange={(e) => setName({...name, first: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last-name">Last Name</Label>
          <Input
            id="last-name"
            placeholder="Doe"
            value={name.last}
            onChange={(e) => setName({...name, last: e.target.value})}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            placeholder="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            placeholder="Software Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          placeholder="123 Main St, Anytown, CA 12345"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={2}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={!name.first && !name.last && !email && !phone}>
        Generate QR Code
      </Button>
    </form>
  );
}