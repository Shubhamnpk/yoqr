"use client";

import React, { useState } from 'react';
import { Camera, Upload, Smartphone } from 'lucide-react';
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

// Camera selector component that only shows when multiple cameras are available
interface CameraSelectorProps {
  currentCamera: string;
  setCurrentCamera: (cameraId: string) => void;
  availableCameras: { id: string; label: string }[];
}

function CameraSelector({ currentCamera, setCurrentCamera, availableCameras }: CameraSelectorProps) {
  if (availableCameras.length <= 1) {
    return null;
  }
  
  return (
    <div className="ml-4 flex items-center space-x-2">
      <Smartphone className="h-4 w-4 text-muted-foreground" />
      <select
        id="camera-select"
        className="bg-muted border-none text-xs text-primary-foreground rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary focus:outline-none max-w-[150px] truncate"
        onChange={(e) => setCurrentCamera(e.target.value)}
        value={currentCamera}
        aria-label="Select camera"
      >
        {availableCameras.map((camera) => (
          <option key={camera.id} value={camera.id}>
            {camera.label}
          </option>
        ))}
      </select>
    </div>
  );
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
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([]);

  return (
    <div className="bg-card/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-6 border border-border/50">
      <div className="flex mb-6 bg-muted/50 p-1.5 rounded-lg shadow-sm">
        <button
          className={`flex-1 flex items-center justify-center py-3 transition-all duration-200 ${
            scanMode === 'camera' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg rounded-lg' 
              : 'bg-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setScanMode('camera')}
        >
          <Camera className="h-5 w-5 mr-2" />
          <span>Camera</span>
        </button>
        
        <button
          className={`flex-1 flex items-center justify-center py-3 transition-all duration-200 ${
            scanMode === 'image' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg rounded-lg' 
              : 'bg-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setScanMode('image')}
        >
          <Upload className="h-5 w-5 mr-2" />
          <span>Upload</span>
        </button>
      </div>
      
      {/* Controls section - modern glassmorphism style */}
      <div className="bg-muted/30 backdrop-blur-sm rounded-xl p-4 mb-6 border border-border/40 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className={`w-12 h-6 rounded-full p-1 cursor-pointer relative transition-colors duration-300 ${continuousScan ? 'bg-primary' : 'bg-muted'}`}
              onClick={() => setContinuousScan(!continuousScan)}
            >
              <div 
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${continuousScan ? 'translate-x-6' : ''}`}
              ></div>
            </div>
            <span className="ml-3 text-foreground text-sm font-medium">
              {continuousScan ? 'Continuous Scan' : 'Single Scan'}
            </span>
          </div>
          
          {/* Right side: Camera Selection (Only visible when multiple cameras are available) */}
          {scanMode === 'camera' && (
            <CameraSelector 
              currentCamera={currentCamera} 
              setCurrentCamera={setCurrentCamera} 
              availableCameras={availableCameras}
            />
          )}
        </div>
      </div>
      
      {/* Scanner component based on mode */}
      <div className="rounded-xl overflow-hidden">
        {scanMode === 'camera' ? (
          <CameraScanner
            isScanning={isScanning}
            setIsScanning={setIsScanning}
            continuousScan={continuousScan}
            setContinuousScan={setContinuousScan}
            currentCamera={currentCamera}
            setCurrentCamera={setCurrentCamera}
            onScanSuccess={onScanSuccess}
            onCamerasLoaded={setAvailableCameras}
          />
        ) : (
          <ImageScanner onScanSuccess={onScanSuccess} />
        )}
      </div>
    </div>
  );
}
