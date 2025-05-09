"use client";

import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface URLFormProps {
  content: string;
  setContent: (content: string) => void;
}

export default function URLForm({ content, setContent }: URLFormProps) {
  // Helper to format URL (add https:// if missing)
  const formatUrl = (url: string) => {
    if (!url) return url;
    if (url.match(/^https?:\/\//i)) return url;
    return `https://${url}`;
  };
  
  // Add common URLs quickly
  const addQuickUrl = (url: string) => {
    setContent(formatUrl(url));
  };
  
  // Auto-format URL on submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContent(formatUrl(content));
  };
  
  // Common websites for quick selection
  const quickLinks = [
    { name: 'Google', url: 'google.com' },
    { name: 'YouTube', url: 'youtube.com' },
    { name: 'Twitter', url: 'twitter.com' },
    { name: 'Instagram', url: 'instagram.com' },
    { name: 'LinkedIn', url: 'linkedin.com' }
  ];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">Website URL</Label>
        <Input
          id="url"
          placeholder="https://example.com"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Enter a website URL to create a QR code that opens the website when scanned
        </p>
      </div>
      
      <div className="space-y-2">
        <Label>Quick Links</Label>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((link) => (
            <Button
              key={link.url}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addQuickUrl(link.url)}
              className={content === formatUrl(link.url) ? 'border-primary text-primary' : ''}
            >
              {content === formatUrl(link.url) && <Check className="h-3 w-3 mr-1" />}
              {link.name}
            </Button>
          ))}
        </div>
      </div>
      
      <Button type="submit" className="w-full">
        Generate QR Code
      </Button>
    </form>
  );
}