"use client";

import { useState, useEffect, useRef } from 'react';
import { Copy, ChevronDown, ChevronUp, ExternalLink, Calendar, Mail, Phone, 
         Wifi, MapPin, MessageSquare, FileText, Globe, Image, Navigation, Clock,
         Share2, AlertCircle, Check, ShieldCheck, Info, Link, Lock, Smartphone,
         Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { QRCodeResult } from '@/types/qr-types';
import { getQRTypeIcon, getQRTypeActions } from '@/lib/qr-type-config';

interface ResultDisplayProps {
  result: QRCodeResult | null;
}


export default function ResultDisplay({ result }: ResultDisplayProps) {
  // Add custom scrollbar styles
  if (typeof document !== 'undefined') {
    const styleElement = document.getElementById('custom-scrollbar-style') || document.createElement('style');
    if (!document.getElementById('custom-scrollbar-style')) {
      styleElement.id = 'custom-scrollbar-style';
      styleElement.innerHTML = `
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(150, 150, 150, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(150, 150, 150, 0.5);
        }
      `;
      document.head.appendChild(styleElement);
    }
  }
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'processed' | 'raw'>('processed');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Create a toast utility object we can use both in and outside the component
  const toastUtil = {
    success: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: "default"
      });
    },
    error: (title: string, description?: string) => {
      toast({
        title,
        description,
        variant: "destructive"
      });
    }
  };
  
  // Set the global toast utility for use in helper functions
  useEffect(() => {
    globalToastUtil = toastUtil;
    return () => {
      globalToastUtil = null;
    };
  }, []);
  
  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toastUtil.success("Copied to clipboard");
      })
      .catch(err => {
        console.error('Clipboard error:', err);
        toastUtil.error("Failed to copy", "Please try again");
      });
  };

  if (!result) {
    return (
      <div className="bg-card/80 rounded-lg border border-border/50 overflow-hidden shadow-sm">
        <div className="flex items-center p-3">
          <div className="bg-muted/30 w-8 h-8 flex items-center justify-center rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-grow overflow-hidden">
            <h3 className="text-xs text-muted-foreground font-medium">Awaiting Scan</h3>
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
    <div className="bg-card/80 rounded-lg shadow-sm border border-border/50 overflow-hidden" style={{ maxWidth: '100%' }}>
      <div className="flex items-center p-3 border-b border-border/50 bg-gradient-to-r from-muted/50 to-background/80">
        <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${getIconColorClass(result.type)}`}>
          {typeIcon}
        </div>
        <div className="flex-grow overflow-hidden">
          <h3 className="text-xs text-muted-foreground font-medium">
            {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
          </h3>
          <div className="text-foreground text-sm font-medium w-full overflow-x-auto whitespace-nowrap custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
            {result.data.length > 60 ? `${result.data.substring(0, 60)}...` : result.data}
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-3">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-8 bg-muted/20 hover:bg-muted text-foreground"
              onClick={() => action.action(result.data)}
            >
              {action.icon}
              <span className="ml-1.5 text-xs">{action.label}</span>
            </Button>
          ))}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 bg-muted/20 hover:bg-muted text-foreground"
                  onClick={() => copyToClipboard(result.data)}
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs">Copy</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Details Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="text-primary text-xs flex items-center w-full justify-start px-0 hover:bg-transparent hover:text-primary/80"
          onClick={() => setShowDetails(!showDetails)}
        >
          <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
          {showDetails ? (
            <ChevronUp className="h-3.5 w-3.5 ml-1" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 ml-1" />
          )}
        </Button>
        
        {showDetails && (
          <Tabs defaultValue="processed" className="mt-2">
            <TabsList className="mb-2 h-8 bg-muted/30 border border-border/30">
              <TabsTrigger value="processed" onClick={() => setActiveTab('processed')} className="text-xs">Processed</TabsTrigger>
              <TabsTrigger value="raw" onClick={() => setActiveTab('raw')} className="text-xs">Raw Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="processed" className="mt-0">
              <Card className="bg-muted/30 border-border/30 rounded-lg shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  {result.type === 'contact' && (
                    <div className="overflow-hidden">
                      <div className="p-3 border-b border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100/30 p-2 rounded-full">
                            <span className="text-blue-600">👤</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate">
                              {parseVCardName(result.data) || 'Contact'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button 
                                  onClick={() => copyToClipboard(result.data)}
                                  className="text-xs flex items-center gap-1 bg-muted/30 hover:bg-muted p-1.5 rounded-full"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Copy vCard</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          {parseVCardPhone(result.data) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a 
                                    href={`tel:${parseVCardPhone(result.data)}`}
                                    className="text-xs flex items-center gap-1 bg-muted/30 hover:bg-muted p-1.5 rounded-full"
                                  >
                                    <Phone className="h-3.5 w-3.5" />
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p>Call contact</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          
                          {parseVCardEmail(result.data) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a 
                                    href={`mailto:${parseVCardEmail(result.data)}`}
                                    className="text-xs flex items-center gap-1 bg-muted/30 hover:bg-muted p-1.5 rounded-full"
                                  >
                                    <Mail className="h-3.5 w-3.5" />
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p>Email contact</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          
                          <button 
                            onClick={() => saveContact(result.data)}
                            className="text-xs flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-md font-medium transition-colors"
                          >
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-muted/10">
                        <div className="mb-2 flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <div className="text-xs text-muted-foreground">Contact Details</div>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {parseVCardDetails(result.data).map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-muted/20 rounded-md p-2">
                              <div className="flex items-center gap-1.5">
                                {getKeyIcon(item.key)}
                                <span className="text-xs font-medium">{formatVCardKey(item.key)}</span>
                              </div>
                              <div className="text-xs max-w-[65%] truncate">
                                {item.value}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          {parseVCardPhone(result.data) && (
                            <a 
                              href={`tel:${parseVCardPhone(result.data)}`}
                              className="flex-1 py-1.5 bg-muted/20 hover:bg-muted/30 text-center rounded text-sm text-foreground transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              <span>Call</span>
                            </a>
                          )}
                          
                          {parseVCardEmail(result.data) && (
                            <a 
                              href={`mailto:${parseVCardEmail(result.data)}`}
                              className="flex-1 py-1.5 bg-muted/20 hover:bg-muted/30 text-center rounded text-sm text-foreground transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              <span>Email</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {result.type === 'wifi' && (
                    <div className="overflow-hidden">
                      <div className="p-3 border-b border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-muted/30 p-2 rounded-full">
                            <Wifi className="h-4 w-4 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate">
                              {parseWifiDetails(result.data).find(item => item.key === 'SSID')?.value || 'WiFi Network'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button 
                                  onClick={() => copyWifiDetails(result.data, toastUtil)}
                                  className="text-xs flex items-center gap-1 bg-muted/30 hover:bg-muted p-1.5 rounded-full"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Copy details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <button 
                            onClick={() => handleConnectWifi(result.data, toastUtil, setShowPassword)}
                            className="text-xs flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-md font-medium transition-colors"
                          >
                            <Wifi className="h-3.5 w-3.5" />
                            <span>Connect</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Simple WiFi display */}
                      <div className="p-3 bg-muted/10">
                        <div className="mb-2 flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <div className="text-xs text-muted-foreground">WiFi Network</div>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {parseWifiDetails(result.data)
                            .filter(item => item.key !== 'Raw Data')
                            .map((item, index) => (
                              <div key={index} className="flex justify-between items-center bg-muted/20 rounded-md p-2">
                                <div className="flex items-center gap-1.5">
                                  {getWifiKeyIcon(item.key)}
                                  <span className="text-xs font-medium">{item.key}</span>
                                </div>
                                <div>
                                  {item.key === 'Password' ? (
                                    <div className="flex items-center gap-1.5">
                                      <code className="text-xs bg-muted/30 px-1.5 py-0.5 rounded font-mono">
                                        {showPassword ? item.value : '••••••••'}
                                      </code>
                                      <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-muted-foreground hover:text-foreground p-1"
                                      >
                                        {showPassword ? (
                                          <Eye className="h-3 w-3" />
                                        ) : (
                                          <EyeOff className="h-3 w-3" />
                                        )}
                                      </button>
                                    </div>
                                  ) : item.key === 'Authentication' ? (
                                    <Badge variant="outline" className="font-normal text-xs">{item.value}</Badge>
                                  ) : item.key === 'Hidden' ? (
                                    <Badge variant={item.value === 'Yes' ? 'secondary' : 'outline'} className="font-normal text-xs">{item.value}</Badge>
                                  ) : (
                                    <span className="text-xs">{item.value}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>

                        <button 
                          onClick={() => handleConnectWifi(result.data, toastUtil, setShowPassword)}
                          className="w-full py-1.5 bg-muted/20 hover:bg-muted/30 text-center rounded text-sm text-foreground transition-colors flex items-center justify-center gap-2"
                        >
                          <Wifi className="h-3.5 w-3.5" />
                          <span>Connect to Network</span>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {result.type === 'calendar' && (
                    <div className="overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-blue-50/30 to-transparent border-b border-border/30 flex items-center">
                        <div className="bg-blue-100/70 p-3 rounded-full mr-3">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Calendar Event</h3>
                          <p className="text-sm text-muted-foreground">Add this event to your calendar</p>
                        </div>
                      </div>
                      {parseCalendarDetails(result.data).map((item, index) => (
                        <div key={index} className={`flex border-b border-border/20 ${index % 2 === 0 ? 'bg-muted/10' : ''}`}>
                          <div className="px-3 py-2.5 w-1/3 font-medium border-r border-border/20 flex items-center">
                            {getCalendarKeyIcon(item.key)}
                            <span className="ml-1.5">{item.key}</span>
                          </div>
                          <div className="px-3 py-2.5 w-2/3 overflow-x-auto custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
                            {item.key === 'Date' ? (
                              <Badge variant="outline" className="font-normal bg-muted/50">{item.value}</Badge>
                            ) : (
                              item.value
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {result.type === 'url' && (
                    <div className="overflow-hidden">
                      <div className="p-3 border-b border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-muted/30 p-2 rounded-full">
                            <Globe className="h-4 w-4 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate">{getDomainName(result.data)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isSafeUrl(result.data) && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button 
                                      onClick={() => navigator.share?.({ url: result.data, title: "Shared from YOQR" })} 
                                      className="text-xs flex items-center gap-1 bg-muted/30 hover:bg-muted p-1.5 rounded-full"
                                    >
                                      <Share2 className="h-3.5 w-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    <p>Share link</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button 
                                      onClick={() => copyToClipboard(result.data)} 
                                      className="text-xs flex items-center gap-1 bg-muted/30 hover:bg-muted p-1.5 rounded-full"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    <p>Copy link</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <a 
                                href={result.data} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-md font-medium transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>Open</span>
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                     
                      {/* Simple URL display */}
                      <div className="p-3 bg-muted/10">
                        <div className="mb-2 flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <div className="text-xs text-muted-foreground">URL</div>
                          {isSafeUrl(result.data) ? (
                            <Badge variant="outline" className="ml-auto text-[10px] p-0 h-4 px-1.5 text-green-600 bg-green-50/30 hover:bg-green-50/50">
                              Safe
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="ml-auto text-[10px] p-0 h-4 px-1.5 text-red-600 bg-red-50/30 hover:bg-red-50/50">
                              Caution
                            </Badge>
                          )}
                        </div>
                        <div className="font-mono text-xs text-foreground bg-muted/20 rounded-md p-2 break-all overflow-x-auto mb-3">
                          {result.data}
                        </div>
                        {isSafeUrl(result.data) ? (
                          <div className="grid grid-cols-1 gap-2">
                            <a 
                              href={result.data} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full py-1.5 bg-muted/20 hover:bg-muted/30 text-center rounded text-sm text-foreground transition-colors flex items-center justify-center gap-2"
                            >
                              <span>Visit {getDomainName(result.data)}</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        ) : (
                          <div className="bg-red-50/10 border border-red-200/20 rounded p-2 text-xs text-red-600">
                            <div className="flex items-center gap-1.5 mb-1">
                              <AlertCircle className="h-3.5 w-3.5" />
                              <span className="font-medium">Potentially unsafe link</span>
                            </div>
                            <p className="text-muted-foreground text-[11px] ml-5">This URL may not be safe to visit</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {(result.type !== 'contact' && result.type !== 'wifi' && result.type !== 'calendar' && result.type !== 'url') && (
                    <div className="p-3 max-h-60 overflow-y-auto text-xs">
                      <pre className="whitespace-pre-wrap break-all overflow-x-auto custom-scrollbar" style={{ scrollbarWidth: 'thin' }}>
                        {formatDetailsContent(result)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="raw" className="mt-0">
              <Card className="bg-muted/30 border-border/30 rounded-md border">
                <CardContent className="p-2 max-h-60 overflow-y-auto">
                  <div className="font-mono text-xs whitespace-pre-wrap break-all overflow-x-auto custom-scrollbar bg-muted/20 p-2 rounded" style={{ scrollbarWidth: 'thin' }}>
                    {result.data}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

// Interface for toast utility to use outside component
interface ToastUtil {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
}

// Global toast utility reference - will be assigned from within the component
let globalToastUtil: ToastUtil | null = null;

// Save contact to device (using native APIs or download as vCard file)
function saveContact(vCardData: string) {
  // Create a toast function that works whether we have globalToastUtil or not
  const showToast = {
    success: (title: string, description?: string) => {
      if (globalToastUtil) {
        globalToastUtil.success(title, description);
      } else {
        console.log(title, description);
      }
    },
    error: (title: string, description?: string) => {
      if (globalToastUtil) {
        globalToastUtil.error(title, description);
      } else {
        console.error(title, description);
      }
    }
  };
  
  try {
    // Check if Contacts API is available (rarely supported in browsers)
    if ('contacts' in navigator && 'ContactsManager' in window) {
      // Modern Contact API implementation would go here
      // This API has very limited support currently
      showToast.success("Contact ready", "Preparing contact for saving");
    } else {
      // Create a downloadable vCard file
      const blob = new Blob([vCardData], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const name = parseVCardName(vCardData) || 'contact';
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_')}.vcf`;
      a.click();
      
      URL.revokeObjectURL(url);
      showToast.success("Contact downloaded", "Save the file to your contacts");
    }
  } catch (err) {
    console.error('Error saving contact:', err);
    showToast.error("Failed to save contact", "Please try again");
  }
}

