"use client";

import React, { useState } from 'react'; // Added React import
import { Button } from '@/components/ui/button';
import { QrCode, Camera } from 'lucide-react';
import QRScanner from '@/components/scan/qr-scanner';
import ResultDisplay from '@/components/scan/result-display';
import HistoryPanel from '@/components/scan/history-panel';
import QRCodeGenerator from '@/components/generate/qr-generator';
import QRCodePreview from '@/components/generate/qr-preview';
import QRCodeOptions from '@/components/generate/qr-options';
import { QRCodeResult, QRContentType, QRGenerateOptions } from '@/types/qr-types';

export default function Home() {
  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [continuousScan, setContinuousScan] = useState(false);
  const [currentCamera, setCurrentCamera] = useState('environment');
  const [scanResult, setScanResult] = useState<QRCodeResult | null>(null);
  const [history, setHistory] = useState<QRCodeResult[]>([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  
  // Generator state
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<QRContentType>('url');
  const [options, setOptions] = useState<QRGenerateOptions>({
    size: 200,
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    includeMargin: true,
    errorCorrectionLevel: 'M',
    imageSettings: null
  });

  // Mode toggle
  const [mode, setMode] = useState<'scan' | 'generate'>('scan');

  // Load history from localStorage on mount
  React.useEffect(() => {
    const storedHistory = localStorage.getItem('qrScanHistory');
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        setHistory(parsedHistory);
      } catch (e) {
        console.error("Error loading history:", e);
        localStorage.removeItem('qrScanHistory');
      }
    }
  }, []);

  // Save history to localStorage when it changes
  React.useEffect(() => {
    try {
      localStorage.setItem('qrScanHistory', JSON.stringify(history));
    } catch (e) {
      console.error("Error saving history:", e);
    }
  }, [history]);

  // Handle successful scan
  const handleScanSuccess = (result: QRCodeResult) => {
    setScanResult(result);
    setHistory(prevHistory => {
      const newHistory = [result, ...prevHistory];
      return newHistory.slice(0, 100);
    });
    
    if (!continuousScan) {
      setIsScanning(false);
    }
  };

  // Handle options change
  const handleOptionsChange = (newOptions: Partial<QRGenerateOptions>) => {
    setOptions(prevOptions => ({
      ...prevOptions,
      ...newOptions
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-radial from-background to-background/80 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-card/80 backdrop-blur-lg rounded-full p-1 flex gap-1">
            <Button
              variant={mode === 'scan' ? 'default' : 'ghost'}
              className="rounded-full"
              onClick={() => setMode('scan')}
            >
              <Camera className="h-4 w-4 mr-2" />
              Scan
            </Button>
            <Button
              variant={mode === 'generate' ? 'default' : 'ghost'}
              className="rounded-full"
              onClick={() => setMode('generate')}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
        
        {/* Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {mode === 'scan' ? (
            <>
              {/* Scanner Section */}
              <div className="lg:col-span-2">
                <QRScanner
                  isScanning={isScanning}
                  setIsScanning={setIsScanning}
                  continuousScan={continuousScan}
                  setContinuousScan={setContinuousScan}
                  currentCamera={currentCamera}
                  setCurrentCamera={setCurrentCamera}
                  onScanSuccess={handleScanSuccess}
                />
                
                {/* Result Display */}
                <div className="mt-6">
                  <ResultDisplay result={scanResult} />
                </div>
              </div>
              
              {/* History Panel */}
              <HistoryPanel
                history={history}
                currentFilter={currentFilter}
                setCurrentFilter={setCurrentFilter}
                onSelectItem={setScanResult}
                onClearHistory={() => setHistory([])}
                onExportCSV={() => {
                  // Export functionality
                }}
              />
            </>
          ) : (
            <>
              {/* Generator Form */}
              <div className="lg:col-span-2">
                <QRCodeGenerator 
                  content={content}
                  setContent={setContent}
                  contentType={contentType}
                  setContentType={setContentType}
                />
              </div>
              
              {/* Preview & Options */}
              <div className="lg:col-span-1">
                <QRCodePreview 
                  content={content}
                  options={options}
                />
                
                <div className="mt-6">
                  <QRCodeOptions 
                    options={options}
                    onChange={handleOptionsChange}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}