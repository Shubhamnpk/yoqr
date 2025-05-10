"use client";

import React, { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import CameraScanner from './camera-scanner';
import ImageScanner from './image-scanner';
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
  const [scanMode, setScanMode] = useState<'camera' | 'image'>('camera');

  return (
    <div className="space-y-6">
      {/* Scanner mode toggle */}
      <div className="flex justify-center">
        <div className="bg-card/80 backdrop-blur-lg rounded-full p-1 flex gap-1">
          <button
            className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${
              scanMode === 'camera' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                : 'bg-background/50 hover:bg-background/80'
            }`}
            onClick={() => setScanMode('camera')}
          >
            <Camera className="h-4 w-4 mr-2" />
            <span>Camera</span>
          </button>
          
          <button
            className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${
              scanMode === 'image' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md' 
                : 'bg-background/50 hover:bg-background/80'
            }`}
            onClick={() => setScanMode('image')}
          >
            <Upload className="h-4 w-4 mr-2" />
            <span>Upload</span>
          </button>
        </div>
      </div>
      
      {/* Scanner component based on mode */}
      {scanMode === 'camera' ? (
        <CameraScanner
          isScanning={isScanning}
          setIsScanning={setIsScanning}
          continuousScan={continuousScan}
          setContinuousScan={setContinuousScan}
          currentCamera={currentCamera}
          setCurrentCamera={setCurrentCamera}
          onScanSuccess={onScanSuccess}
        />
      ) : (
        <ImageScanner onScanSuccess={onScanSuccess} />
      )}
    </div>
  );
}