// Extract name from vCard
function parseVCardName(vCardData: string): string | null {
  // Try to find the FN (formatted name) field first
  const fnMatch = vCardData.match(/FN[^:]*:([^\r\n]+)/i);
  if (fnMatch && fnMatch[1].trim()) {
    return fnMatch[1].trim();
  }
  
  // Try the N (name) field next
  const nMatch = vCardData.match(/N[^:]*:([^;\r\n]+)/i);
  if (nMatch && nMatch[1].trim()) {
    return nMatch[1].trim();
  }
  
  return null;
}

// Extract phone number from vCard
function parseVCardPhone(vCardData: string): string | null {
  const telMatch = vCardData.match(/TEL[^:]*:([^\r\n]+)/i);
  if (telMatch && telMatch[1].trim()) {
    // Clean up the phone number (remove non-digit characters except +)
    return telMatch[1].trim().replace(/[^\d+]/g, '');
  }
  return null;
}

// Extract email from vCard
function parseVCardEmail(vCardData: string): string | null {
  const emailMatch = vCardData.match(/EMAIL[^:]*:([^\r\n]+)/i);
  if (emailMatch && emailMatch[1].trim()) {
    return emailMatch[1].trim();
  }
  return null;
}

// Parse vCard into structured key-value pairs
function parseVCardDetails(vCardData: string): {key: string, value: string}[] {
  const result: {key: string, value: string}[] = [];
  
  // Match all lines in the format KEY:value
  const lines = vCardData.match(/[^\r\n]+/g) || [];
  
  for (const line of lines) {
    // Skip BEGIN, END, VERSION lines
    if (/^(BEGIN|END|VERSION):/i.test(line)) continue;
    
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      let key = line.substring(0, colonIndex).split(';')[0]; // Take only the main key part
      const value = line.substring(colonIndex + 1).trim();
      
      if (value && key) {
        // Don't add duplicate key types
        if (!result.some(item => item.key.toLowerCase() === key.toLowerCase())) {
          result.push({ key, value });
        }
      }
    }
  }
  
  return result;
}

