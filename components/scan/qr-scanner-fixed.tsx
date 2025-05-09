"use client";

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Camera, Upload, RefreshCw, Loader2, Play, StopCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { detectQRType } from '@/lib/qr-detection';
import { useToast } from '@/hooks/use-toast';
import { QRCodeResult } from '@/types/qr-types';

// Interface for the QRScanner component props
interface QRScannerProps {
  isScanning: boolean;
  setIsScanning: (isScanning: boolean) => void;
  continuousScan: boolean;
  setContinuousScan: (continuousScan: boolean) => void;
  currentCamera: string;
  setCurrentCamera: (cameraId: string) => void;
  onScanSuccess: (result: QRCodeResult) => void;
}

export default function QRScanner({
  isScanning,
  setIsScanning,
  continuousScan,
  setContinuousScan,
  currentCamera,
  setCurrentCamera,
  onScanSuccess
}: QRScannerProps) {
  const [availableCameras, setAvailableCameras] = useState<{id: string, label: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'upload'>('camera');
  const [error, setError] = useState<string | null>(null);
  
  const readerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);
  const { toast } = useToast();

  // Function to safely initialize the HTML5QrCode scanner
  const initializeScanner = async () => {
    try {
      // Clean up any existing scanner instance first
      if (scannerRef.current) {
        try {
          await scannerRef.current.clear();
          scannerRef.current = null;
        } catch (err) {
          console.error("Error clearing scanner:", err);
        }
      }

      // Only create a new scanner if the component is still mounted
      if (!mountedRef.current || !readerRef.current) return;

      // Import the HTML5QrCode library dynamically
      const { Html5Qrcode } = await import('html5-qrcode');
      
      // Create a new scanner instance with proper configuration
      scannerRef.current = new Html5Qrcode('reader', { 
        verbose: false,
        formatsToSupport: [] // Use default formats
      });

      // Get available cameras
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          const cameras = devices.map(device => ({
            id: device.id,
            label: device.label || (device.id.includes('back') ? 'Back Camera' : 'Front Camera')
          }));
          
          if (mountedRef.current) {
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
          }
        } else if (mountedRef.current) {
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
      console.error("Error initializing scanner:", err);
      if (mountedRef.current) {
        setError("Failed to initialize QR scanner. Please try again.");
        toast({
          title: "Scanner initialization error",
          description: "Could not initialize the QR scanner.",
          variant: "destructive"
        });
      }
    }
  };

  // Initialize scanner on component mount
  useEffect(() => {
    mountedRef.current = true;
    initializeScanner();
    
    // Clean up on unmount
    return () => {
      mountedRef.current = false;
      
      // Stop scanning and clear the scanner
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop()
              .catch((err: any) => console.error("Error stopping scanner:", err));
          }
          scannerRef.current.clear()
            .catch((err: any) => console.error("Error clearing scanner:", err));
        } catch (err) {
          console.error("Error during cleanup:", err);
        }
      }
    };
  }, []);

  // Start or stop scanning based on isScanning state
  useEffect(() => {
    if (!scannerRef.current || !mountedRef.current) return;
    
    const startScan = async () => {
      if (isScanning && currentCamera && scanMode === 'camera') {
        try {
          setLoading(true);
          setError(null);
          
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          
          const config = { 
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          };
          
          await scannerRef.current.start(
            currentCamera,
            config,
            onScan,
            onScanFailure
          );
          
          if (mountedRef.current) {
            setLoading(false);
          }
        } catch (err) {
          console.error("Error starting scanner:", err);
          if (mountedRef.current) {
            setIsScanning(false);
            setLoading(false);
            setError("Failed to start camera. Please check permissions and try again.");
            toast({
              title: "Scanner error",
              description: "Failed to start camera. Please check permissions.",
              variant: "destructive"
            });
          }
        }
      } else if (!isScanning && scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop();
        } catch (err) {
          console.error("Error stopping scanner:", err);
        }
      }
    };
    
    startScan();
  }, [isScanning, currentCamera, scanMode]);

  // Handle successful scan
  const onScan = (decodedText: string, decodedResult: any) => {
    try {
      if (!mountedRef.current) return;
      
      const data = decodedText.trim();
      
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
      
      // Stop scanner if not in continuous mode
      if (!continuousScan && scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
          .catch((err: any) => console.error("Error stopping scanner:", err));
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
    // We don't need to show errors for normal scan failures
    // console.log("QR scan failure:", error);
  };

  // Handle image upload for QR code scanning
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    
    try {
      setUploadLoading(true);
      setError(null);
      
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive"
        });
        setUploadLoading(false);
        return;
      }
      
      // Create an image from the file
      const image = await createImageFromFile(file);
      
      // Make sure scanner is initialized
      if (!scannerRef.current) {
        await initializeScanner();
      }
      
      // Scan the image for QR codes
      if (scannerRef.current) {
        try {
          const result = await scannerRef.current.scanFile(file, true);
          
          if (mountedRef.current) {
            // Process the scan result
            onScan(result, null);
          }
        } catch (err: any) {
          console.error("Error scanning image:", err);
          if (mountedRef.current) {
            toast({
              title: "No QR code found",
              description: "Could not detect a valid QR code in the image.",
              variant: "destructive"
            });
          }
        }
      } else {
        if (mountedRef.current) {
          toast({
            title: "Scanner not initialized",
            description: "QR scanner could not be initialized. Please try again.",
            variant: "destructive"
          });
        }
      }
    } catch (err) {
      console.error("Error processing image:", err);
      if (mountedRef.current) {
        toast({
          title: "Image processing error",
          description: "Failed to process the uploaded image.",
          variant: "destructive"
        });
      }
    } finally {
      if (mountedRef.current) {
        setUploadLoading(false);
      }
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Create an image element from a file
  const createImageFromFile = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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

  // Toggle scanner
  const toggleScanner = () => {
    setIsScanning(!isScanning);
  };

  return (
    <div className="bg-background/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 shadow-lg">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <h2 className="text-xl font-bold">QR Code Scanner</h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setScanMode('camera')}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${scanMode === 'camera' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Camera className={`h-5 w-5 ${scanMode === 'camera' ? 'mr-2' : ''}`} />
              {scanMode === 'camera' && <span>Camera</span>}
            </button>
            
            <button
              onClick={() => setScanMode('upload')}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${scanMode === 'upload' 
                ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md' 
                : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Upload className={`h-5 w-5 ${scanMode === 'upload' ? 'mr-2' : ''}`} />
              {scanMode === 'upload' && <span>Upload Image</span>}
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            {scanMode === 'camera' && (
              <>
                <Switch 
                  id="scan-mode" 
                  checked={continuousScan}
                  onCheckedChange={setContinuousScan}
                />
                <Label htmlFor="scan-mode" className="text-sm font-medium">
                  {continuousScan ? 'Continuous Scan' : 'Single Scan'}
                </Label>
              </>
            )}
          </div>
          
          {scanMode === 'camera' && availableCameras.length > 1 && (
            <div className="flex items-center space-x-2">
              <Select
                value={currentCamera}
                onValueChange={setCurrentCamera}
                disabled={isScanning}
              >
                <SelectTrigger className="w-[180px]">
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
        
        <div className="flex justify-center mb-4">
          {scanMode === 'camera' && (
            <>
              <Button 
                onClick={toggleScanner}
                className={`${isScanning 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'} 
                  text-white font-medium py-2 px-4 rounded-xl transition duration-300 w-full`}
                disabled={loading || !availableCameras.length}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Initializing...
                  </>
                ) : isScanning ? (
                  <>
                    <StopCircle className="mr-2 h-5 w-5" />
                    Stop Scan
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Start Scan
                  </>
                )}
              </Button>
            </>
          )}
          
          {scanMode === 'upload' && (
            <Button 
              onClick={triggerFileInput}
              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-xl transition duration-300 w-full"
              disabled={uploadLoading}
            >
              {uploadLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Select Image to Scan
                </>
              )}
            </Button>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        
        <div className="relative">
          <div 
            id="reader" 
            ref={readerRef}
            className={`w-full h-72 md:h-96 bg-background/50 rounded-xl relative overflow-hidden
              ${isScanning ? 'border-blue-500 border-2' : 'border border-border/50'}`}
          >
            {!isScanning && !loading && !uploadLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                {scanMode === 'camera' ? (
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Camera className="h-16 w-16 mb-4 opacity-50" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                        <span className="text-white text-xs">QR</span>
                      </div>
                    </div>
                    <p className="text-lg font-medium">Position QR Code Here</p>
                    <p className="text-sm mt-2 max-w-xs text-center">
                      Click the Start Scan button to activate the camera
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Upload className="h-16 w-16 mb-4 opacity-50" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                        <span className="text-white text-xs">QR</span>
                      </div>
                    </div>
                    <p className="text-lg font-medium">Upload QR Code Image</p>
                    <p className="text-sm mt-2 max-w-xs text-center">
                      Click the Select Image button to upload a QR code
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan"></div>
                <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-blue-500 rounded-tl-md"></div>
                <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-blue-500 rounded-tr-md"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-blue-500 rounded-bl-md"></div>
                <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-blue-500 rounded-br-md"></div>
              </div>
            )}
          </div>
          
          {(loading || uploadLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 rounded-xl">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-sm font-medium text-foreground/80">
                  {uploadLoading ? "Processing image..." : "Initializing camera..."}
                </p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              <p className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  setError(null);
                  initializeScanner();
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
