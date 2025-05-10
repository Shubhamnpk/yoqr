"use client";

import { useState } from 'react';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { QRCodeResult } from '@/types/qr-types';
import { getQRTypeIcon, getQRTypeActions } from '@/lib/qr-type-config';

interface ResultDisplayProps {
  result: QRCodeResult | null;
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          variant: "default"
        });
      })
      .catch(err => {
        console.error('Clipboard error:', err);
        toast({
          title: "Failed to copy",
          description: "Please try again",
          variant: "destructive"
        });
      });
  };

  if (!result) {
    return (
      <div className="bg-card/80 backdrop-blur-lg rounded-md border border-border/50 overflow-hidden max-w-[95%] mx-auto">
        <div className="flex items-center p-4">
          <div className="qr-type-icon qr-type-text text-muted-foreground bg-muted/30 w-10 h-10 flex items-center justify-center rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-grow overflow-hidden">
            <h3 className="text-sm text-muted-foreground font-medium">Awaiting Scan</h3>
            <p className="text-foreground text-sm truncate">Scan a QR code to see results</p>
          </div>
        </div>
      </div>
    );
  }

  // Get the icon for the QR type
  const typeIcon = getQRTypeIcon(result.type);
  
  // Get the actions for the QR type
  const actions = getQRTypeActions(result.type, result.data);

  return (
    <div className="bg-card/80 backdrop-blur-lg rounded-md border border-border/50 overflow-hidden max-w-[95%] mx-auto">
      <div className="flex items-center p-4 border-b border-border/50">
        <div className={`qr-type-icon qr-type-${result.type} w-10 h-10 flex items-center justify-center rounded-lg mr-3`} 
             style={{backgroundColor: `hsla(${getTypeColor(result.type)}, 0.2)`, color: `hsl(${getTypeColor(result.type)})`}}>
          {typeIcon}
        </div>
        <div className="flex-grow overflow-hidden">
          <h3 className="text-sm text-muted-foreground font-medium">
            {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
          </h3>
          <p className="text-foreground text-sm truncate">{result.data}</p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="bg-muted/20 hover:bg-muted text-foreground"
              onClick={() => action.action(result.data)}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </Button>
          ))}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-muted/20 hover:bg-muted text-foreground"
                  onClick={() => copyToClipboard(result.data)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Details */}
        <Button
          variant="ghost"
          className="text-primary text-sm flex items-center w-full justify-start px-0 hover:bg-transparent hover:text-primary/80"
          onClick={() => setShowDetails(!showDetails)}
        >
          <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
          {showDetails ? (
            <ChevronUp className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-1" />
          )}
        </Button>
        
        {showDetails && (
          <div className="mt-2 bg-muted/30 rounded-lg p-3 text-xs font-mono text-foreground overflow-x-auto">
            <pre className="whitespace-pre-wrap break-all">{formatDetailsContent(result)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to format the details content based on QR type
function formatDetailsContent(result: QRCodeResult): string {
  switch (result.type) {
    case 'wifi':
      try {
        const wifiMatch = {
          ssid: result.data.match(/S:([^;]+)/i)?.[1] || 'N/A',
          auth: result.data.match(/T:([^;]+)/i)?.[1] || 'N/A',
          password: result.data.match(/P:([^;]+)/i)?.[1] || 'N/A',
          hidden: result.data.match(/H:([^;]+)/i)?.[1]?.toLowerCase() === 'true' ? 'Yes' : 'No'
        };
        return `SSID: ${wifiMatch.ssid}\nAuthentication: ${wifiMatch.auth}\nPassword: ${wifiMatch.password}\nHidden: ${wifiMatch.hidden}`;
      } catch (e) {
        return result.data;
      }
    case 'calendar':
      try {
        let details = '';
        
        const summaryMatch = result.data.match(/SUMMARY:(.*)/i);
        if (summaryMatch) details += `Event: ${summaryMatch[1]}\n`;
        
        const startMatch = result.data.match(/DTSTART:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/i);
        if (startMatch) {
          const [_, year, month, day, hour, minute] = startMatch;
          const date = new Date(parseInt(year), parseInt(month)-1, parseInt(day), parseInt(hour), parseInt(minute));
          details += `Date: ${date.toLocaleString()}\n`;
        }
        
        const locationMatch = result.data.match(/LOCATION:(.*)/i);
        if (locationMatch) details += `Location: ${locationMatch[1]}\n`;
        
        const descMatch = result.data.match(/DESCRIPTION:(.*)/i);
        if (descMatch) details += `Description: ${descMatch[1]}`;
        
        return details || result.data;
      } catch (e) {
        return result.data;
      }
    default:
      return result.data;
  }
}

// Helper function to get color based on QR type
function getTypeColor(type: string): string {
  switch(type) {
    case 'url': return '220 100% 60%';
    case 'wifi': return '140 100% 40%';
    case 'email': return '330 100% 60%';
    case 'phone': return '30 100% 50%';
    case 'sms': return '280 100% 60%';
    case 'geo': return '0 100% 60%';
    case 'calendar': return '160 100% 40%';
    default: return '220 10% 60%';
  }
}