// Format vCard keys to be more user-friendly
function formatVCardKey(key: string): string {
  const keyMap: {[key: string]: string} = {
    'FN': 'Name',
    'N': 'Name',
    'TEL': 'Phone',
    'EMAIL': 'Email',
    'ADR': 'Address',
    'ORG': 'Company',
    'TITLE': 'Job Title',
    'URL': 'Website',
    'BDAY': 'Birthday',
    'NOTE': 'Notes',
    'PHOTO': 'Photo'
  };
  
  return keyMap[key.toUpperCase()] || key;
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

// Parse WiFi QR code details into structured format
function parseWifiDetails(data: string): {key: string, value: string}[] {
  try {
    const ssid = data.match(/S:([^;]+)/i)?.[1] || 'N/A';
    const auth = data.match(/T:([^;]+)/i)?.[1] || 'N/A';
    const password = data.match(/P:([^;]+)/i)?.[1] || 'N/A';
    const hidden = data.match(/H:([^;]+)/i)?.[1]?.toLowerCase() === 'true' ? 'Yes' : 'No';
    
    return [
      { key: 'SSID', value: ssid },
      { key: 'Authentication', value: auth },
      { key: 'Password', value: password },
      { key: 'Hidden', value: hidden }
    ];
  } catch (e) {
    return [{ key: 'Raw Data', value: data }];
  }
}

// Parse Calendar QR code details into structured format
function parseCalendarDetails(data: string): {key: string, value: string}[] {
  try {
    const result: {key: string, value: string}[] = [];
    
    const summaryMatch = data.match(/SUMMARY:(.*)/i);
    if (summaryMatch) result.push({ key: 'Event', value: summaryMatch[1] });
    
    const startMatch = data.match(/DTSTART:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/i);
    if (startMatch) {
      const [_, year, month, day, hour, minute] = startMatch;
      const date = new Date(parseInt(year), parseInt(month)-1, parseInt(day), parseInt(hour), parseInt(minute));
      result.push({ key: 'Date', value: date.toLocaleString() });
    }
    
    const locationMatch = data.match(/LOCATION:(.*)/i);
    if (locationMatch) result.push({ key: 'Location', value: locationMatch[1] });
    
    const descMatch = data.match(/DESCRIPTION:(.*)/i);
    if (descMatch) result.push({ key: 'Description', value: descMatch[1] });
    
    return result.length ? result : [{ key: 'Raw Data', value: data }];
  } catch (e) {
    return [{ key: 'Raw Data', value: data }];
  }
}

// Parse URL QR code details
function parseUrlDetails(data: string): {url: string} {
  return { url: data };
}

// Check if a URL is potentially safe to visit
function isSafeUrl(url: string): boolean {
  // Basic check for valid URL format
  try {
    const parsedUrl = new URL(url);
    
    // Make sure the protocol is http or https (not javascript: or data: etc)
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }
    
    // Deny known risky file extensions or patterns
    const riskyPatterns = [
      /\.exe$/i,
      /\.msi$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /malware/i,
      /phish/i,
      /hack/i
    ];
    
    if (riskyPatterns.some(pattern => pattern.test(url))) {
      return false;
    }
    
    return true;
  } catch (e) {
    // If URL parsing fails, consider it unsafe
    return false;
  }
}

