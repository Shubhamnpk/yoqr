import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generate QR Codes - YOQR | Free Custom QR Code Generator',
  description: 'Create professional QR codes for URLs, text, WiFi, contacts, and more. Customize colors, add logos, and download high-resolution QR codes instantly. Privacy-focused, no data collection.',
  keywords: 'generate qr code, create qr code, custom qr code, qr code maker, qr code generator online, free qr code generator, qr code with logo',
  openGraph: {
    title: 'Generate QR Codes - YOQR | Free Custom QR Code Generator',
    description: 'Create professional QR codes with advanced customization. Add logos, change colors, and download instantly.',
    url: 'https://yoqr.netlify.app/generate',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generate QR Codes - YOQR',
    description: 'Create custom QR codes with our free generator',
  },
  alternates: {
    canonical: 'https://yoqr.netlify.app/generate',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}