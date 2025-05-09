"use client";

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface TextFormProps {
  content: string;
  setContent: (content: string) => void;
}

export default function TextForm({ content, setContent }: TextFormProps) {
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No formatting needed for text, just make sure it's set
    setContent(content);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text">Text Content</Label>
        <Textarea
          id="text"
          placeholder="Enter any text you want to encode in the QR code..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
        />
        <p className="text-xs text-muted-foreground">
          This can be any text content like a message, note, or identification information
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {content.length} characters
        </p>
        <p className="text-xs text-muted-foreground">
          {content.length > 300 ? 'Long text may be harder to scan' : ''}
        </p>
      </div>
      
      <Button type="submit" className="w-full">
        Generate QR Code
      </Button>
    </form>
  );
}