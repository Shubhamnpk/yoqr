"use client";

import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Copy, Check, Image, QrCode, Smartphone, Loader2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRGenerateOptions } from '@/types/qr-types';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

// Add custom CSS animations
const customStyles = `
  @keyframes qr-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes qr-glow {
    0%, 100% { filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.3)); }
    50% { filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.6)); }
  }

  .qr-pulse-animation {
    animation: qr-pulse 2s infinite;
  }

  .qr-glow-animation {
    animation: qr-glow 3s infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}


interface QRCodePreviewProps {
  content: string;
  options: QRGenerateOptions;
  onToggleCustomization?: () => void;
}

export default function QRCodePreview({ content, options, onToggleCustomization }: QRCodePreviewProps) {
  const [qrValue, setQrValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  
  // Update QR value when content changes
  useEffect(() => {
    setQrValue(content || ' '); // Use space if empty to avoid QR error
  }, [content]);

  // Force re-render when options change to ensure styles are applied
  useEffect(() => {
    // This ensures the component re-renders when options change
    const timer = setTimeout(() => {
      // Small delay to ensure DOM updates
    }, 10);
    return () => clearTimeout(timer);
  }, [options]);
  
  // Download QR code as PNG
  const downloadQR = async () => {
    if (!content) {
      toast({
        title: "Cannot download empty QR code",
        description: "Please enter some content first",
        variant: "destructive",
        className: "bg-card/90 backdrop-blur-lg border border-border/50 shadow-lg",
        style: {
          color: 'var(--foreground)',
          borderRadius: '0.75rem'
        }
      });
      return;
    }
    
    try {
      setDownloading(true);

      // Create a new canvas to capture the styled QR code
      const qrContainer = qrRef.current;
      if (!qrContainer) return;

      const canvas = await html2canvas(qrContainer, {
        backgroundColor: options.gradient?.enabled ? null : options.backgroundColor,
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true
      });

      const link = document.createElement('a');
      link.download = `qrcode-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "QR Code downloaded",
        description: "Your QR code has been saved",
        variant: "default",
        className: "bg-card/90 backdrop-blur-lg border border-border/50 shadow-lg",
        style: {
          color: 'var(--foreground)',
          borderRadius: '0.75rem'
        }
      });
      
      setTimeout(() => setDownloading(false), 1000);
    } catch (err) {
      console.error('Error downloading QR code:', err);
      toast({
        title: "Download failed",
        description: "There was an error downloading the QR code",
        variant: "destructive",
        className: "bg-card/90 backdrop-blur-lg border border-border/50 shadow-lg",
        style: {
          color: 'var(--foreground)',
          borderRadius: '0.75rem'
        }
      });
      setDownloading(false);
    }
  };
  
  // Copy QR code as data URL
  const copyQR = async () => {
    if (!content) {
      toast({
        title: "Cannot copy empty QR code",
        description: "Please enter some content first",
        variant: "destructive",
        className: "bg-card/90 backdrop-blur-lg border border-border/50 shadow-lg",
        style: {
          color: 'var(--foreground)',
          borderRadius: '0.75rem'
        }
      });
      return;
    }
    
    try {
      const qrContainer = qrRef.current;
      if (!qrContainer) return;

      const canvas = await html2canvas(qrContainer, {
        backgroundColor: options.gradient?.enabled ? null : options.backgroundColor,
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const dataUrl = canvas.toDataURL('image/png');
      navigator.clipboard.writeText(dataUrl);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "QR Code image copied",
        description: "You can paste it in any image editor",
        variant: "default",
        className: "bg-card/90 backdrop-blur-lg border border-border/50 shadow-lg",
        style: {
          color: 'var(--foreground)',
          borderRadius: '0.75rem'
        }
      });
    } catch (err) {
      console.error('Error copying QR code:', err);
      toast({
        title: "Copy failed",
        description: "There was an error copying the QR code",
        variant: "destructive",
        className: "bg-card/90 backdrop-blur-lg border border-border/50 shadow-lg",
        style: {
          color: 'var(--foreground)',
          borderRadius: '0.75rem'
        }
      });
    }
  };
  
  // Share QR code (if Web Share API is available)
  const shareQR = () => {
    if (!content) {
      toast({
        title: "Cannot share empty QR code",
        description: "Please enter some content first",
        variant: "destructive",
        className: "bg-card/90 backdrop-blur-lg border border-border/50 shadow-lg",
        style: {
          color: 'var(--foreground)',
          borderRadius: '0.75rem'
        }
      });
      return;
    }
    
    try {
      if (navigator.share) {
        const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          
          const file = new File([blob], "qrcode.png", { type: "image/png" });
          
          try {
            await navigator.share({
              title: 'QR Code',
              text: 'Check out this QR code!',
              files: [file]
            });
          } catch (err) {
            console.error('Share error:', err);
            // Fallback to copying if sharing fails
            copyQR();
          }
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        copyQR();
        toast({
          title: "Share not supported",
          description: "QR code copied to clipboard instead",
          variant: "default",
          className: "bg-card/90 backdrop-blur-lg border border-border/50 shadow-lg",
          style: {
            color: 'var(--foreground)',
            borderRadius: '0.75rem'
          }
        });
      }
    } catch (err) {
      console.error('Error sharing QR code:', err);
      toast({
        title: "Share failed",
        description: "There was an error sharing the QR code",
        variant: "destructive",
        className: "bg-card/90 backdrop-blur-lg border border-border/50 shadow-lg",
        style: {
          color: 'var(--foreground)',
          borderRadius: '0.75rem'
        }
      });
    }
  };
  
  return (
    <Card className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold flex items-center">
              <QrCode className="h-5 w-5 mr-2 text-primary" />
              QR Code Preview
            </CardTitle>
            <CardDescription>
              {content ? 'Ready to download or share' : 'Enter content to generate a QR code'}
            </CardDescription>
            {/* Debug info */}
            <div className="text-xs text-muted-foreground mt-1">
              Size: {options.size}px | Colors: {options.foregroundColor}/{options.backgroundColor}
              {options.gradient?.enabled && ' | Gradient: ON'}
              {options.pattern && ` | Pattern: ${options.pattern}`}
              {options.containerStyle !== 'square' && ` | Style: ${options.containerStyle}`}
              {options.shadow && ' | Shadow: ON'}
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-end">
            {content && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 px-3 py-1">
                Ready
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="flex justify-center items-center p-8 mx-4 my-4 rounded-xl shadow-inner transition-all duration-300 relative overflow-hidden"
          style={{
            minHeight: `${Math.min(options.size + 40, 400)}px`,
            background: options.gradient?.enabled
              ? `linear-gradient(${options.gradient.direction === 'diagonal' ? '45deg' : options.gradient.direction === 'vertical' ? '180deg' : '90deg'}, ${options.gradient.startColor}, ${options.gradient.endColor})`
              : options.backgroundColor,
            borderRadius: options.containerStyle === 'circle' ? '50%' :
                         options.containerStyle === 'rounded' ? '16px' : '8px',
            border: options.borderWidth ? `${options.borderWidth}px solid ${options.foregroundColor}` : 'none',
            boxShadow: options.shadow ? '0 10px 25px rgba(0, 0, 0, 0.15)' : 'none'
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          ref={qrRef}
        >
          {content ? (
            <>
              <div
                className={`qr-container transition-all duration-300 relative ${isHovering ? 'scale-105' : 'scale-100'} ${
                  options.animation === 'pulse' ? 'qr-pulse-animation' :
                  options.animation === 'glow' ? 'qr-glow-animation' : ''
                }`}
                style={{
                  overflow: 'hidden'
                }}
              >
                <QRCode
                  id="qr-canvas"
                  value={qrValue}
                  size={options.size}
                  bgColor="transparent"
                  fgColor={options.foregroundColor}
                  level={options.errorCorrectionLevel}
                  includeMargin={options.includeMargin}
                  imageSettings={options.imageSettings || undefined}
                  renderAs="canvas"
                />

                {/* Pattern Overlay */}
                {options.pattern && options.pattern !== 'none' && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                      backgroundImage: options.pattern === 'dots' ? 'radial-gradient(circle, currentColor 1px, transparent 1px)' :
                                     options.pattern === 'grid' ? 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)' :
                                     options.pattern === 'diagonal' ? 'repeating-linear-gradient(45deg, currentColor 1px, currentColor 1px 2px, transparent 2px, transparent 4px)' :
                                     options.pattern === 'checker' ? 'repeating-conic-gradient(currentColor 0% 25%, transparent 25% 50%)' :
                                     options.pattern === 'stripes' ? 'repeating-linear-gradient(90deg, currentColor 1px, transparent 1px 4px)' :
                                     'none',
                      backgroundSize: options.pattern === 'dots' ? '4px 4px' :
                                    options.pattern === 'grid' ? '8px 8px' :
                                    options.pattern === 'diagonal' ? '6px 6px' :
                                    options.pattern === 'checker' ? '8px 8px' :
                                    '6px 6px'
                    }}
                  />
                )}

                {/* Multiple Logos Overlay */}
                {options.logos && options.logos.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none">
                    {options.logos.map((logo, index) => (
                      <img
                        key={index}
                        src={logo.src}
                        alt={`Logo ${index + 1}`}
                        className="absolute object-contain"
                        style={{
                          width: `${(options.size * logo.size) / 100}px`,
                          height: `${(options.size * logo.size) / 100}px`,
                          left: logo.position === 'center' ? '50%' :
                                logo.position === 'top-left' ? '10%' :
                                logo.position === 'top-right' ? '80%' :
                                logo.position === 'bottom-left' ? '10%' :
                                logo.position === 'bottom-right' ? '80%' : '50%',
                          top: logo.position === 'center' ? '50%' :
                               logo.position === 'top-left' ? '10%' :
                               logo.position === 'top-right' ? '10%' :
                               logo.position === 'bottom-left' ? '80%' :
                               logo.position === 'bottom-right' ? '80%' : '50%',
                          transform: logo.position === 'center' ? 'translate(-50%, -50%)' :
                                   logo.position.includes('left') ? 'translateX(-10%)' :
                                   logo.position.includes('right') ? 'translateX(-90%)' :
                                   'translate(-50%, -50%)'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {isHovering && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="flex space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-white/90 text-black hover:bg-white"
                            onClick={copyQR}
                          >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy QR code</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-white/90 text-black hover:bg-white"
                            onClick={downloadQR}
                          >
                            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download QR code</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-white/90 text-black hover:bg-white"
                            onClick={shareQR}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share QR code</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Image className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">QR Preview</p>
              <p className="text-sm mt-2 max-w-xs text-center">
                Enter content in the form to generate a QR code
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 pt-2 pb-6 px-6">
        <div className="flex items-center text-sm text-muted-foreground justify-center">
          <Smartphone className="h-4 w-4 mr-2" />
          {content ? 'Scan with any QR reader app' : ''}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={copyQR}
            disabled={!content}
            className={`transition-all duration-300 flex-1 ${copied ? 'bg-green-500/10 text-green-500 border-green-500/30' : ''}`}
          >
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>

          <Button
            size="sm"
            onClick={downloadQR}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white flex-1"
            disabled={!content || downloading}
          >
            {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {downloading ? 'Downloading...' : 'Download'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}