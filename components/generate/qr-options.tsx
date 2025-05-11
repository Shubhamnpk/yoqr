"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Settings, Sliders, Palette, Shield, Grid, Image, X, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { QRGenerateOptions } from '@/types/qr-types';

interface QRCodeOptionsProps {
  options: QRGenerateOptions;
  onChange: (options: Partial<QRGenerateOptions>) => void;
  enabled?: boolean; // Optional flag to enable/disable the entire component
  onToggle?: (enabled: boolean) => void; // Callback when the component is toggled
}

export default function QRCodeOptions({ options, onChange, enabled = true, onToggle }: QRCodeOptionsProps) {
  // Component is hidden by default and positioned at the bottom with full width
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  const [logoPreview, setLogoPreview] = useState<string | null>(options.imageSettings?.src || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file upload for logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageSrc = event.target?.result as string;
        setLogoPreview(imageSrc);
        // Update options with the new logo
        onChange({
          imageSettings: {
            src: imageSrc,
            height: 30, // Default to 15% of QR code size
            width: 30,
            excavate: true,
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    onChange({ imageSettings: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // If component is disabled, return minimized version with just enable toggle
  if (!enabled) {
    return (
      <Card className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Enable Customization</span>
          </div>
          <Switch
            checked={false}
            onCheckedChange={() => onToggle?.(true)}
            className="data-[state=checked]:bg-blue-500"
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl overflow-hidden w-full mt-auto fixed bottom-0 left-0 right-0 z-10">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
      <CardHeader className="pb-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary" />
              <CardTitle className="text-xl font-bold">Customization</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {onToggle && (
                <Switch
                  checked={enabled}
                  onCheckedChange={onToggle}
                  className="data-[state=checked]:bg-blue-500 mr-2"
                />
              )}
              <Badge variant="outline" className="bg-primary/10 text-primary px-3 py-1 text-xs">
                {options.size}px
              </Badge>
              <CollapsibleTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground bg-background/50 rounded-full p-1 transition-colors">
                  {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent className="pt-4">
            <CardContent className="pt-2 px-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-lg"></div>
                  <TabsList className="grid grid-cols-4 bg-background/80 backdrop-blur-sm p-1.5 rounded-xl w-full relative z-10 border border-white/20 shadow-lg">
                    <TabsTrigger 
                      value="appearance" 
                      className="flex items-center justify-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      Appearance
                    </TabsTrigger>
                    <TabsTrigger 
                      value="size" 
                      className="flex items-center justify-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                    >
                      <Sliders className="h-4 w-4 mr-2" />
                      Size
                    </TabsTrigger>
                    <TabsTrigger 
                      value="advanced" 
                      className="flex items-center justify-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Advanced
                    </TabsTrigger>
                    <TabsTrigger 
                      value="logo" 
                      className="flex items-center justify-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Logo
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30">
                  <TabsContent value="appearance" className="space-y-6 mt-0">
                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="fg-color" className="flex items-center text-sm font-medium">
                          <div 
                            className="w-5 h-5 rounded-full mr-2 border border-border/50 shadow-inner" 
                            style={{ backgroundColor: options.foregroundColor }}
                          />
                          <span>Foreground Color</span>
                        </Label>
                        <div className="relative group overflow-hidden rounded-lg shadow-sm border border-border/30 transition-all hover:shadow-md">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Input
                            id="fg-color"
                            type="color"
                            value={options.foregroundColor}
                            onChange={(e) => onChange({ foregroundColor: e.target.value })}
                            className="w-full h-12 cursor-pointer border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="bg-color" className="flex items-center text-sm font-medium">
                          <div 
                            className="w-5 h-5 rounded-full mr-2 border border-border/50 shadow-inner" 
                            style={{ backgroundColor: options.backgroundColor }}
                          />
                          <span>Background Color</span>
                        </Label>
                        <div className="relative group overflow-hidden rounded-lg shadow-sm border border-border/30 transition-all hover:shadow-md">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <Input
                            id="bg-color"
                            type="color"
                            value={options.backgroundColor}
                            onChange={(e) => onChange({ backgroundColor: e.target.value })}
                            className="w-full h-12 cursor-pointer border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Color presets */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Color Presets</Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { fg: '#000000', bg: '#FFFFFF', name: 'Classic' },
                          { fg: '#0066CC', bg: '#FFFFFF', name: 'Blue' },
                          { fg: '#4CAF50', bg: '#FFFFFF', name: 'Green' },
                          { fg: '#9C27B0', bg: '#FFFFFF', name: 'Purple' },
                          { fg: '#FFFFFF', bg: '#000000', name: 'Inverted' },
                        ].map((preset, index) => (
                          <button
                            key={index}
                            className="w-10 h-10 rounded-lg border border-border/50 overflow-hidden relative transition-all hover:scale-110"
                            onClick={() => onChange({ foregroundColor: preset.fg, backgroundColor: preset.bg })}
                            title={preset.name}
                          >
                            <div className="absolute inset-0" style={{ backgroundColor: preset.bg }}></div>
                            <div className="absolute inset-2 rounded-md" style={{ backgroundColor: preset.fg }}></div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="size" className="space-y-6 mt-0">
                    {/* Size */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="size-slider" className="flex items-center text-sm font-medium">
                          <Grid className="h-4 w-4 mr-2" />
                          QR Code Size
                        </Label>
                        <span className="text-sm font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
                          {options.size}px
                        </span>
                      </div>
                      <div className="px-1">
                        <Slider
                          id="size-slider"
                          min={100}
                          max={500}
                          step={10}
                          value={[options.size]}
                          onValueChange={(value) => onChange({ size: value[0] })}
                          className="h-2"
                        />
                      </div>
                    </div>
                    
                    {/* Size presets */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center">
                        <Grid className="h-4 w-4 mr-2 text-blue-500" />
                        Size Presets
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {[100, 200, 300, 400, 500].map((size) => (
                          <button
                            key={size}
                            className={`px-4 py-2 rounded-lg border transition-all duration-200 ${options.size === size 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-md' 
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm'}`}
                            onClick={() => onChange({ size })}
                          >
                            {size}px
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Include Margin */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                      <Label htmlFor="include-margin" className="flex items-center text-sm font-medium cursor-pointer">
                        <div className="bg-blue-500/10 p-2 rounded-lg mr-3">
                          <Grid className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <span className="block">Include Quiet Zone</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Adds margin around the QR code</span>
                        </div>
                      </Label>
                      <Switch
                        id="include-margin"
                        checked={options.includeMargin}
                        onCheckedChange={(checked) => onChange({ includeMargin: checked })}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-6 mt-0">
                    {/* Error Correction Level */}
                    <div className="space-y-2">
                      <Label htmlFor="error-level" className="flex items-center text-sm font-medium">
                        <Shield className="h-4 w-4 mr-2" />
                        Error Correction Level
                      </Label>
                      <Select
                        value={options.errorCorrectionLevel}
                        onValueChange={(value) => onChange({ errorCorrectionLevel: value as 'L' | 'M' | 'Q' | 'H' })}
                      >
                        <SelectTrigger id="error-level" className="bg-background/50">
                          <SelectValue placeholder="Select error correction level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Low (7% - Smaller QR)</SelectItem>
                          <SelectItem value="M">Medium (15% - Default)</SelectItem>
                          <SelectItem value="Q">Quartile (25% - Better Scan)</SelectItem>
                          <SelectItem value="H">High (30% - Best Scan)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Higher correction levels make the QR code more reliable but larger.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Error Correction Explained
                      </h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Error correction allows a QR code to be read even when partially damaged or obscured.
                        Higher levels provide more redundancy but create larger codes.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Logo Tab Content */}
                  <TabsContent value="logo" className="space-y-6 mt-0">
                    <div className="space-y-4">
                      {/* Logo upload section */}
                      <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-sm font-medium flex items-center">
                            <Image className="h-4 w-4 mr-2 text-blue-500" />
                            Add Logo or Image
                          </Label>
                          <div className="flex items-center">
                            <Switch
                              checked={!!logoPreview}
                              onCheckedChange={(checked) => {
                                if (!checked) {
                                  handleRemoveLogo();
                                } else if (fileInputRef.current) {
                                  fileInputRef.current.click();
                                }
                              }}
                              className="data-[state=checked]:bg-blue-500"
                            />
                          </div>
                        </div>
                        
                        {/* Logo preview */}
                        {logoPreview ? (
                          <div className="relative bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2 h-32 flex items-center justify-center">
                            <img 
                              src={logoPreview} 
                              alt="Logo preview" 
                              className="max-h-full max-w-full object-contain" 
                            />
                            <button 
                              onClick={handleRemoveLogo}
                              className="absolute top-2 right-2 bg-red-500/90 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              aria-label="Remove logo"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4 flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-8 w-8 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                              Click to upload a logo or image for your QR code
                            </p>
                          </div>
                        )}
                        
                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                      
                      {/* Logo size control */}
                      {logoPreview && (
                        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4 space-y-3">
                          <Label className="text-sm font-medium">Logo Size (%)</Label>
                          <Slider
                            defaultValue={[10]}
                            min={5}
                            max={30}
                            step={1}
                            value={[options.imageSettings?.height || 10]}
                            onValueChange={([size]) => {
                              if (options.imageSettings) {
                                onChange({
                                  imageSettings: {
                                    ...options.imageSettings,
                                    height: size,
                                    width: size
                                  }
                                });
                              }
                            }}
                            className="my-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>5%</span>
                            <span>30%</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Logo excavate option (clear background) */}
                      {logoPreview && (
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                          <Label htmlFor="excavate-option" className="flex items-center text-sm font-medium cursor-pointer">
                            <div className="bg-blue-500/10 p-2 rounded-lg mr-3">
                              <Grid className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                              <span className="block">Clear Background</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">Makes QR code visible behind logo</span>
                            </div>
                          </Label>
                          <Switch
                            id="excavate-option"
                            checked={options.imageSettings?.excavate ?? true}
                            onCheckedChange={(checked) => {
                              if (options.imageSettings) {
                                onChange({
                                  imageSettings: {
                                    ...options.imageSettings,
                                    excavate: checked
                                  }
                                });
                              }
                            }}
                            className="data-[state=checked]:bg-blue-500"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Logo tip */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Logo Usage Tips
                      </h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Adding a logo may reduce QR code readability. Use higher error correction and test your QR code with different scanners.
                      </p>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
}