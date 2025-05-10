"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Loader2, Play, StopCircle, Zap, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { detectQRType } from '@/lib/qr-detection';
import { useToast } from '@/hooks/use-toast';
import { QRCodeResult } from '@/types/qr-types';

interface CameraScannerProps {
  isScanning: boolean;
  setIsScanning: (isScanning: boolean) => void;
  continuousScan: boolean;
  setContinuousScan: (continuousScan: boolean) => void;
  currentCamera: string;
  setCurrentCamera: (cameraId: string) => void;
  onScanSuccess: (result: QRCodeResult) => void;
}

// Component for scanning QR codes using the device camera
export default function CameraScanner({
  isScanning,
  setIsScanning,
  continuousScan,
  setContinuousScan,
  currentCamera,
  setCurrentCamera,
  onScanSuccess
}: CameraScannerProps) {
  const [availableCameras, setAvailableCameras] = useState<{id: string, label: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const readerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const { toast } = useToast();

  // Initialize the QR scanner only once when component mounts to get camera list
  useEffect(() => {
    mountedRef.current = true;
    
    // Get cameras list only
    const getCamerasList = async () => {
      try {
        // Import the library dynamically
        const { Html5Qrcode } = await import('html5-qrcode');
        
        // Get available cameras
        try {
          const devices = await Html5Qrcode.getCameras();
          if (!mountedRef.current) return;
          
          if (devices && devices.length) {
            const cameras = devices.map(device => ({
              id: device.id,
              label: device.label || (device.id.includes('back') ? 'Back Camera' : 'Front Camera')
            }));
            
            setAvailableCameras(cameras);
            
            // Select the back camera by default if available
            const backCamera = cameras.find(camera => 
              camera.label.toLowerCase().includes('back') || 
              camera.label.toLowerCase().includes('environment'));
            
            if (backCamera && !currentCamera) {
              setCurrentCamera(backCamera.id);
            } else if (cameras.length > 0 && !currentCamera) {
              setCurrentCamera(cameras[0].id);
            }
          } else {
            toast({
              title: "No cameras found",
              description: "No cameras were detected on your device.",
              variant: "destructive"
            });
          }
        } catch (err) {
          console.error("Error getting cameras:", err);
          if (mountedRef.current) {
            toast({
              title: "Camera access error",
              description: "Failed to access camera. Please check permissions.",
              variant: "destructive"
            });
          }
        }
      } catch (err) {
        console.error("Error initializing camera list:", err);
        if (mountedRef.current) {
          setError("Failed to initialize camera list. Please try again.");
        }
      }
    };
    
    // Get camera list
    getCamerasList();
    
    // Clean up on unmount
    return () => {
      mountedRef.current = false;
      
      // Ensure scanner is properly cleaned up
      cleanupScanner();
    };
  }, []);

  // Safely clean up the scanner
  const cleanupScanner = async () => {
    // If no scanner reference, nothing to clean up
    if (!scannerRef.current) return;
    
    // Store reference locally and immediately clear the ref
    // This prevents any other code from trying to use the scanner during cleanup
    const scanner = scannerRef.current;
    scannerRef.current = null;
    
    try {
      // First check if scanner is scanning and stop it
      if (scanner && scanner.isScanning) {
        try {
          await scanner.stop();
        } catch (err) {
          // Just log the error and continue with cleanup
          console.error("Error stopping scanner during cleanup:", err);
        }
      }
      
      // Then try to clear the scanner
      if (scanner) {
        try {
          await scanner.clear();
        } catch (err) {
          // Just log the error and continue with cleanup
          console.error("Error clearing scanner during cleanup:", err);
        }
      }
      
      // Now safely remove the scanner element from DOM if it exists
      if (readerRef.current) {
        try {
          // Simply clear innerHTML as the most reliable method
          readerRef.current.innerHTML = '';
        } catch (err) {
          console.error("Error clearing reader element:", err);
        }
      }
    } catch (err) {
      console.error("Error during scanner cleanup:", err);
    }
  };
  
  // Create a new scanner instance
  const createScanner = async () => {
    // First clean up any existing scanner
    await cleanupScanner();
    
    // Make sure we have the reader element
    if (!readerRef.current || !mountedRef.current) return false;
    
    try {
      // Import the library dynamically
      const { Html5Qrcode } = await import('html5-qrcode');
      
      // Create a new scanner instance with a unique ID
      const scannerId = 'reader-' + Date.now();
      
      // Clear the reader element using innerHTML (most reliable method)
      try {
        readerRef.current.innerHTML = '';
      } catch (err) {
        console.error("Error clearing reader element during creation:", err);
        return false;
      }
      
      // Create a temporary div with this ID
      const tempDiv = document.createElement('div');
      tempDiv.id = scannerId;
      
      try {
        // Append the new scanner div
        readerRef.current.appendChild(tempDiv);
      } catch (err) {
        console.error("Error appending scanner div:", err);
        return false;
      }
      
      // Create a new scanner instance
      scannerRef.current = new Html5Qrcode(scannerId, { verbose: false });
      return true;
    } catch (err) {
      console.error("Error creating scanner:", err);
      if (mountedRef.current) {
        setError("Failed to initialize scanner. Please try again.");
      }
      return false;
    }
  };

  // Start or stop scanning based on isScanning state
  useEffect(() => {
    // Don't do anything if no camera is selected
    if (!currentCamera || !mountedRef.current) return;
    
    let isMounted = true;
    let scannerInitialized = false;
    
    const handleScanningState = async () => {
      if (isScanning) {
        // Start scanning
        try {
          setLoading(true);
          setError(null);
          
      
          const success = await createScanner();
          if (!success || !mountedRef.current) {
            setLoading(false);
            setIsScanning(false);
            return;
          }
          
          // Configure and start scanner with simpler settings
          const config = { 
            fps: 5, // Lower FPS for better stability
            qrbox: { width: 250, height: 250 }, // Fixed size box instead of dynamic calculation
            aspectRatio: 1.0
          };
          
          await scannerRef.current.start(
            { deviceId: currentCamera },
            config,
            (decodedText: string, decodedResult: any) => {
              if (mountedRef.current && scannerRef.current) {
                handleSuccessfulScan(decodedText, decodedResult);
              }
            },
            (errorMessage: string) => {
              // Silent failure is fine for scanning
            }
          );
          
          // Mark scanner as initialized
          scannerInitialized = true;
          
          if (mountedRef.current) {
            setLoading(false);
          }
        } catch (err) {
          console.error("Error starting scanner:", err);
          if (mountedRef.current) {
            setIsScanning(false);
            setLoading(false);
            setError("Failed to start camera. Please check permissions and try again.");
          }
        }
      } else {
        // Stop scanning and clean up scanner when isScanning becomes false
        await cleanupScanner();
      }
    };
    
    handleScanningState();
    
    // Clean up this effect
    return () => {
      isMounted = false;
      scannerInitialized = false;
      
      // Clean up the scanner on unmount using our cleanup function
      // We don't need to await this since the component is unmounting
      cleanupScanner().catch(err => {
        console.error('Error during effect cleanup:', err);
      });
    };
  }, [isScanning, currentCamera]);

  // Handle successful scan
  const handleSuccessfulScan = async (decodedText: string, decodedResult: any) => {
    try {
      // Safety check - don't proceed if component unmounted
      if (!mountedRef.current) return;
      
      const data = decodedText.trim();
      
      // Detect QR type and create result object
      const qrTypeInfo = detectQRType(data);
      const result: QRCodeResult = {
        id: Date.now(),
        data,
        type: qrTypeInfo.type,
        timestamp: new Date().toLocaleString(),
        typeInfo: qrTypeInfo
      };
      
      // Play success sound
      playScanSuccessSound();
      
      if (!continuousScan) {
        // For single scan mode, first update the state
        // This needs to happen before any async operations
        setIsScanning(false);
        
        // Immediately call the success callback before any cleanup
        // This ensures the UI updates with the scan result
        onScanSuccess(result);
        
        // Show toast notification
        toast({
          title: `${qrTypeInfo.type.charAt(0).toUpperCase() + qrTypeInfo.type.slice(1)} QR Code Detected`,
          description: data.length > 50 ? `${data.substring(0, 50)}...` : data,
          variant: "default"
        });
        
        // After UI updates, clean up the scanner
        // Use setTimeout to ensure this happens after React has processed state updates
        setTimeout(() => {
          cleanupScanner().catch(err => {
            console.error('Error during delayed scanner cleanup:', err);
          });
        }, 300);
      } else {
        // In continuous mode, just update UI without stopping scanner
        onScanSuccess(result);
        toast({
          title: `${qrTypeInfo.type.charAt(0).toUpperCase() + qrTypeInfo.type.slice(1)} QR Code Detected`,
          description: data.length > 50 ? `${data.substring(0, 50)}...` : data,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error processing scan result:', error);
      if (mountedRef.current) {
        toast({
          title: "Error processing scan",
          description: "Failed to process the scanned QR code.",
          variant: "destructive"
        });
      }
    }
  };

  // Handle scan failure (not critical)
  const onScanFailure = (error: any) => {
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

  // Toggle scanner
  const toggleScanner = () => {
    setIsScanning(!isScanning);
  };

  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl overflow-hidden p-6">
      {/* Header with controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold">Camera Scanner</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSettings}
            className={`p-2 rounded-xl transition-all duration-300 ${
              showSettings
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                : 'bg-background/50 hover:bg-background/80 border border-border/50'
            }`}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Settings panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50 shadow-inner animate-in slide-in-from-top duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="scan-mode" 
                  checked={continuousScan}
                  onCheckedChange={setContinuousScan}
                />
                <Label htmlFor="scan-mode" className="text-sm font-medium">
                  {continuousScan ? 'Continuous Scan' : 'Single Scan'}
                </Label>
              </div>
            </div>
            
            {availableCameras.length > 1 && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="camera-select" className="text-sm font-medium">
                  Camera:
                </Label>
                <Select
                  value={currentCamera}
                  onValueChange={setCurrentCamera}
                  disabled={isScanning}
                >
                  <SelectTrigger id="camera-select" className="w-[180px] bg-background/70">
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCameras.map(camera => (
                      <SelectItem key={camera.id} value={camera.id}>
                        {camera.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Scanner view */}
      <div className="relative mb-6">
        <div 
          id="reader" 
          ref={readerRef}
          className={`w-full aspect-square max-w-[500px] mx-auto rounded-xl relative overflow-hidden
            ${isScanning 
              ? 'border-blue-500 border-2 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
              : 'border border-border/50 bg-background/30'
            }`}
        >
          {!isScanning && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20 blur-xl"></div>
                  <div className="relative bg-background/80 backdrop-blur-sm p-6 rounded-full border border-blue-200 dark:border-blue-800/50 shadow-lg">
                    <Camera className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                    <span className="text-white text-xs font-bold">QR</span>
                  </div>
                </div>
                <p className="text-xl font-medium mb-2">Position QR Code Here</p>
                <p className="text-sm max-w-xs text-center text-muted-foreground">
                  Click the Start Scan button to activate the camera
                </p>
              </div>
            </div>
          )}
          
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Animated scanner overlay */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan"></div>
              </div>
              
              {/* Corner markers */}
              <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-blue-500 rounded-tl-md"></div>
              <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-blue-500 rounded-tr-md"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-blue-500 rounded-bl-md"></div>
              <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-blue-500 rounded-br-md"></div>
              
              {/* Center focus area */}
              <div className="w-64 h-64 border-2 border-dashed border-blue-400/50 rounded-lg"></div>
            </div>
          )}
        </div>
        
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl z-10">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20 blur-xl animate-pulse"></div>
                <div className="relative">
                  <svg className="animate-spin h-16 w-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
              <p className="mt-4 text-lg font-medium text-foreground">
                Initializing camera...
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
                    onClick={() => {
                      setError(null);
                      if (scannerRef.current) {
                        try {
                          if (scannerRef.current.isScanning) {
                            scannerRef.current.stop().catch((err: any) => console.error("Error stopping scanner:", err));
                          }
                        } catch (err) {
                          console.error("Error resetting scanner:", err);
                        }
                      }
                    }}
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Retry
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
          onClick={toggleScanner}
          className={`w-full py-6 text-lg font-medium rounded-xl transition-all duration-300 ${
            isScanning 
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg'
          }`}
          disabled={loading || !availableCameras.length}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>Initializing...</span>
            </div>
          ) : isScanning ? (
            <div className="flex items-center justify-center">
              <StopCircle className="mr-2 h-5 w-5" />
              <span>Stop Scanning</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Play className="mr-2 h-5 w-5" />
              <span>Start Scanning</span>
            </div>
          )}
        </Button>
      </div>
      
      {/* Add custom styles for animations */}
      <style jsx global>{`
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