// Extract just the domain name for display
function getDomainName(url: string): string {
  try {
    const parsedUrl = new URL(url);
    let hostname = parsedUrl.hostname;
    
    // Remove www. prefix if present
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    return hostname;
  } catch (e) {
    return url;
  }
}

// Format URL for display in the address bar
function getDisplayUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    // Return protocol + domain to keep it short
    return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
  } catch (e) {
    return url;
  }
}

// Get a simple description for the website
function getUrlDescription(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    
    // Common sites descriptions
    const knownSites: {[key: string]: string} = {
      'google.com': 'Search the world\'s information',
      'facebook.com': 'Connect with friends and the world',
      'youtube.com': 'Video sharing platform',
      'twitter.com': 'What\'s happening in the world right now',
      'instagram.com': 'Photo and video sharing',
      'linkedin.com': 'Professional networking platform',
      'github.com': 'Where the world builds software',
      'amazon.com': 'Online shopping platform',
      'wikipedia.org': 'The free encyclopedia',
      'reddit.com': 'The front page of the internet'
    };
    
    // Check if the hostname contains any known site
    for (const [site, description] of Object.entries(knownSites)) {
      if (hostname.includes(site)) {
        return description;
      }
    }
    
    // Generic description based on TLD
    const tld = hostname.split('.').pop()?.toLowerCase();
    switch (tld) {
      case 'com': return 'Commercial website';
      case 'org': return 'Organization website';
      case 'edu': return 'Educational institution';
      case 'gov': return 'Government website';
      case 'net': return 'Network organization';
      case 'io': return 'Technology or startup website';
      default: return 'Visit this website for more information';
    }
  } catch (e) {
    return 'Website preview';
  }
}

