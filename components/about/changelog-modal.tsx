"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Calendar, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    type: 'feature' | 'improvement' | 'bugfix' | 'breaking';
    description: string;
  }[];
}

interface ChangelogData {
  versions: ChangelogEntry[];
}

interface ChangelogModalProps {
  children: React.ReactNode;
}

export default function ChangelogModal({ children }: ChangelogModalProps) {
  const [changelog, setChangelog] = useState<ChangelogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        const response = await fetch('/changelog.json');
        if (!response.ok) {
          throw new Error('Failed to load changelog');
        }
        const data = await response.json();
        setChangelog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchChangelog();
  }, []);

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Sparkles className="h-4 w-4 text-green-500" />;
      case 'improvement':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'bugfix':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'breaking':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVersionBadgeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'minor':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'patch':
        return 'bg-green-500/10 text-green-600 border-green-500/30';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-card/95 backdrop-blur-lg border border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold">
            <Sparkles className="h-6 w-6 mr-3 text-primary" />
            What's New
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading changelog...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              <XCircle className="h-6 w-6 mr-2" />
              <span>Failed to load changelog: {error}</span>
            </div>
          ) : (
            <div className="space-y-6">
              {changelog?.versions.map((version, index) => (
                <div key={version.version} className="border border-border/30 rounded-xl p-6 bg-card/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold">Version {version.version}</h3>
                      <Badge className={getVersionBadgeColor(version.type)}>
                        {version.type}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(version.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {version.changes.map((change, changeIndex) => (
                      <div key={changeIndex} className="flex items-start space-x-3 p-3 rounded-lg bg-background/50">
                        {getChangeIcon(change.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              {change.type}
                            </span>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">
                            {change.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {changelog?.versions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No changelog entries found.</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}