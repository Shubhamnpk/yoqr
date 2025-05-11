"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MoonIcon, SunIcon, Menu, X, Scan, QrCode } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // Used to handle theme hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    { name: "Home", href: "/", icon: <QrCode className="h-4 w-4 mr-2" /> },
    { name: "Scan", href: "/scan", icon: <Scan className="h-4 w-4 mr-2" /> },
    { name: "Generate", href: "/generate", icon: <QrCode className="h-4 w-4 mr-2" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-border/50 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-2">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
              YOQR
            </span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary rounded-full px-3 py-1.5",
                pathname === link.href 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          {mounted && (
            <div className="flex items-center bg-muted/60 backdrop-blur-lg rounded-full p-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full h-8 w-8",
                  theme === 'light' && "bg-primary/10 text-primary"
                )}
                onClick={() => setTheme('light')}
                aria-label="Light theme"
              >
                <SunIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full h-8 w-8",
                  theme === 'dark' && "bg-primary/10 text-primary"
                )}
                onClick={() => setTheme('dark')}
                aria-label="Dark theme"
              >
                <MoonIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 inset-x-0 bg-background border-b border-border/50 py-4 px-6 md:hidden">
          <nav className="flex flex-col space-y-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary p-2 rounded-md",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}