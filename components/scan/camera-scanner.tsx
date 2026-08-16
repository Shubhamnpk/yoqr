"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeResult } from '@/types/qr-types';
import { detectQRType } from '@/lib/qr-detection';
import { scannerConfig } from '@/lib/scanner-config';
import { Focus } from 'lucide-react';

interface CameraScannerProps {
  isScanning: boolean;
  setIsScanning: (isScanning: boolean) => void;
  continuousScan: boolean;
  setContinuousScan: (continuousScan: boolean) => void;
  currentCamera: string;
  setCurrentCamera: (cameraId: string) => void;
  onScanSuccess: (result: QRCodeResult) => void;
  onCamerasLoaded?: (cameras: { id: string; label: string }[]) => void;
}

interface CameraDevice {
  id: string;
  label: string;
  cameraType?: string;
}

export default function CameraScanner({
  isScanning,
  setIsScanning,
  continuousScan,
  currentCamera,
  setCurrentCamera,
  onScanSuccess,
  onCamerasLoaded
}: CameraScannerProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const isStartingRef = useRef<boolean>(false);
  const isStoppingRef = useRef<boolean>(false);
  const currentCameraRef = useRef<string>(currentCamera);
  currentCameraRef.current = currentCamera;

  // Format camera labels for display
  const formatCameraList = useCallback((cameras: Array<{ id: string; label: string }>): CameraDevice[] => {
    let backCount = 0;
    let frontCount = 0;
    return cameras.map((camera, index) => {
      let label = camera.label || '';
      const lower = label.toLowerCase();
      let cameraType = '';

      if (lower.includes('back') || lower.includes('environment') || lower.includes('rear')) {
        backCount++;
        label = backCount > 1 ? `Back Camera ${backCount}` : 'Back Camera';
        cameraType = 'environment';
      } else if (lower.includes('front') || lower.includes('user') || lower.includes('facing')) {
        frontCount++;
        label = frontCount > 1 ? `Front Camera ${frontCount}` : 'Front Camera';
        cameraType = 'user';
      } else if (!label || label.trim() === '') {
        label = `Camera ${index + 1}`;
      }

      return {
        id: camera.id,
        label,
        cameraType
      };
    });
  }, []);

  // Load available cameras
  const loadCameras = useCallback(async () => {
    try {
      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length > 0) {
        const formatted = formatCameraList(cameras);
        if (onCamerasLoaded) {
          onCamerasLoaded(formatted);
        }

        // Set default camera if not selected or current camera is invalid
        if (!currentCameraRef.current || !formatted.some(c => c.id === currentCameraRef.current)) {
          const backCamera = formatted.find(c => c.cameraType === 'environment' || c.label.toLowerCase().includes('back'));
          const defaultCam = backCamera ? backCamera.id : formatted[0].id;
          setCurrentCamera(defaultCam);
        }
        return formatted;
      }
    } catch (err) {
      // Prior to user granting permission, getCameras() might return empty or fail silently.
      // startScanner will request permissions directly.
      console.debug("Camera enumeration note:", err);
    }
    return [];
  }, [formatCameraList, onCamerasLoaded, setCurrentCamera]);

  // Check if device supports flashlight
  const checkFlashSupport = async () => {
    if (!scannerRef.current) return false;

    try {
      if (typeof (scannerRef.current as any).hasTorch === 'function') {
        const torchSupported = await (scannerRef.current as any).hasTorch();
        setHasTorch(torchSupported);
        return torchSupported;
      } else {
        setHasTorch(false);
        return false;
      }
    } catch {
      setHasTorch(false);
      return false;
    }
  };

  // Toggle flashlight
  const toggleFlash = async () => {
    if (!scannerRef.current || !hasTorch) return;

    try {
      if (flashOn) {
        await (scannerRef.current as any).disableTorch();
      } else {
        await (scannerRef.current as any).enableTorch();
      }
      setFlashOn(!flashOn);
    } catch (error) {
      console.error("Error toggling flashlight:", error);
      setError('Failed to toggle flashlight');
      setHasTorch(false);
    }
  };

  // Handle successful scan
  const handleScanSuccess = (decodedText: string) => {
    const data = decodedText.trim();
    const qrType = detectQRType(data);

    const result: QRCodeResult = {
      id: Date.now(),
      data,
      type: qrType.type,
      timestamp: new Date().toLocaleString(),
      typeInfo: qrType,
    };

    onScanSuccess(result);

    if (!continuousScan) {
      setIsScanning(false);
    }
  };

  // Handle scan failure
  const handleScanFailure = () => {
    // Frame did not contain a QR code; ignored
  };

  // Start QR scanner
  const startScanner = async () => {
    if (isStartingRef.current || isStoppingRef.current) return;

    if (!scannerRef.current) {
      if (readerRef.current) {
        scannerRef.current = new Html5Qrcode('reader');
      } else {
        return;
      }
    }

    try {
      isStartingRef.current = true;
      setLoading(true);
      setError(null);
      setFlashOn(false);

      // If scanner is already running, stop it first before starting
      if (scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop();
        } catch {
          // Ignore
        }
      }

      const config = {
        ...scannerConfig,
        aspectRatio: 1,
      };

      // Use specific camera deviceId if selected, otherwise fallback to facingMode 'environment'
      const cameraConstraint = currentCameraRef.current
        ? currentCameraRef.current
        : { facingMode: 'environment' };

      await scannerRef.current.start(
        cameraConstraint,
        config,
        handleScanSuccess,
        handleScanFailure
      );

      // Check flashlight support once camera stream is active
      await checkFlashSupport();

      // Refresh camera list now that permissions have been granted
      await loadCameras();
    } catch (err: any) {
      console.warn("Error starting scanner:", err);
      const errorMessage = (err?.message || String(err)).toLowerCase();
      if (errorMessage.includes('permission') || errorMessage.includes('notallowederror')) {
        setError('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (errorMessage.includes('notreadableerror') || errorMessage.includes('in use') || errorMessage.includes('device')) {
        setError('Camera is in use by another application or tab. Please close other camera apps and try again.');
      } else {
        setError('Failed to start camera. Please check permissions and try again.');
      }
      setIsScanning(false);
    } finally {
      isStartingRef.current = false;
      setLoading(false);
    }
  };

  // Stop QR scanner
  const stopScanner = async () => {
    if (!scannerRef.current || isStoppingRef.current) return;

    try {
      isStoppingRef.current = true;
      setLoading(true);
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
    } catch (err) {
      console.debug("Error stopping scanner:", err);
    } finally {
      isStoppingRef.current = false;
      setLoading(false);
    }
  };

  // Initialize scanner on mount
  useEffect(() => {
    if (!scannerRef.current && readerRef.current) {
      scannerRef.current = new Html5Qrcode('reader');
    }

    loadCameras();

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
        try {
          scannerRef.current.clear();
        } catch {
          // Ignore
        }
      }
    };
  }, [loadCameras]);

  // Effect to start/stop scanner when isScanning or currentCamera changes
  useEffect(() => {
    if (isScanning) {
      startScanner();
    } else {
      stopScanner();
    }
  }, [isScanning, currentCamera]);

  return (
    <div className="relative w-full">
      {/* Scanner container */}
      <div 
        className="relative overflow-hidden bg-muted/70 rounded-xl shadow-inner"
        style={{ minHeight: '240px' }}
      >
        {/* Flashlight toggle button - only show when flash is supported and scanning */}
        {isScanning && hasTorch && (
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
        
        <div className="absolute top-5 left-5 w-5 h-5 border-t-2 border-l-2 border-primary opacity-80 z-10" />
        <div className="absolute top-5 right-5 w-5 h-5 border-t-2 border-r-2 border-primary opacity-80 z-10" />
        <div className="absolute bottom-5 left-5 w-5 h-5 border-b-2 border-l-2 border-primary opacity-80 z-10" />
        <div className="absolute bottom-5 right-5 w-5 h-5 border-b-2 border-r-2 border-primary opacity-80 z-10" />
        
        <div 
          id="reader" 
          ref={readerRef}
          className="w-full h-full"
        />
        
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

// Global scan-line style
if (typeof document !== 'undefined') {
  const styleId = 'yoqr-scanner-styles';
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
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
}
