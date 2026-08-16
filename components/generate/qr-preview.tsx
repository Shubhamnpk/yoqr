"use client";

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Copy, Check, Image, QrCode, Smartphone, Loader2, Settings, ZoomIn, ZoomOut, RotateCcw, Info, Sparkles, ChevronDown, Camera, FileCode, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRGenerateOptions } from '@/types/qr-types';
import { buildQrSvg, buildPdf, getQrMatrix, renderExportCanvas } from '@/lib/qr-render';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CustomizationModal from '@/components/generate/customization-modal';
import CustomQRCode from '@/components/generate/custom-qr';



interface QRCodePreviewProps {
  content: string;
  options: QRGenerateOptions;
  onOptionsChange: (options: Partial<QRGenerateOptions>) => void;
}

export default function QRCodePreview({ content, options, onOptionsChange }: QRCodePreviewProps) {
  const [qrValue, setQrValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showStats, setShowStats] = useState(false);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Close the export menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  
  // Update QR value when content changes
  useEffect(() => {
    if (content) {
      setIsGenerating(true);
      setTimeout(() => {
        setQrValue(content);
        setIsGenerating(false);
      }, 300);
    } else {
      setQrValue(' ');
      setIsGenerating(false);
    }
  }, [content]);

  // Force re-render when options change to ensure styles are applied
  useEffect(() => {
    if (content) {
      setIsGenerating(true);
      const timer = setTimeout(() => {
        setIsGenerating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [options, content]);

  // Reset zoom when content changes
  useEffect(() => {
    setZoomLevel(1);
  }, [content]);
  
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
      const canvas = await renderExportCanvas(qrValue, options, 2);

      const blob = await canvasToBlob(canvas, 'image/png');
      triggerDownload(blob, `qrcode-${new Date().getTime()}.png`);

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

  // Export QR code in a chosen format (PNG, SVG, JPEG, PDF)
  const exportQR = async (format: 'png' | 'svg' | 'jpeg' | 'pdf') => {
    if (!content) {
      toast({
        title: "Cannot export empty QR code",
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

      if (format === 'svg') {
        const svg = buildQrSvg({
          matrix: getQrMatrix(qrValue, options.errorCorrectionLevel),
          size: options.size,
          fgColor: options.foregroundColor,
          gradient: options.gradient,
          moduleStyle: options.moduleStyle,
          pattern: options.pattern,
          includeMargin: options.includeMargin,
          imageSettings: options.imageSettings,
          logos: options.logos
        });
        triggerDownload(new Blob([svg], { type: 'image/svg+xml' }), `qrcode-${new Date().getTime()}.svg`);
      } else {
        const opaque = format === 'jpeg' || format === 'pdf';
        const canvas = await renderExportCanvas(qrValue, options, 2, opaque);

        if (format === 'png') {
          const blob = await canvasToBlob(canvas, 'image/png');
          triggerDownload(blob, `qrcode-${new Date().getTime()}.png`);
        } else if (format === 'jpeg') {
          const blob = await canvasToBlob(canvas, 'image/jpeg', 0.95);
          triggerDownload(blob, `qrcode-${new Date().getTime()}.jpg`);
        } else if (format === 'pdf') {
          const blob = await canvasToBlob(canvas, 'image/jpeg', 0.95);
          const bytes = new Uint8Array(await blob.arrayBuffer());
          const pdf = buildPdf(bytes, canvas.width, canvas.height);
          triggerDownload(new Blob([pdf], { type: 'application/pdf' }), `qrcode-${new Date().getTime()}.pdf`);
        }
      }

      setExportOpen(false);
      toast({
        title: "QR Code exported",
        description: `Your QR code has been saved as ${format.toUpperCase()}`,
        variant: "default",
        className: "bg-card/90 backdrop-blur-lg border border-border/50 shadow-lg",
        style: {
          color: 'var(--foreground)',
          borderRadius: '0.75rem'
        }
      });
    } catch (err) {
      console.error('Error exporting QR code:', err);
      toast({
        title: "Export failed",
        description: "There was an error exporting the QR code",
        variant: "destructive",
        className: "bg-card/90 backdrop-blur-lg border border-border/50 shadow-lg",
        style: {
          color: 'var(--foreground)',
          borderRadius: '0.75rem'
        }
      });
    } finally {
      setTimeout(() => setDownloading(false), 300);
    }
  };

  const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Failed to convert canvas to blob'))),
        type,
        quality
      );
    });

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      const canvas = await renderExportCanvas(qrValue, options, 2);

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

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setZoomLevel(1);

  // Calculate QR quality based on content length and error correction
  const getQRQuality = () => {
    const length = content?.length || 0;
    const level = options.errorCorrectionLevel;

    if (length < 50 && level === 'L') return { score: 95, label: 'Excellent', color: 'text-green-500' };
    if (length < 100 && level === 'M') return { score: 90, label: 'Very Good', color: 'text-green-400' };
    if (length < 200 && level === 'Q') return { score: 85, label: 'Good', color: 'text-yellow-500' };
    if (length < 500 && level === 'H') return { score: 80, label: 'Fair', color: 'text-orange-500' };
    return { score: 70, label: 'Basic', color: 'text-red-500' };
  };

  const qrQuality = getQRQuality();

  return (
    <Card className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center">
                <QrCode className="h-5 w-5 mr-2 text-primary" />
                Preview
              </CardTitle>
              {content && (
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowStats(!showStats)}
                          className="h-8 w-8 p-0"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle QR statistics</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
            <CardDescription>
              {content ? 'Ready to download or share' : 'Enter content to generate a QR code'}
            </CardDescription>
          </div>
        </div>

        {/* Statistics Panel */}
        {showStats && content && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              QR Code Statistics
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Content Length:</span>
                <span className="ml-2 font-medium">{content.length} characters</span>
              </div>
              <div>
                <span className="text-muted-foreground">Error Correction:</span>
                <span className="ml-2 font-medium">{options.errorCorrectionLevel.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Dimensions:</span>
                <span className="ml-2 font-medium">{options.size}×{options.size}px</span>
              </div>
              <div>
                <span className="text-muted-foreground">File Size:</span>
                <span className="ml-2 font-medium">~{(options.size * options.size * 0.0003).toFixed(1)} KB</span>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative">
          <div
            className="flex justify-center items-center p-6 rounded-xl shadow-inner transition-all duration-300 relative overflow-hidden"
            style={{
              minHeight: options.containerStyle === 'circle' ? undefined : `${Math.min(options.size + 40, 400)}px`,
              width: '100%',
              maxWidth: options.containerStyle === 'circle' ? `${Math.min(options.size + 40, 400)}px` : undefined,
              marginInline: options.containerStyle === 'circle' ? 'auto' : undefined,
              aspectRatio: options.containerStyle === 'circle' ? '1' : undefined,
              background: options.transparentBackground
                ? 'repeating-conic-gradient(#f1f5f9 0% 25%, transparent 0% 50%) 0 0 / 16px 16px'
                : options.backgroundColor,
              borderRadius: options.containerStyle === 'circle' ? '50%' :
                           options.containerStyle === 'rounded' ? '16px' : '0',
              border: options.borderWidth ? `${options.borderWidth}px solid ${options.foregroundColor}` : '1px solid hsl(var(--border))',
              boxShadow: options.shadow ? '0 10px 25px rgba(0, 0, 0, 0.15)' : 'none'
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            ref={qrRef}
          >
          {content ? (
            <>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Skeleton className="h-32 w-32 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating QR code...</span>
                  </div>
                </div>
              ) : (
                <div
                  className={`qr-container transition-all duration-300 relative ${isHovering ? 'scale-105' : 'scale-100'}`}
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center',
                    overflow: 'hidden',
                    maxWidth: '100%'
                  }}
                >
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
                </div>
              )}

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
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground p-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-background/50 rounded-full p-4">
                  <QrCode className="h-12 w-12 " />
                </div>
              </div>
              <p className="text-l mb-1">No QR Code Yet generated</p>
            </div>
          )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3 pb-4 px-4">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomizationOpen(true)}
            className="transition-all duration-300 flex-1"
          >
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Customize
          </Button>

          <div className="relative flex-1" ref={exportMenuRef}>
            <div className="flex overflow-hidden rounded-md">
              <Button
                size="sm"
                onClick={() => exportQR('png')}
                disabled={!content || downloading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-r-none"
              >
                {downloading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
                {downloading ? 'Downloading...' : 'Download'}
              </Button>
              <Button
                size="sm"
                onClick={() => setExportOpen((open) => !open)}
                disabled={!content || downloading}
                aria-label="More options"
                className="px-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-l-none border-l border-white/30"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </div>

            {exportOpen && (
              <div className="absolute bottom-full mb-2 right-0 w-48 rounded-lg border border-border/50 bg-card shadow-xl overflow-hidden z-50">
                <button
                  onClick={() => { setExportOpen(false); copyQR(); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left ${copied ? 'text-green-500' : ''}`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy as image'}
                </button>
                <div className="my-1 border-t border-border/50" />
                <div className="px-3 pt-1 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Export as</div>
                {[
                  { format: 'png', label: 'PNG', icon: <Image className="h-4 w-4" /> },
                  { format: 'svg', label: 'SVG', icon: <FileCode className="h-4 w-4" /> },
                  { format: 'jpeg', label: 'JPEG', icon: <Camera className="h-4 w-4" /> },
                  { format: 'pdf', label: 'PDF', icon: <FileText className="h-4 w-4" /> }
                ].map((option) => (
                  <button
                    key={option.format}
                    onClick={() => exportQR(option.format as 'png' | 'svg' | 'jpeg' | 'pdf')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardFooter>

      <CustomizationModal
        open={customizationOpen}
        onOpenChange={setCustomizationOpen}
        content={content}
        options={options}
        onChange={onOptionsChange}
        onExport={exportQR}
      />
    </Card>
  );
}