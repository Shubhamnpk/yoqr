"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Upload, RefreshCw, Loader2, Image as ImageIcon, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { detectQRType } from '@/lib/qr-detection';
import { useToast } from '@/hooks/use-toast';
import { QRCodeResult } from '@/types/qr-types';

interface ImageScannerProps {
  onScanSuccess: (result: QRCodeResult) => void;
}

export default function ImageScanner({ onScanSuccess }: ImageScannerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageInfo, setImageInfo] = useState<{ format: string; size: string; dimensions: string } | null>(null);
  const [detectedQRs, setDetectedQRs] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountedRef = useRef(true);
  const { toast } = useToast();

  // Set up mounted ref and clean up when component unmounts
  useEffect(() => {
    mountedRef.current = true;
    const handlePaste = async (e: ClipboardEvent) => {
      if (!mountedRef.current) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const fakeEvent = {
              target: { files: [file] }
            } as any;
            handleImageUpload(fakeEvent);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);

    return () => {
      // Set mounted flag to false when component unmounts
      mountedRef.current = false;

      // Clean up any preview images
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }

      // Remove paste event listener
      document.removeEventListener('paste', handlePaste);
    };
  }, [previewImage]);

  // Handle image upload for QR code scanning
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Clean up previous preview if exists
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      
      const file = e.target.files[0];

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Set image info
      const format = file.type.split('/')[1].toUpperCase();
      const size = (file.size / 1024 / 1024).toFixed(2) + ' MB';
      setImageInfo({ format, size, dimensions: 'Loading...' });

      // Display preview of the image
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      
      // Create a temporary image element to process with jsQR
      const img = new Image();
      img.onload = async () => {
        // Check if component is still mounted
        if (!mountedRef.current) {
          URL.revokeObjectURL(imageUrl);
          return;
        }

        // Update image dimensions
        setImageInfo(prev => prev ? { ...prev, dimensions: `${img.width} × ${img.height}` } : null);

        try {
          // Dynamically import jsQR
          const jsQR = (await import('jsqr')).default;

          // Check again if component is still mounted after async import
          if (!mountedRef.current) {
            URL.revokeObjectURL(imageUrl);
            return;
          }

          // Create a canvas to draw the image
          const canvas = canvasRef.current || document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) {
            throw new Error('Could not get canvas context');
          }

          // Set canvas dimensions to match image
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image to canvas
          context.drawImage(img, 0, 0, img.width, img.height);

          // Get image data from canvas
          const imageData = context.getImageData(0, 0, img.width, img.height);

          // Scan for QR code
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          // Final mounted check before processing results
          if (!mountedRef.current) {
            URL.revokeObjectURL(imageUrl);
            return;
          }

          if (code) {
            // QR code found
            const data = code.data.trim();

            // Store detected QR info for highlighting
            setDetectedQRs([{
              data,
              location: code.location,
              width: img.width,
              height: img.height
            }]);

            // Play success sound
            playScanSuccessSound();

            // Detect QR type and create result object
            const qrTypeInfo = detectQRType(data);
            const result: QRCodeResult = {
              id: Date.now(),
              data,
              type: qrTypeInfo.type,
              timestamp: new Date().toLocaleString(),
              typeInfo: qrTypeInfo
            };

            // Call the onScanSuccess callback
            onScanSuccess(result);

            // Show success toast
            toast({
              title: `${qrTypeInfo.type.charAt(0).toUpperCase() + qrTypeInfo.type.slice(1)} QR Code Detected`,
              description: data.length > 50 ? `${data.substring(0, 50)}...` : data,
              variant: "default"
            });
          } else {
            // No QR code found
            setDetectedQRs([]);
            setError("No QR code detected. Try another image, ensure the QR code is clearly visible, or try enhancing the image contrast.");
            toast({
              title: "No QR code found",
              description: "Could not detect a valid QR code in the image. Try a different angle or better lighting.",
              variant: "destructive"
            });
          }
        } catch (err) {
          console.error("Error processing image:", err);
          if (mountedRef.current) {
            setError("Failed to process image. Please try again with a different image or format.");
            toast({
              title: "Image processing error",
              description: "Failed to process the uploaded image. Try a different format or smaller file size.",
              variant: "destructive"
            });
          }
        } finally {
          if (mountedRef.current) {
            setLoading(false);
          }
        }
      };
      
      img.onerror = () => {
        console.error("Error loading image");
        if (mountedRef.current) {
          setError("Failed to load image. Please try again with a different image.");
          toast({
            title: "Image loading error",
            description: "Failed to load the uploaded image.",
            variant: "destructive"
          });
          setLoading(false);
        }
      };
      
      img.src = imageUrl;
    } catch (err) {
      console.error("Error processing image:", err);
      if (mountedRef.current) {
        setError("An unexpected error occurred. Please try again.");
        toast({
          title: "Error",
          description: "An unexpected error occurred while processing the image.",
          variant: "destructive"
        });
        setLoading(false);
      }
    }
  };

  // Play success sound
  const playScanSuccessSound = () => {
    try {
      const audio = new Audio('/sounds/scan-success.wav');
      audio.volume = 0.5;
      audio.play().catch(err => {
        // Ignore errors from autoplay restrictions
        console.log("Could not play sound:", err);
      });
    } catch (err) {
      // Ignore sound errors
      console.log("Error playing sound:", err);
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Create a fake event to reuse the existing upload logic
        const fakeEvent = {
          target: { files: [file] }
        } as unknown as ChangeEvent<HTMLInputElement>;
        handleImageUpload(fakeEvent);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please drop an image file.",
          variant: "destructive"
        });
      }
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Reset the scanner
  const resetScanner = () => {
    // Only proceed if component is still mounted
    if (!mountedRef.current) return;

    setError(null);
    setLoading(false);
    setImageInfo(null);
    setDetectedQRs([]);

    // Clean up preview image
    if (previewImage) {
      // Use a small timeout to avoid DOM manipulation errors
      setTimeout(() => {
        if (mountedRef.current) {
          URL.revokeObjectURL(previewImage);
          setPreviewImage(null);
        }
      }, 50);
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };



  return (
    <div className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl overflow-hidden p-4">
      {/* Scanner area */}
      <div className="mb-3">
        <div
          className={`relative w-full aspect-[4/3] bg-background/50 rounded-lg border-2 border-dashed overflow-hidden flex items-center justify-center transition-all duration-300 ${
            isDragOver
              ? 'border-purple-500 bg-purple-50/20 dark:bg-purple-900/20 scale-105'
              : 'border-border/50 hover:border-purple-400/50 hover:bg-purple-50/10 dark:hover:bg-purple-900/10'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Preview image */}
          {previewImage ? (
            <div className="relative w-full h-full">
              <img
                src={previewImage}
                alt="QR code preview"
                className="object-contain w-full h-full p-2"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Scanning animation overlay */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-scan"></div>
                <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-purple-500 rounded-tl-md"></div>
                <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-purple-500 rounded-tr-md"></div>
                <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-purple-500 rounded-bl-md"></div>
                <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-purple-500 rounded-br-md"></div>

                {/* QR code detection highlighting */}
                {detectedQRs.map((qr, index) => (
                  <div key={index} className="absolute border-2 border-green-500 rounded-md">
                    <div
                      className="absolute inset-0 border-2 border-green-400 rounded-md animate-pulse"
                      style={{
                        left: `${(qr.location.topLeftCorner.x / qr.width) * 100}%`,
                        top: `${(qr.location.topLeftCorner.y / qr.height) * 100}%`,
                        width: `${((qr.location.bottomRightCorner.x - qr.location.topLeftCorner.x) / qr.width) * 100}%`,
                        height: `${((qr.location.bottomRightCorner.y - qr.location.topLeftCorner.y) / qr.height) * 100}%`,
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Image info overlay */}
              {imageInfo && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                  <div className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    <span>{imageInfo.format} • {imageInfo.size} • {imageInfo.dimensions}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="relative mb-6">
                <div className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full opacity-20 blur-xl ${isDragOver ? 'animate-bounce' : 'animate-pulse'}`}></div>
                <div className="relative">
                  <Upload className={`h-12 w-12 ${isDragOver ? 'text-purple-700 dark:text-purple-300' : 'text-purple-600 dark:text-purple-400'} transition-colors duration-300`} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">QR</span>
                </div>
              </div>
              <p className={`text-lg font-semibold mb-2 ${isDragOver ? 'text-purple-700 dark:text-purple-300' : 'text-foreground'} transition-colors duration-300`}>
                {isDragOver ? 'Drop QR Code Image Here' : 'Upload QR Code Image'}
              </p>
              <p className="text-sm max-w-xs text-center text-muted-foreground">
                {isDragOver ? 'Release to scan the QR code' : 'Select an image, drag & drop, or paste from clipboard to scan QR codes'}
              </p>
            </div>
          )}
          
          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl z-10">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full opacity-20 blur-xl animate-pulse"></div>
                <div className="relative">
                  <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">
                Processing image...
              </p>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 animate-in fade-in duration-300">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500 mt-0.5" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{error}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400"
                    onClick={resetScanner}
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    onClick={() => toast({
                      title: "Tips for better detection",
                      description: "Try images with good contrast, avoid blurry photos, ensure QR code is well-lit and not damaged.",
                      variant: "default"
                    })}
                  >
                    <Info className="mr-2 h-3 w-3" />
                    Tips
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            onClick={triggerFileInput}
            className="flex-1 py-3 text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <ImageIcon className="mr-2 h-5 w-5" />
                <span>Choose Image</span>
              </div>
            )}
          </Button>
        </div>

        <input
          type="file"
          title='input image'
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
      
      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0.8;
          }
        }
        
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}