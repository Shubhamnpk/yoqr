"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeResult, QRTypeInfo } from '@/types/qr-types';
import { Focus, Camera } from 'lucide-react';

// QR Types configuration with regex patterns for detection
const qrTypes: Record<string, QRTypeInfo> = {
  url: {
    type: 'url',
    regex: /^(https?:\/\/)?([\w\d-]+\.)+[\w\d]{2,}(\/.*)?$/i,
  },
  wifi: {
    type: 'wifi',
    regex: /^WIFI:/i,
  },
  email: {
    type: 'email',
    regex: /^mailto:|^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/i,
  },
  phone: {
    type: 'phone',
    regex: /^tel:|^(\+\d{1,3})?[-. ]?\(?[\d\s]{3,}\)?[-. ]?[\d\s]{3,}$/i,
  },
  sms: {
    type: 'sms',
    regex: /^sms:/i,
  },
  geo: {
    type: 'geo',
    regex: /^geo:/i,
  },
  calendar: {
    type: 'calendar',
    regex: /^BEGIN:VEVENT/i,
  },
  text: {
    type: 'text',
    regex: /.*/,
  },
};

interface CameraScannerProps {
  isScanning: boolean;
  setIsScanning: (isScanning: boolean) => void;
  continuousScan: boolean;
  setContinuousScan: (continuousScan: boolean) => void;
  currentCamera: string;
  setCurrentCamera: (cameraId: string) => void;
  onScanSuccess: (result: QRCodeResult) => void;
}

interface CameraDevice {
  id: string;
  label: string;
}

