"use client";

import React, { useState, useEffect } from 'react';
import { Camera, Upload, Smartphone } from 'lucide-react';
import CameraScanner from './camera-scanner';
import ImageScanner from './image-scanner';
import { QRCodeResult } from '@/types/qr-types';
import { Html5Qrcode } from 'html5-qrcode';

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

// Camera selector component that only shows when cameras are available
interface CameraSelectorProps {
  currentCamera: string;
  setCurrentCamera: (cameraId: string) => void;
}

function CameraSelector({ currentCamera, setCurrentCamera }: CameraSelectorProps) {
  const [availableCameras, setAvailableCameras] = useState<{id: string, label: string}[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Detect available cameras on mount
  useEffect(() => {
    async function detectCameras() {
      try {
        setLoading(true);
        const cameras = await Html5Qrcode.getCameras();
        
        if (cameras && cameras.length > 0) {
          // Format camera labels to be more user-friendly
          const formattedCameras = cameras.map(camera => {
            let label = camera.label || `Camera ${camera.id}`;
            
            // Try to detect back/front camera from label
            if (label.toLowerCase().includes('back')) {
              label = 'Back Camera';
            } else if (label.toLowerCase().includes('front')) {
              label = 'Front Camera';
            } else if (label.toLowerCase().includes('environment')) {
              label = 'Back Camera';
            } else if (label.toLowerCase().includes('user')) {
              label = 'Front Camera';
            }
            
            return {
              id: camera.id,
              label
            };
          });
          
          setAvailableCameras(formattedCameras);
        }
      } catch (error) {
        console.error("Error detecting cameras:", error);
      } finally {
        setLoading(false);
      }
    }
    
    detectCameras();
  }, []);
  
  // If no cameras or still loading, don't render anything
  if (loading || availableCameras.length === 0) {
    return null;
  }
  
  // Only show selector if we have multiple cameras
  if (availableCameras.length <= 1) {
    return null;
  }
  
  return (
    <div className="ml-4 flex items-center space-x-2">
      <Smartphone className="h-4 w-4 text-slate-400" />
      <select
        id="camera-select"
        className="bg-slate-700 border-none text-xs text-slate-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none max-w-[150px] truncate"
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

  return (
    <div className="bg-card/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-6 border border-border/50">
      {/* Scanner mode toggle - modern pill-shaped toggle */}
      <div className="flex mb-6 bg-slate-800/50 p-1.5 rounded-lg">
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
          <span>Upload Image</span>
        </button>
      </div>
      
      {/* Controls section - modern glassmorphism style */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-700/50">
        <div className="flex items-center justify-between">
          {/* Left side: Scan Mode Toggle */}
          <div className="flex items-center">
            {/* Modern toggle switch */}
            <div 
              className={`w-12 h-6 rounded-full p-1 cursor-pointer relative transition-colors duration-300 ${continuousScan ? 'bg-blue-500' : 'bg-slate-700'}`}
              onClick={() => setContinuousScan(!continuousScan)}
            >
              <div 
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${continuousScan ? 'translate-x-6' : ''}`}
              ></div>
            </div>
            <span className="ml-3 text-slate-300 text-sm font-medium">
              {continuousScan ? 'Continuous Scan' : 'Single Scan'}
            </span>
          </div>
          
          {/* Right side: Camera Selection (Only visible when cameras are available) */}
          {scanMode === 'camera' && (
            <CameraSelector 
              currentCamera={currentCamera} 
              setCurrentCamera={setCurrentCamera} 
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
          />
        ) : (
          <ImageScanner onScanSuccess={onScanSuccess} />
        )}
      </div>
    </div>
  );
}
