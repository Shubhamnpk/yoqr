import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'YOQR - Free QR Code Generator & Scanner | Create & Scan QR Codes Instantly',
  description: 'The most powerful free QR code generator and scanner. Create custom QR codes for URLs, text, WiFi, contacts, and more. Scan QR codes instantly with your camera.',
  keywords: 'qr code, qr code generator, qr code scanner, free qr code, custom qr code, qr code reader, create qr code',
  authors: [{ name: 'YOQR Team' }],
  openGraph: {
    title: 'YOQR - Free QR Code Generator & Scanner',
    description: 'The most powerful free QR code generator and scanner. Create custom QR codes for URLs, text, WiFi, contacts, and more.',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YOQR - Free QR Code Generator & Scanner',
    description: 'Create and scan QR codes instantly with our powerful free tool',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://yoqr.netlify.app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="w-full min-h-[calc(100vh-64px-200px)]">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}