export default function CameraScanner({
  isScanning,
  setIsScanning,
  continuousScan,
  setContinuousScan,
  currentCamera,
  setCurrentCamera,
  onScanSuccess
}: CameraScannerProps) {
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFlash, setHasFlash] = useState<boolean>(false);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [isActivelyScanning, setIsActivelyScanning] = useState<boolean>(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  // Initialize scanner on component mount
  useEffect(() => {
    if (!scannerRef.current && readerRef.current) {
      scannerRef.current = new Html5Qrcode('reader');
    }

    // Load available cameras
    loadCameras();

    // Cleanup on component unmount
    return () => {
      if (scannerRef.current && isActivelyScanning) {
        scannerRef.current.stop()
          .catch(error => console.error("Error stopping scanner:", error))
          .finally(() => setIsActivelyScanning(false));
      }
    };
  }, []);

  // Effect to start/stop scanner when isScanning changes
  useEffect(() => {
    if (isScanning) {
      startScanner();
    } else if (scannerRef.current) {
      stopScanner();
    }
  }, [isScanning, currentCamera]);

  // Toggle flashlight
  const toggleFlash = async () => {
    if (!scannerRef.current || !hasFlash) return;

    try {
      if (flashOn) {
        // TypeScript doesn't know about the torch methods, but they exist in the library
        await (scannerRef.current as any).disableTorch();
      } else {
        await (scannerRef.current as any).enableTorch();
      }
      setFlashOn(!flashOn);
    } catch (error) {
      console.error("Error toggling flashlight:", error);
      setError('Failed to toggle flashlight');
      // If we get an error, assume the device doesn't actually support flash
      setHasFlash(false);
    }
  };

  // Check if device supports flashlight
  const checkFlashSupport = async () => {
    if (!scannerRef.current) return false;
    
    try {
      // TypeScript doesn't know about the hasFlash method, but it exists in the library
      const torchSupported = await (scannerRef.current as any).hasFlash();
      setHasFlash(torchSupported);
      return torchSupported;
    } catch (error) {
      console.error("Error checking flash support:", error);
      setHasFlash(false);
      return false;
    }
  };
  
  // Load available cameras
  const loadCameras = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const cameras = await Html5Qrcode.getCameras();
      
      if (cameras && cameras.length > 0) {
        // Format camera labels to be more user-friendly
        const formattedCameras = cameras.map(camera => {
          let label = camera.label || `Camera ${camera.id}`;
          let cameraType = '';
          
          // Try to detect back/front camera from label
          if (label.toLowerCase().includes('back')) {
            label = 'Back Camera';
            cameraType = 'environment';
          } else if (label.toLowerCase().includes('front')) {
            label = 'Front Camera';
            cameraType = 'user';
          } else if (label.toLowerCase().includes('environment')) {
            label = 'Back Camera';
            cameraType = 'environment';
          } else if (label.toLowerCase().includes('user')) {
            label = 'Front Camera';
            cameraType = 'user';
          }
          
          return {
            id: camera.id,
            label,
            cameraType
          };
        });
        
        setAvailableCameras(formattedCameras);
        
        // If currentCamera is a facingMode like 'environment' or 'user', find a matching camera
        if (currentCamera === 'environment' || currentCamera === 'user') {
          const matchingCamera = formattedCameras.find(camera => 
            camera.cameraType === currentCamera
          );
          
          if (matchingCamera) {
            setCurrentCamera(matchingCamera.id);
          } else {
            // Fall back to default camera selection
            const backCamera = formattedCameras.find(camera => 
              camera.label.toLowerCase().includes('back')
            );
            
            if (backCamera) {
              setCurrentCamera(backCamera.id);
            } else {
              setCurrentCamera(formattedCameras[0].id);
            }
          }
        } else if (currentCamera === 'auto' || !currentCamera) {
          // Auto selection - prefer back camera
          const backCamera = formattedCameras.find(camera => 
            camera.label.toLowerCase().includes('back')
          );
          
          if (backCamera) {
            setCurrentCamera(backCamera.id);
          } else {
            setCurrentCamera(formattedCameras[0].id);
          }
        } else {
          // Check if the currentCamera exists in our available cameras
          const cameraExists = formattedCameras.some(camera => camera.id === currentCamera);
          if (!cameraExists) {
            // If not, default to the first camera
            setCurrentCamera(formattedCameras[0].id);
          }
        }
      } else {
        setError('No cameras found on your device');
      }
    } catch (error) {
      console.error("Error loading cameras:", error);
      setError('Failed to access camera. Please check permissions.');
    } finally {
      setLoading(false);
    }
  };

  // Start QR scanner
  const startScanner = async () => {
    if (!scannerRef.current || !currentCamera) return;
    
    try {
      setLoading(true);
      // Reset flash state when starting scanner or changing camera
      setFlashOn(false);
      
      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      };
      
      await scannerRef.current.start(
        currentCamera, 
        config, 
        handleScanSuccess,
        handleScanFailure
      );
      
      // Update scanning state after successful start
      setIsActivelyScanning(true);
      
      // Check if this device/camera supports flashlight after starting
      await checkFlashSupport();
      
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.warn("Error starting scanner:", error);
      }
      setError(`Camera access error. Please check your permissions and try again.`);
      setIsScanning(false);
      setIsActivelyScanning(false);
    } finally {
      setLoading(false);
    }
  };
  
  // Stop QR scanner
  const stopScanner = async () => {
    if (!scannerRef.current) return;
    
    try {
      setLoading(true);
      // Only attempt to stop if we believe the scanner is running
      if (isActivelyScanning) {
        await scannerRef.current.stop();
        setIsActivelyScanning(false);
      }
    } catch (error) {
      console.error("Error stopping scanner:", error);
      // Even if there's an error, we're no longer in scanning state
      setIsActivelyScanning(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle successful scan
  const handleScanSuccess = (decodedText: string, decodedResult: any) => {
    const data = decodedText.trim();
    const qrType = detectQRType(data);
    
    // Create the result object
    const result: QRCodeResult = {
      id: Date.now(),
      data,
      type: qrType.type,
      timestamp: new Date().toLocaleString(),
      typeInfo: qrType,
    };
    
    // Call the callback function with the result
    onScanSuccess(result);
    
    // Play success sound if supported
    playScanSuccessSound();
    
    // Auto stop if not in continuous mode
    if (!continuousScan) {
      setIsScanning(false);
    }
  };

  // Handle scan failure
  const handleScanFailure = (error: any) => {
    // We don't need to do anything here, but function is required
    console.debug("QR scan error (non-critical):", error);
  };

  // Detect QR code type
  const detectQRType = (data: string): QRTypeInfo => {
    for (const [type, typeInfo] of Object.entries(qrTypes)) {
      if (typeInfo.regex.test(data)) {
        return typeInfo;
      }
    }
    return qrTypes.text;
  };

  // Play success sound
  const playScanSuccessSound = () => {
    try {
      // Simple beep sound using Web Audio API
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Ignore errors - audio is not essential
    }
  };

  return (
    <div className="relative w-full">
      {/* Scanner container */}
      <div 
        className="relative overflow-hidden bg-muted/70 rounded-xl shadow-inner"
        style={{ minHeight: '240px' }}
      >
        {/* Flashlight toggle button - only show when flash is supported and scanning */}
        {isScanning && hasFlash && (
          <button
            onClick={toggleFlash}
            className={`absolute top-4 right-4 z-20 p-2 rounded-full ${flashOn ? 'bg-amber-500 text-white' : 'bg-background/80 text-muted-foreground'} transition-colors shadow-md`}
            title={flashOn ? 'Turn off flashlight' : 'Turn on flashlight'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
          </button>
        )}
        {/* Scan animation */}
        {isScanning && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line z-10" />
        )}
        
        {/* Corner markers */}
        <div className="absolute top-5 left-5 w-5 h-5 border-t-2 border-l-2 border-primary opacity-80 z-10" />
        <div className="absolute top-5 right-5 w-5 h-5 border-t-2 border-r-2 border-primary opacity-80 z-10" />
        <div className="absolute bottom-5 left-5 w-5 h-5 border-b-2 border-l-2 border-primary opacity-80 z-10" />
        <div className="absolute bottom-5 right-5 w-5 h-5 border-b-2 border-r-2 border-primary opacity-80 z-10" />
        
        {/* QR Code reader */}
        <div 
          id="reader" 
          ref={readerRef}
          className="w-full h-full"
        />
        
        {/* Position guide */}
        {!isScanning && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-medium text-gray-400 p-2 z-20 w-11/12 max-w-xs sm:w-auto">
            <div className="flex flex-col items-center justify-center p-3 sm:p-4 text-center">
              <div className="relative mb-2 sm:mb-3">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-full opacity-20 blur-xl animate-pulse"></div>
                <div className="relative">
                  <Focus className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-bold">QR</span>
                </div>
              </div>
              <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2 text-foreground">Position QR Code Here</p>
              <p className="text-xs sm:text-sm max-w-xs text-center text-muted-foreground">
              Click the Start Scan button to activate the camera
              </p>
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center z-20 space-y-4 p-8">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <h3 className="text-xl font-bold text-foreground">Loading camera...</h3>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-2 p-2 bg-red-500/20 text-red-200 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}
      
      {/* Camera controls */}
      <div className="mt-3 space-y-3">
        {/* Camera selector */}
        {availableCameras.length > 1 && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Camera</label>
            <select
              value={currentCamera}
              onChange={(e) => setCurrentCamera(e.target.value)}
              className="w-full bg-background/80 border border-border/40 text-foreground rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {availableCameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.label ? (camera.label.length > 30 ? camera.label.substring(0, 30) + '...' : camera.label) : `Camera ${camera.id}`}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Scan control button */}
        <button
          onClick={() => setIsScanning(!isScanning)}
          className={`w-full flex items-center justify-center py-2.5 px-4 rounded-lg transition-all duration-200 ${isScanning ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'} text-white shadow-md text-sm sm:text-base`}
        >
          {isScanning ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              Stop Scanning
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Scanning
            </>
          )}
        </button>
      </div>
    </div>
  );
}


// This will be added dynamically in the component and doesn't require a style tag
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @keyframes scan-line {
      0% { top: 0%; }
      50% { top: calc(100% - 4px); }
      100% { top: 0%; }
    }
    .animate-scan-line {
      animation: scan-line 2s infinite ease-in-out;
    }
  `;
  document.head.appendChild(styleTag);
}
