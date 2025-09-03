"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import QRCodeGenerator from '@/components/generate/qr-generator';
import QRCodePreview from '@/components/generate/qr-preview';
import QRCodeOptions from '@/components/generate/qr-options';
import { QRGenerateOptions, QRContentType } from '@/types/qr-types';
import { QrCode, ArrowRight } from 'lucide-react';

export default function GeneratePage() {
  // Generator state
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<QRContentType>('url');
  const [showCustomization, setShowCustomization] = useState(false);
  const [options, setOptions] = useState<QRGenerateOptions>({
    size: 200,
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    includeMargin: true,
    errorCorrectionLevel: 'M',
    imageSettings: null
  });

  // Handle options change
  const handleOptionsChange = (newOptions: Partial<QRGenerateOptions>) => {
    setOptions(prevOptions => ({
      ...prevOptions,
      ...newOptions
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-radial from-background to-background/80 py-4 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Compact Hero section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Create QR Codes
          </h1>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-muted-foreground px-2">
            Generate professional QR codes with advanced customization
          </p>
        </div>

        {/* Mobile-first layout */}
        <div className="space-y-4 sm:space-y-6">
          {/* Generator form - Full width on mobile */}
          <Card className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl overflow-hidden">
            <QRCodeGenerator
              content={content}
              setContent={setContent}
              contentType={contentType}
              setContentType={setContentType}
            />
          </Card>

          {/* Preview and Options - Side by side on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Preview section */}
            <div className="order-2 lg:order-1">
              <QRCodePreview
                content={content}
                options={options}
              />
            </div>

            {/* Options section */}
            <div className="order-1 lg:order-2">
              <QRCodeOptions
                options={options}
                onChange={handleOptionsChange}
                enabled={showCustomization}
                onToggle={setShowCustomization}
              />
            </div>
          </div>
        </div>
        
        {/* Features section */}
        <div className="mt-16 border-t border-border/30 pt-10">
          <h2 className="text-2xl font-bold mb-6 text-center">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card/60 backdrop-blur-sm p-6 rounded-xl border border-border/30">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Customizable Design</h3>
              <p className="text-muted-foreground">Change colors, add logos, adjust size, and select error correction levels to make your QR code stand out.</p>
            </div>
            
            <div className="bg-card/60 backdrop-blur-sm p-6 rounded-xl border border-border/30">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Add Your Logo</h3>
              <p className="text-muted-foreground">Embed your brand by adding a logo or image to the center of your QR code for better brand recognition.</p>
            </div>
            
            <div className="bg-card/60 backdrop-blur-sm p-6 rounded-xl border border-border/30">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <ArrowRight className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Download</h3>
              <p className="text-muted-foreground">Download your QR code instantly in high-resolution PNG format, ready to be printed or shared online.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}