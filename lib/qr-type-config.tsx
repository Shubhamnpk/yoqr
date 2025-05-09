import { Copy, ExternalLink, Wifi, Mail, Phone, MessageSquare, Map, Calendar, FileText } from 'lucide-react';
import { QRTypeAction } from '@/types/qr-types';

// Get icon for a QR type
export const getQRTypeIcon = (type: string) => {
  switch (type) {
    case 'url':
      return <ExternalLink className="h-5 w-5" />;
    case 'wifi':
      return <Wifi className="h-5 w-5" />;
    case 'email':
      return <Mail className="h-5 w-5" />;
    case 'phone':
      return <Phone className="h-5 w-5" />;
    case 'sms':
      return <MessageSquare className="h-5 w-5" />;
    case 'geo':
      return <Map className="h-5 w-5" />;
    case 'calendar':
      return <Calendar className="h-5 w-5" />;
    case 'contact':
      return <FileText className="h-5 w-5" />;
    default: // text
      return <FileText className="h-5 w-5" />;
  }
};

// Get actions for a QR type
export const getQRTypeActions = (type: string, data: string): QRTypeAction[] => {
  // Safety check to ensure data is valid
  if (!data || typeof data !== 'string') {
    console.warn('Invalid QR data provided to getQRTypeActions:', data);
    return [];
  }
  switch (type) {
    case 'url':
      return [
        { 
          label: 'Open URL', 
          action: (data) => {
            try {
              // Validate URL format
              let url = data;
              if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = `https://${url}`;
              }
              
              // Try to create a URL object to validate it
              new URL(url);
              
              // Open the URL in a new tab
              window.open(url, '_blank');
            } catch (error) {
              console.error('Invalid URL:', error);
              alert('Cannot open invalid URL: ' + data);
            }
          },
          icon: <ExternalLink className="h-4 w-4 mr-2" />
        }
      ];
      
    case 'wifi':
      // There's no standard way to directly connect to WiFi via browser
      return []; // No direct actions for WiFi
      
    case 'email':
      return [
        { 
          label: 'Send Email', 
          action: (data) => window.location.href = data.startsWith('mailto:') ? data : `mailto:${data}`,
          icon: <Mail className="h-4 w-4 mr-2" />
        }
      ];
      
    case 'phone':
      return [
        { 
          label: 'Call Number', 
          action: (data) => window.location.href = data.startsWith('tel:') ? data : `tel:${data.replace(/\D+/g, '')}`,
          icon: <Phone className="h-4 w-4 mr-2" />
        }
      ];
      
    case 'sms':
      return [
        { 
          label: 'Send SMS', 
          action: (data) => window.location.href = data,
          icon: <MessageSquare className="h-4 w-4 mr-2" />
        }
      ];
      
    case 'geo':
      return [
        { 
          label: 'Open Maps', 
          action: (data) => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.replace('geo:', ''))}`, '_blank'),
          icon: <Map className="h-4 w-4 mr-2" />
        }
      ];
      
    case 'calendar':
      return [
        { 
          label: 'Add to Calendar', 
          action: (data) => {
            const blob = new Blob([data], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'event.ics';
            a.click();
            URL.revokeObjectURL(url);
          },
          icon: <Calendar className="h-4 w-4 mr-2" />
        }
      ];
      
    case 'contact':
      return [
        { 
          label: 'Save Contact', 
          action: (data) => {
            const blob = new Blob([data], { type: 'text/vcard' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'contact.vcf';
            a.click();
            URL.revokeObjectURL(url);
          },
          icon: <FileText className="h-4 w-4 mr-2" />
        }
      ];
      
    default: // text
      return []; // No special actions for plain text
  }
};