// Types for QR code scanning and generation

// QR code detection result
export interface QRCodeResult {
  id: number;
  data: string;
  type: string;
  timestamp: string;
  typeInfo: QRTypeInfo;
}

// QR code type information
export interface QRTypeInfo {
  type: string;
  regex: RegExp;
}

// QR code action
export interface QRTypeAction {
  label: string;
  action: (data: string) => void;
  icon?: React.ReactNode;
}

// Content types for QR generation
export type QRContentType = 'url' | 'text' | 'wifi' | 'contact' | 'email' | 'phone' | 'sms' | 'geo';

// Options for QR code generation
export interface QRGenerateOptions {
  size: number;
  backgroundColor: string;
  foregroundColor: string;
  includeMargin: boolean;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  imageSettings: null | {
    src: string;
    height: number;
    width: number;
    excavate: boolean;
  };
  // Container styling
  containerStyle?: 'square' | 'rounded' | 'circle';
  // Border and shadow
  borderWidth?: number;
  shadow?: boolean;
  // QR code gradient options
  gradient?: {
    enabled: boolean;
    startColor: string;
    endColor: string;
    type: 'linear' | 'radial';
    direction?: 'horizontal' | 'vertical' | 'diagonal';
  };
  // Background pattern options
  pattern?: string | null;
  // Animation effects
  animation?: string | null;
  // Multiple logos support
  logos?: Array<{
    src: string;
    position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    size: number;
  }>;
  // Export settings
  exportFormat?: 'png' | 'svg' | 'jpeg' | 'pdf';
  exportQuality?: number;
}