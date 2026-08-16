"use client";

import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import QRCodeOptions from '@/components/generate/qr-options';
import { QRGenerateOptions } from '@/types/qr-types';
import { Palette, Maximize2 } from 'lucide-react';
import CustomQRCode from '@/components/generate/custom-qr';

interface CustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  options: QRGenerateOptions;
  onChange: (options: Partial<QRGenerateOptions>) => void;
  onExport?: (format: 'png' | 'svg' | 'jpeg' | 'pdf') => void;
}

function ModalPreview({ content, options, onChange }: { content: string; options: QRGenerateOptions; onChange: (options: Partial<QRGenerateOptions>) => void }) {
  const [qrValue, setQrValue] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<number | null>(null);

  useEffect(() => {
    setQrValue(content || ' ');
  }, [content]);

  const pointToPercent = (clientX: number, clientY: number) => {
    const canvas = wrapRef.current?.querySelector('canvas');
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const logos = options.logos || [];
    if (logos.length === 0) return;
    const point = pointToPercent(e.clientX, e.clientY);
    if (!point) return;
    const index = logos.findIndex((logo) => {
      const half = logo.size / 2;
      const x0 = (logo.x ?? 50) - half;
      const x1 = (logo.x ?? 50) + half;
      const y0 = (logo.y ?? 50) - half;
      const y1 = (logo.y ?? 50) + half;
      return point.x >= x0 && point.x <= x1 && point.y >= y0 && point.y <= y1;
    });
    if (index >= 0) {
      dragRef.current = index;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current == null) return;
    const point = pointToPercent(e.clientX, e.clientY);
    if (!point) return;
    const updated = (options.logos || []).map((logo, i) =>
      i === dragRef.current ? { ...logo, x: point.x, y: point.y } : logo
    );
    onChange({ logos: updated });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div
      ref={wrapRef}
      className={`flex justify-center items-center p-6 rounded-xl shadow-inner relative overflow-hidden ${
        options.containerStyle === 'circle' ? '' : 'min-h-[280px]'
      }`}
      style={{
        touchAction: 'none',
        width: '100%',
        maxWidth: options.containerStyle === 'circle' ? '340px' : undefined,
        marginInline: options.containerStyle === 'circle' ? 'auto' : undefined,
        aspectRatio: options.containerStyle === 'circle' ? '1' : undefined,
        background: options.transparentBackground
          ? 'repeating-conic-gradient(#f1f5f9 0% 25%, transparent 0% 50%) 0 0 / 16px 16px'
          : options.backgroundColor,
        borderRadius: options.containerStyle === 'circle' ? '50%' : options.containerStyle === 'rounded' ? '16px' : '0',
        border: options.borderWidth ? `${options.borderWidth}px solid ${options.foregroundColor}` : '1px solid hsl(var(--border))',
        boxShadow: options.shadow ? '0 10px 25px rgba(0, 0, 0, 0.15)' : 'none'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {content ? (
        <CustomQRCode
          value={qrValue}
          size={options.size}
          fgColor={options.foregroundColor}
          level={options.errorCorrectionLevel}
          includeMargin={options.includeMargin}
          gradient={options.gradient}
          moduleStyle={options.moduleStyle}
          pattern={options.pattern}
          imageSettings={options.imageSettings}
          logos={options.logos}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <CustomQRCode value=" " size={180} fgColor="#e2e8f0" level="M" includeMargin={false} />
          <p className="mt-3 text-sm">Enter content to generate a QR code</p>
        </div>
      )}
    </div>
  );
}

export default function CustomizationModal({ open, onOpenChange, content, options, onChange, onExport }: CustomizationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent overlayClassName="yoqr-modal-overlay" className="yoqr-modal max-w-none w-screen h-screen max-h-screen flex flex-col overflow-hidden translate-x-0 translate-y-0 left-0 top-0 rounded-none p-0 gap-0 border-0 bg-background">
        <DialogHeader className="px-4 sm:px-6 py-3 border-b border-border/50 flex flex-row items-center justify-between space-y-0 text-left flex-shrink-0">
          <div>
            <DialogTitle className="flex items-center text-base sm:text-lg">
              <Palette className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
              Customization Studio
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs sm:text-sm">
              All changes apply instantly to your QR code
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-7xl mx-auto">
            <div className="lg:sticky lg:top-0 lg:self-start">
              <ModalPreview content={content} options={options} onChange={onChange} />
            </div>
            <div>
              <QRCodeOptions options={options} onChange={onChange} onExport={onExport} defaultOpen containerClassName="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl overflow-hidden w-full" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}