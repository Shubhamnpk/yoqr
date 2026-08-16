"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Bookmark, Check } from 'lucide-react';

export default function PostActions({ title, url }: { title: string; url: string }) {
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch (err) {
      // User cancelled or clipboard unavailable; ignore
    }
  };

  const handleSave = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('yoqr-saved-posts') || '[]');
      const exists = stored.includes(url);
      const next = exists ? stored.filter((u: string) => u !== url) : [...stored, url];
      localStorage.setItem('yoqr-saved-posts', JSON.stringify(next));
      setSaved(!exists);
    } catch (err) {
      console.warn('Save failed:', err);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleShare}>
        {shared ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
        {shared ? 'Link copied!' : 'Share'}
      </Button>
      <Button variant="outline" size="sm" onClick={handleSave}>
        {saved ? <Check className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
        {saved ? 'Saved' : 'Save'}
      </Button>
    </div>
  );
}
