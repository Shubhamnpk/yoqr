// Configuration for QR scanner
export const scannerConfig = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  experimentalFeatures: {
    useBarCodeDetectorIfSupported: true
  }
};