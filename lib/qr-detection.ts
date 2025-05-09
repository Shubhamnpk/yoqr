import { QRTypeInfo } from '@/types/qr-types';

// QR code type detection
export const detectQRType = (data: string): QRTypeInfo => {
  // Safety check
  if (!data || typeof data !== 'string') {
    console.warn('Invalid data provided to detectQRType:', data);
    return {
      type: 'text',
      regex: /.*/ 
    };
  }
  
  // Trim the data
  data = data.trim();
  // URL detection
  if (/^(https?:\/\/)?([\w\d-]+\.)+[\w\d]{2,}(\/.*)?$/i.test(data)) {
    return {
      type: 'url',
      regex: /^(https?:\/\/)?([\w\d-]+\.)+[\w\d]{2,}(\/.*)?$/i
    };
  }
  
  // WiFi detection
  if (/^WIFI:/i.test(data)) {
    return {
      type: 'wifi',
      regex: /^WIFI:/i
    };
  }
  
  // Email detection
  if (/^mailto:|^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/i.test(data)) {
    return {
      type: 'email',
      regex: /^mailto:|^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/i
    };
  }
  
  // Phone detection
  if (/^tel:|^(\+\d{1,3})?[-. ]?\(?[\d\s]{3,}\)?[-. ]?[\d\s]{3,}$/i.test(data)) {
    return {
      type: 'phone',
      regex: /^tel:|^(\+\d{1,3})?[-. ]?\(?[\d\s]{3,}\)?[-. ]?[\d\s]{3,}$/i
    };
  }
  
  // SMS detection
  if (/^sms:/i.test(data)) {
    return {
      type: 'sms',
      regex: /^sms:/i
    };
  }
  
  // Geo location detection
  if (/^geo:/i.test(data)) {
    return {
      type: 'geo',
      regex: /^geo:/i
    };
  }
  
  // vCard (contact) detection
  if (/^BEGIN:VCARD/i.test(data)) {
    return {
      type: 'contact',
      regex: /^BEGIN:VCARD/i
    };
  }
  
  // Calendar event detection
  if (/^BEGIN:VEVENT/i.test(data)) {
    return {
      type: 'calendar',
      regex: /^BEGIN:VEVENT/i
    };
  }
  
  // Default to text
  return {
    type: 'text',
    regex: /.*/
  };
};