// Function to handle iframe loading errors
function handleIframeError() {
  console.error('Failed to load iframe content');
  // This function could update state to show an error message
  // We'd need to add state management to implement this fully
}

// Generate a simple favicon based on the first letter of the domain
function getUrlFavicon(url: string): JSX.Element {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    const firstLetter = domain.charAt(0).toUpperCase();
    
    // Get icon for known sites
    const knownSites: {[key: string]: JSX.Element} = {
      'google': <span className="text-xl">G</span>,
      'youtube': <span role="img" aria-label="youtube">▶️</span>,
      'facebook': <span className="text-xl">f</span>,
      'twitter': <span role="img" aria-label="twitter">🐦</span>,
      'instagram': <span role="img" aria-label="instagram">📷</span>,
      'github': <span role="img" aria-label="github">🐙</span>,
      'amazon': <span role="img" aria-label="amazon">📦</span>,
      'netflix': <span className="text-xl text-red-600">N</span>,
      'linkedin': <span className="text-xl text-blue-500">in</span>
    };
    
    // Check if the domain contains any known site
    for (const [site, icon] of Object.entries(knownSites)) {
      if (domain.includes(site)) {
        return (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
            {icon}
          </div>
        );
      }
    }
    
    // Generate background color based on domain
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-amber-100 text-amber-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
    ];
    
    // Use character code to select a color deterministically
    const colorIndex = domain.charCodeAt(0) % colors.length;
    const colorClass = colors[colorIndex];
    
    return (
      <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-xl font-semibold shadow-sm`}>
        {firstLetter}
      </div>
    );
  } catch (e) {
    // Fallback icon
    return <Globe className="w-12 h-12 p-2 bg-muted rounded-full text-muted-foreground" />;
  }
}

// Get icon background color class based on QR type
function getIconColorClass(type: string): string {
  switch(type) {
    case 'url': return 'bg-amber-100/30 text-amber-600';
    case 'wifi': return 'bg-emerald-100/30 text-emerald-600';
    case 'email': return 'bg-purple-100/30 text-purple-600';
    case 'phone': return 'bg-orange-100/30 text-orange-600';
    case 'sms': return 'bg-indigo-100/30 text-indigo-600';
    case 'geo': return 'bg-red-100/30 text-red-600';
    case 'contact': return 'bg-blue-100/30 text-blue-600';
    case 'calendar': return 'bg-cyan-100/30 text-cyan-600';
    default: return 'bg-muted/30 text-foreground';
  }
}

// Get icon for key in details view
function getKeyIcon(key: string) {
  switch(key.toLowerCase()) {
    case 'name': return <span className="h-4 w-4 text-blue-500">👤</span>;
    case 'fn': return <span className="h-4 w-4 text-blue-500">👤</span>; // Full Name
    case 'phone': return <Phone className="h-4 w-4 text-blue-500" />;
    case 'tel': return <Phone className="h-4 w-4 text-blue-500" />;
    case 'email': return <Mail className="h-4 w-4 text-blue-500" />;
    case 'address': return <MapPin className="h-4 w-4 text-blue-500" />;
    case 'adr': return <MapPin className="h-4 w-4 text-blue-500" />;
    case 'company': return <span className="h-4 w-4 text-blue-500">🏢</span>;
    case 'org': return <span className="h-4 w-4 text-blue-500">🏢</span>; // Organization
    case 'title': return <span className="h-4 w-4 text-blue-500">💼</span>;
    case 'url': return <Globe className="h-4 w-4 text-blue-500" />; // Website
    case 'photo': return <Image className="h-4 w-4 text-blue-500" />; // Photo URL
    case 'bday': return <Calendar className="h-4 w-4 text-blue-500" />; // Birthday
    case 'note': return <MessageSquare className="h-4 w-4 text-blue-500" />; // Notes
    default: return <FileText className="h-4 w-4 text-blue-500" />;
  }
}

// Interface for toast utility to use outside component
interface ToastUtil {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
}

// Copy WiFi details to clipboard
function copyWifiDetails(wifiData: string, toastUtil: ToastUtil) {
  try {
    const wifiDetails = parseWifiDetails(wifiData);
    // Format as a readable string
    const formattedText = wifiDetails
      .map(item => `${item.key}: ${item.value}`)
      .join('\n');
    
    navigator.clipboard.writeText(formattedText)
      .then(() => {
        toastUtil.success("WiFi details copied", "Network details copied to clipboard");
      })
      .catch(err => {
        console.error('Clipboard error:', err);
        toastUtil.error("Failed to copy", "Please try again");
      });
  } catch (err) {
    console.error('Error formatting WiFi details:', err);
  }
}

// Handle connecting to WiFi network
function handleConnectWifi(wifiData: string, toastUtil: ToastUtil, setPasswordVisible: (show: boolean) => void) {
  try {
    const ssid = wifiData.match(/S:([^;]+)/i)?.[1] || '';
    const password = wifiData.match(/P:([^;]+)/i)?.[1] || '';
    
    // Check if the Web Network Information API is available (rarely supported)
    if ('networkInformation' in navigator) {
      toastUtil.success("Connection initiated", `Attempting to connect to ${ssid}`);
    } else {
      // Modern browsers don't allow programmatic WiFi connections for security reasons
      // Instead, create a visual guide for the user
      toastUtil.success("Connection details ready", `Open your device's WiFi settings to connect to ${ssid}`);
      
      // Show the password for easy copy-paste
      setPasswordVisible(true);
    }
  } catch (err) {
    console.error('Error connecting to WiFi:', err);
    toastUtil.error("Connection failed", "Could not process WiFi connection details");
  }
}

