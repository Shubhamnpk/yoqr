"use client";

import { useEffect, useRef } from 'react';
import { drawQrToCanvas, getQrMatrix } from '@/lib/qr-render';
import { QRGenerateOptions } from '@/types/qr-types';

interface CustomQRCodeProps {
  value: string;
  size: number;
  fgColor: string;
  level: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
  gradient?: QRGenerateOptions['gradient'];
  moduleStyle?: 'square' | 'rounded' | 'circle';
  pattern?: string | null;
  imageSettings?: QRGenerateOptions['imageSettings'];
  logos?: QRGenerateOptions['logos'];
  style?: React.CSSProperties;
}

export default function CustomQRCode({
  value,
  size,
  fgColor,
  level,
  includeMargin,
  gradient,
  moduleStyle = 'square',
  pattern,
  imageSettings,
  logos,
  style
}: CustomQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const matrix = getQrMatrix(value || ' ', level);
    drawQrToCanvas(canvas, {
      matrix,
      size,
      fgColor,
      gradient,
      moduleStyle,
      pattern,
      includeMargin,
      imageSettings,
      logos,
      scale: 2
    });
  }, [value, size, fgColor, level, includeMargin, gradient, moduleStyle, pattern, imageSettings, logos]);

  return (
    <canvas
      ref={canvasRef}
      width={size * 2}
      height={size * 2}
      style={{ width: size, maxWidth: '100%', height: 'auto', aspectRatio: '1', ...style }}
    />
  );
}