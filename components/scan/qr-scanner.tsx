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
    <div className="bg-slate-900 p-6 rounded-xl shadow-2xl max-w-xl mx-auto border border-slate-800">
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
