"use client";

import { useState } from 'react';
import QRScanner from '@/components/scan/qr-scanner';
import ResultDisplay from '@/components/scan/result-display';
import HistoryPanel from '@/components/scan/history-panel';
import { QRCodeResult } from '@/types/qr-types';

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [continuousScan, setContinuousScan] = useState(false);
  const [currentCamera, setCurrentCamera] = useState('');
  const [scanResult, setScanResult] = useState<QRCodeResult | null>(null);
  const [scanHistory, setScanHistory] = useState<QRCodeResult[]>([]);
  const [currentFilter, setCurrentFilter] = useState('all');

  // Handle successful scan
  const handleScanSuccess = (result: QRCodeResult) => {
    setScanResult(result);
    setIsScanning(continuousScan);
    setScanHistory(prev => [result, ...prev]);
  };

  // Handle clear history
  const handleClearHistory = () => {
    setScanHistory([]);
  };

  // Handle export CSV
  const handleExportCSV = () => {
    if (scanHistory.length === 0) return;

    // Create CSV content
    const csvContent = [
      // CSV header
      ['Type', 'Data', 'Timestamp'].join(','),
      // CSV rows
      ...scanHistory.map(item => [
        item.type,
        `"${item.data.replace(/"/g, '""')}"`, // Escape quotes in CSV
        item.timestamp
      ].join(','))
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `qr-scan-history-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">QR Code Scanner</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <QRScanner
            isScanning={isScanning}
            setIsScanning={setIsScanning}
            continuousScan={continuousScan}
            setContinuousScan={setContinuousScan}
            currentCamera={currentCamera}
            setCurrentCamera={setCurrentCamera}
            onScanSuccess={handleScanSuccess}
          />

          <ResultDisplay result={scanResult} />
        </div>

        <div className="lg:col-span-1">
          <HistoryPanel
            history={scanHistory}
            currentFilter={currentFilter}
            setCurrentFilter={setCurrentFilter}
            onSelectItem={setScanResult}
            onClearHistory={handleClearHistory}
            onExportCSV={handleExportCSV}
          />
        </div>
      </div>
    </div>
  );
}