// Generate WiFi signal strength icon
function getWifiSignalStrengthIcon(): JSX.Element {
  // Randomly select a signal strength for demo purposes
  // In a real app, this could be determined by actual signal strength if available
  const signalStrength = Math.floor(Math.random() * 4); // 0-3
  
  switch(signalStrength) {
    case 3: return <span role="img" aria-label="full signal">📶</span>; // Full
    case 2: return <span role="img" aria-label="good signal">🔌</span>; // Good
    case 1: return <span role="img" aria-label="fair signal">📶</span>; // Fair
    case 0: return <span role="img" aria-label="poor signal">📡</span>; // Poor
    default: return <span role="img" aria-label="unknown signal">📡</span>;
  }
}

// Get icon for WiFi key in details view
function getWifiKeyIcon(key: string) {
  switch(key) {
    case 'SSID': return <span className="h-4 w-4 text-emerald-600">📶</span>;
    case 'Password': return <span className="h-4 w-4 text-emerald-600">🔑</span>;
    case 'Authentication': return <span className="h-4 w-4 text-emerald-600">🔒</span>;
    case 'Hidden': return <span className="h-4 w-4 text-emerald-600">👁️</span>;
    default: return <FileText className="h-4 w-4 text-emerald-600" />;
  }
}

// Get icon for Calendar key in details view
function getCalendarKeyIcon(key: string) {
  switch(key) {
    case 'Event': return <span className="h-4 w-4 text-blue-600">📌</span>;
    case 'Date': return <Calendar className="h-4 w-4 text-blue-600" />;
    case 'Location': return <MapPin className="h-4 w-4 text-blue-600" />;
    case 'Description': return <MessageSquare className="h-4 w-4 text-blue-600" />;
    default: return <FileText className="h-4 w-4 text-blue-600" />;
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