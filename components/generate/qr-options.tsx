"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Settings, Sliders, Palette, Shield, Grid } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { QRGenerateOptions } from '@/types/qr-types';

interface QRCodeOptionsProps {
  options: QRGenerateOptions;
  onChange: (options: Partial<QRGenerateOptions>) => void;
}

export default function QRCodeOptions({ options, onChange }: QRCodeOptionsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('appearance');
  
  return (
    <Card className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
      <CardHeader className="pb-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary" />
              <CardTitle className="text-xl font-bold">Customization</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
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
                <TabsList className="grid grid-cols-3 mb-4 bg-background/50 p-1 rounded-xl w-full">
                  <TabsTrigger 
                    value="appearance" 
                    className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Appearance
                  </TabsTrigger>
                  <TabsTrigger 
                    value="size" 
                    className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    <Sliders className="h-4 w-4 mr-2" />
                    Size
                  </TabsTrigger>
                  <TabsTrigger 
                    value="advanced" 
                    className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Advanced
                  </TabsTrigger>
                </TabsList>
                
                <div className="bg-white dark:bg-gray-800/50 rounded-xl p-5 shadow-inner border border-border/20">
                  <TabsContent value="appearance" className="space-y-6 mt-0">
                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fg-color" className="flex items-center text-sm font-medium">
                          <div 
                            className="w-4 h-4 rounded-full border border-border mr-2" 
                            style={{ backgroundColor: options.foregroundColor }}
                          />
                          Foreground Color
                        </Label>
                        <div className="relative group">
                          <Input
                            id="fg-color"
                            type="color"
                            value={options.foregroundColor}
                            onChange={(e) => onChange({ foregroundColor: e.target.value })}
                            className="w-full h-10 cursor-pointer rounded-lg border-border/50 transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                          />
                          <div className="absolute inset-0 pointer-events-none rounded-lg border border-border/0 group-hover:border-primary/20 transition-all duration-300"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bg-color" className="flex items-center text-sm font-medium">
                          <div 
                            className="w-4 h-4 rounded-full border border-border mr-2" 
                            style={{ backgroundColor: options.backgroundColor }}
                          />
                          Background Color
                        </Label>
                        <div className="relative group">
                          <Input
                            id="bg-color"
                            type="color"
                            value={options.backgroundColor}
                            onChange={(e) => onChange({ backgroundColor: e.target.value })}
                            className="w-full h-10 cursor-pointer rounded-lg border-border/50 transition-all duration-300 focus:ring-2 focus:ring-primary/30"
                          />
                          <div className="absolute inset-0 pointer-events-none rounded-lg border border-border/0 group-hover:border-primary/20 transition-all duration-300"></div>
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
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {options.size}px
                        </Badge>
                      </div>
                      <Slider
                        id="size-slider"
                        min={100}
                        max={500}
                        step={10}
                        value={[options.size]}
                        onValueChange={(value) => onChange({ size: value[0] })}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Small</span>
                        <span>Medium</span>
                        <span>Large</span>
                      </div>
                    </div>
                    
                    {/* Size presets */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Size Presets</Label>
                      <div className="flex flex-wrap gap-2">
                        {[100, 200, 300, 400, 500].map((size) => (
                          <button
                            key={size}
                            className={`px-3 py-1 rounded-lg border transition-all ${options.size === size ? 'bg-primary text-white border-primary' : 'border-border/50 hover:border-primary/50'}`}
                            onClick={() => onChange({ size })}
                          >
                            {size}px
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Include Margin */}
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <Label htmlFor="include-margin" className="flex items-center text-sm font-medium cursor-pointer">
                        <Grid className="h-4 w-4 mr-2 text-muted-foreground" />
                        Include Quiet Zone (Margin)
                      </Label>
                      <Switch
                        id="include-margin"
                        checked={options.includeMargin}
                        onCheckedChange={(checked) => onChange({ includeMargin: checked })}
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
                </div>
              </Tabs>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
}