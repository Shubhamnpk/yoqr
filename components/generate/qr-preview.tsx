"use client";

import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Copy, Check, Image, QrCode, Smartphone, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRGenerateOptions } from '@/types/qr-types';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface QRCodePreviewProps {
  content: string;
  options: QRGenerateOptions;
}

export default function QRCodePreview({ content, options }: QRCodePreviewProps) {
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
  
  // Download QR code as PNG
  const downloadQR = () => {
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
      const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      
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
  const copyQR = () => {
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
      const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      
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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <QrCode className="h-5 w-5 mr-2 text-primary" />
              QR Code Preview
            </CardTitle>
            <CardDescription>
              {content ? 'Ready to download or share' : 'Enter content to generate a QR code'}
            </CardDescription>
          </div>
          {content && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 px-3 py-1">
              Ready
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          className="flex justify-center items-center p-8 bg-white dark:bg-gray-800 mx-4 my-4 rounded-xl shadow-inner transition-all duration-300 relative overflow-hidden"
          style={{ minHeight: `${Math.min(options.size + 40, 400)}px` }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          ref={qrRef}
        >
          {content ? (
            <>
              <div className={`qr-container transition-all duration-300 ${isHovering ? 'scale-105' : 'scale-100'}`}>
                <QRCode
                  id="qr-canvas"
                  value={qrValue}
                  size={options.size}
                  bgColor={options.backgroundColor}
                  fgColor={options.foregroundColor}
                  level={options.errorCorrectionLevel}
                  includeMargin={options.includeMargin}
                  imageSettings={options.imageSettings || undefined}
                  renderAs="canvas"
                />
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
      <CardFooter className="flex justify-between pt-2 pb-6 px-6">
        <div className="flex items-center text-sm text-muted-foreground">
          <Smartphone className="h-4 w-4 mr-2" />
          {content ? 'Scan with any QR reader app' : 'No QR code generated yet'}
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={copyQR}
            disabled={!content}
            className={`transition-all duration-300 ${copied ? 'bg-green-500/10 text-green-500 border-green-500/30' : ''}`}
          >
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          
          <Button 
            size="sm"
            onClick={downloadQR}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
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