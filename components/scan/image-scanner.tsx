"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Upload, RefreshCw, Loader2, Image as ImageIcon, X } from 'lucide-react';
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountedRef = useRef(true);
  const { toast } = useToast();

  // Set up mounted ref and clean up when component unmounts
  useEffect(() => {
    // Set mounted flag to true when component mounts
    mountedRef.current = true;
    
    return () => {
      // Set mounted flag to false when component unmounts
      mountedRef.current = false;
      
      // Clean up any preview images
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
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
            setError("No QR code detected. Try another image or ensure the QR code is clearly visible.");
            toast({
              title: "No QR code found",
              description: "Could not detect a valid QR code in the image.",
              variant: "destructive"
            });
          }
        } catch (err) {
          console.error("Error processing image:", err);
          if (mountedRef.current) {
            setError("Failed to process image. Please try again with a different image.");
            toast({
              title: "Image processing error",
              description: "Failed to process the uploaded image.",
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
      const audio = new Audio('/sounds/scan-success.mp3');
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
    <div className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl overflow-hidden p-6">
      {/* Header with logo */}
      <div className="flex items-center space-x-2 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg shadow-md">
          <Upload className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-xl font-bold">Image QR Scanner</h2>
      </div>
      
      {/* Scanner area */}
      <div className="mb-6">
        <div className="relative w-full aspect-square bg-background/50 rounded-xl border border-border/50 overflow-hidden flex items-center justify-center">
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
                <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-purple-500 rounded-tl-md"></div>
                <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-purple-500 rounded-tr-md"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-purple-500 rounded-bl-md"></div>
                <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-purple-500 rounded-br-md"></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full opacity-20 blur-xl animate-pulse"></div>
                <div className="relative">
                  <Upload className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-bold">QR</span>
                </div>
              </div>
              <p className="text-xl font-medium mb-2">Upload QR Code Image</p>
              <p className="text-sm max-w-xs text-center text-muted-foreground">
                Select an image containing a QR code to scan
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
                  <svg className="animate-spin h-16 w-16 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
              <p className="mt-4 text-lg font-medium text-foreground">
                Processing image...
              </p>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 animate-in fade-in duration-300">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400"
                    onClick={resetScanner}
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Action button */}
      <div className="flex justify-center">
        <Button 
          onClick={triggerFileInput}
          className="w-full py-6 text-lg font-medium bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl shadow-lg transition-all duration-300"
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
              <span>Upload Image to Scan</span>
            </div>
          )}
        </Button>
        
        <input 
          type="file" 
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