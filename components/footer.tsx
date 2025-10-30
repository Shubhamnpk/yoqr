"use client";

import Link from 'next/link';
import { QrCode, Github, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-card/50 backdrop-blur-sm border-t border-border/30 pb-6 pt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-2">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                YOQR
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              YOQR is a modern QR code generator and scanner that makes it easy to create, scan, and
              manage QR codes for personal and professional use. Built with the latest web technologies.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-medium text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/scan" className="text-muted-foreground hover:text-primary transition-colors">
                  Scan QR Code
                </Link>
              </li>
              <li>
                <Link href="/generate" className="text-muted-foreground hover:text-primary transition-colors">
                  Generate QR Code
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="font-medium text-sm mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://github.com/Shubhamnpk/yoqr" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                  <Github className="h-3.5 w-3.5" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a href="https://qrcode.react/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>QRCode.react</span>
                </a>
              </li>
              <li>
                <a href="https://github.com/mebjas/html5-qrcode" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>HTML5-QRCode</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom section with copyright */}
        <div className="mt-10 border-t border-border/30 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} YOQR. All rights reserved.
          </p>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>Developed by</span>
            <a href="https://www.bit-nepal.com/" className="mx-1 text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              Bit Nepal
            </a>
            <span>using Next.js and Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
