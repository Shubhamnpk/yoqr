import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About YOQR - Free QR Code Generator & Scanner',
  description: 'Learn about YOQR, a privacy-focused QR code generator and scanner developed by BitNepal. Made in Nepal with love for the entire world.',
  keywords: 'about yoqr, qr code app, bitnepal, made in nepal, privacy focused, qr code developer',
  openGraph: {
    title: 'About YOQR - Free QR Code Generator & Scanner',
    description: 'Learn about YOQR, developed by BitNepal. Made in Nepal with love for the entire world.',
    url: 'https://yoqr.netlify.app/about',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About YOQR',
    description: 'Privacy-focused QR code generator and scanner from Nepal',
  },
  alternates: {
    canonical: 'https://yoqr.netlify.app/about',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}