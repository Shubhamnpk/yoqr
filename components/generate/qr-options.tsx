"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Settings, Sliders, Palette, Shield, Grid, Image, X, Upload, Sparkles, Layers, Download, Save, RotateCcw } from 'lucide-react';
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
  // Component starts minimized on desktop, expanded on mobile
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  const [logoPreview, setLogoPreview] = useState<string | null>(options.imageSettings?.src || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<string>('');
  const [multipleLogos, setMultipleLogos] = useState(options.logos || []);
  const multipleLogoRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load saved templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('qr-templates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  }, []);
  
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
    <Card className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl overflow-hidden w-full xl:relative xl:bottom-auto xl:left-auto xl:right-auto xl:z-auto xl:mt-0 fixed bottom-0 left-0 right-0 z-10 xl:static max-h-[80vh] xl:max-h-none overflow-y-auto">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 xl:hidden"></div>
      <CardHeader className={`pb-2 ${!isOpen ? 'pb-3' : ''}`}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-4 w-4 xl:h-5 xl:w-5 mr-2 text-primary" />
              <CardTitle className={`text-lg xl:text-xl font-bold ${!isOpen ? 'hidden xl:inline' : ''}`}>Customization</CardTitle>
              {!isOpen && (
                <div className="xl:hidden flex items-center space-x-2 ml-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary px-2 py-0.5 text-xs">
                    {options.size}px
                  </Badge>
                  <span className="text-xs text-muted-foreground">Tap to customize</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {onToggle && (
                <Switch
                  checked={enabled}
                  onCheckedChange={onToggle}
                  className="data-[state=checked]:bg-blue-500 mr-2 scale-75 xl:scale-100"
                />
              )}
              {!isOpen && (
                <div className="hidden xl:flex items-center space-x-1">
                  <Badge variant="outline" className="bg-primary/10 text-primary px-2 py-0.5 text-xs">
                    {options.size}px
                  </Badge>
                  {options.gradient?.enabled && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 px-2 py-0.5 text-xs">
                      Gradient
                    </Badge>
                  )}
                  {options.pattern && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 px-2 py-0.5 text-xs">
                      Pattern
                    </Badge>
                  )}
                </div>
              )}
              <CollapsibleTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground bg-background/50 rounded-full p-1 transition-colors">
                  {isOpen ? <ChevronUp className="h-4 w-4 xl:h-5 xl:w-5" /> : <ChevronDown className="h-4 w-4 xl:h-5 xl:w-5" />}
                </button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent className="pt-4">
            <CardContent className="pt-2 px-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-lg"></div>
                  <TabsList className="flex overflow-x-auto scrollbar-hide bg-background/80 backdrop-blur-sm p-1.5 rounded-xl w-full relative z-10 border border-white/20 shadow-lg gap-1">
                    <TabsTrigger
                      value="appearance"
                      className="flex items-center justify-center flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-xs sm:text-sm px-3 py-2"
                    >
                      <Palette className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="whitespace-nowrap">Appearance</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="styles"
                      className="flex items-center justify-center flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-xs sm:text-sm px-3 py-2"
                    >
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="whitespace-nowrap">Styles</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="size"
                      className="flex items-center justify-center flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-xs sm:text-sm px-3 py-2"
                    >
                      <Sliders className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="whitespace-nowrap">Size</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="effects"
                      className="flex items-center justify-center flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-xs sm:text-sm px-3 py-2"
                    >
                      <Layers className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="whitespace-nowrap">Effects</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="advanced"
                      className="flex items-center justify-center flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-xs sm:text-sm px-3 py-2"
                    >
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="whitespace-nowrap">Advanced</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="logo"
                      className="flex items-center justify-center flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-xs sm:text-sm px-3 py-2"
                    >
                      <Image className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="whitespace-nowrap">Logo</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="export"
                      className="flex items-center justify-center flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-xs sm:text-sm px-3 py-2"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="whitespace-nowrap">Export</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 dark:border-gray-700/30">
                  <TabsContent value="appearance" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center">
                          <div className="w-3 h-3 rounded mr-2 border" style={{ backgroundColor: options.foregroundColor }} />
                          Foreground
                        </Label>
                        <Input
                          type="color"
                          value={options.foregroundColor}
                          onChange={(e) => onChange({ foregroundColor: e.target.value })}
                          className="w-full h-8 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs flex items-center">
                          <div className="w-3 h-3 rounded mr-2 border" style={{ backgroundColor: options.backgroundColor }} />
                          Background
                        </Label>
                        <Input
                          type="color"
                          value={options.backgroundColor}
                          onChange={(e) => onChange({ backgroundColor: e.target.value })}
                          className="w-full h-8 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Presets</Label>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { fg: '#000000', bg: '#FFFFFF', name: 'Classic' },
                          { fg: '#0066CC', bg: '#FFFFFF', name: 'Blue' },
                          { fg: '#4CAF50', bg: '#FFFFFF', name: 'Green' },
                          { fg: '#9C27B0', bg: '#FFFFFF', name: 'Purple' },
                          { fg: '#FFFFFF', bg: '#000000', name: 'Invert' },
                        ].map((preset, index) => (
                          <button
                            key={index}
                            className="w-8 h-8 rounded border overflow-hidden hover:scale-110 transition-all"
                            onClick={() => onChange({ foregroundColor: preset.fg, backgroundColor: preset.bg })}
                            title={preset.name}
                          >
                            <div className="w-full h-full flex">
                              <div className="w-1/2" style={{ backgroundColor: preset.fg }} />
                              <div className="w-1/2" style={{ backgroundColor: preset.bg }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="styles" className="space-y-4 mt-0">
                    <div className="space-y-3">
                      <Label className="text-xs flex items-center">
                        <Sparkles className="h-3 w-3 mr-2 text-purple-500" />
                        Container Style
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { value: 'square', label: 'Square', desc: 'Sharp corners' },
                          { value: 'rounded', label: 'Rounded', desc: 'Soft corners' },
                          { value: 'circle', label: 'Circle', desc: 'Fully rounded' }
                        ].map((style) => (
                          <button
                            key={style.value}
                            className={`p-3 rounded-lg border text-xs transition-all ${
                              options.containerStyle === style.value
                                ? 'bg-purple-500 text-white border-purple-500'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                            }`}
                            onClick={() => onChange({ containerStyle: style.value as 'square' | 'rounded' | 'circle' })}
                          >
                            <div className="font-medium">{style.label}</div>
                            <div className="text-xs opacity-75">{style.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs flex items-center">
                        <Grid className="h-3 w-3 mr-2 text-purple-500" />
                        Border & Shadow
                      </Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Border Width</Label>
                          <span className="text-xs bg-purple-500/10 text-purple-600 px-2 py-1 rounded">
                            {options.borderWidth || 0}px
                          </span>
                        </div>
                        <Slider
                          min={0}
                          max={10}
                          step={1}
                          value={[options.borderWidth || 0]}
                          onValueChange={(value) => onChange({ borderWidth: value[0] })}
                          className="h-1.5"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Drop Shadow</Label>
                        <Switch
                          checked={options.shadow || false}
                          onCheckedChange={(checked) => onChange({ shadow: checked })}
                          className="data-[state=checked]:bg-purple-500 scale-75"
                        />
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

                  <TabsContent value="effects" className="space-y-4 mt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs flex items-center">
                          <Layers className="h-3 w-3 mr-2 text-green-500" />
                          Gradient
                        </Label>
                        <Switch
                          checked={options.gradient?.enabled || false}
                          onCheckedChange={(checked) => onChange({
                            gradient: {
                              enabled: checked,
                              startColor: options.foregroundColor,
                              endColor: options.backgroundColor,
                              type: 'linear',
                              direction: 'diagonal'
                            }
                          })}
                          className="data-[state=checked]:bg-green-500 scale-75"
                        />
                      </div>

                      {options.gradient?.enabled && (
                        <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Start</Label>
                              <Input
                                type="color"
                                value={options.gradient.startColor}
                                onChange={(e) => onChange({
                                  gradient: { ...options.gradient!, startColor: e.target.value }
                                })}
                                className="w-full h-6"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">End</Label>
                              <Input
                                type="color"
                                value={options.gradient.endColor}
                                onChange={(e) => onChange({
                                  gradient: { ...options.gradient!, endColor: e.target.value }
                                })}
                                className="w-full h-6"
                              />
                            </div>
                          </div>
                          <Select
                            value={options.gradient.type}
                            onValueChange={(value) => onChange({
                              gradient: { ...options.gradient!, type: value as 'linear' | 'radial' }
                            })}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="linear">Linear</SelectItem>
                              <SelectItem value="radial">Radial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs flex items-center">
                        <Grid className="h-3 w-3 mr-2 text-green-500" />
                        Patterns
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                        {[
                          { name: 'None', pattern: null },
                          { name: 'Dots', pattern: 'dots' },
                          { name: 'Grid', pattern: 'grid' },
                          { name: 'Diag', pattern: 'diagonal' },
                          { name: 'Check', pattern: 'checker' },
                          { name: 'Stripes', pattern: 'stripes' }
                        ].map((pattern) => (
                          <button
                            key={pattern.name}
                            className={`p-2 rounded text-xs transition-all ${
                              !options.pattern || options.pattern === pattern.pattern
                                ? 'bg-green-500 text-white'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-green-300'
                            }`}
                            onClick={() => onChange({ pattern: pattern.pattern })}
                          >
                            {pattern.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs flex items-center">
                        <Sparkles className="h-3 w-3 mr-2 text-green-500" />
                        Effects
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {[
                          { name: 'None', effect: null },
                          { name: 'Pulse', effect: 'pulse' },
                          { name: 'Glow', effect: 'glow' },
                          { name: 'Scan', effect: 'scan' }
                        ].map((effect) => (
                          <button
                            key={effect.name}
                            className={`p-2 rounded text-xs transition-all ${
                              !options.animation || options.animation === effect.effect
                                ? 'bg-green-500 text-white'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-green-300'
                            }`}
                            onClick={() => onChange({ animation: effect.effect })}
                          >
                            {effect.name}
                          </button>
                        ))}
                      </div>
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

                  <TabsContent value="logo" className="space-y-4 mt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs flex items-center">
                          <Layers className="h-3 w-3 mr-2 text-blue-500" />
                          Logos ({multipleLogos.length}/4)
                        </Label>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (multipleLogos.length < 4) {
                              const newRef = multipleLogoRefs.current[multipleLogos.length];
                              newRef?.click();
                            }
                          }}
                          disabled={multipleLogos.length >= 4}
                          className="h-6 px-2 text-xs bg-blue-500 hover:bg-blue-600"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {multipleLogos.map((logo, index) => (
                          <div key={index} className="relative bg-slate-100 dark:bg-slate-800/50 rounded p-1">
                            <img
                              src={logo.src}
                              alt={`Logo ${index + 1}`}
                              className="w-full h-12 object-contain rounded"
                            />
                            <div className="absolute -top-1 -right-1 flex gap-0.5">
                              <Select
                                value={logo.position}
                                onValueChange={(position) => {
                                  const updated = [...multipleLogos];
                                  updated[index].position = position as any;
                                  setMultipleLogos(updated);
                                  onChange({ logos: updated });
                                }}
                              >
                                <SelectTrigger className="h-4 w-4 p-0 bg-white dark:bg-slate-700 text-xs">
                                  <span className="text-xs">📍</span>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="center">C</SelectItem>
                                  <SelectItem value="top-left">TL</SelectItem>
                                  <SelectItem value="top-right">TR</SelectItem>
                                  <SelectItem value="bottom-left">BL</SelectItem>
                                  <SelectItem value="bottom-right">BR</SelectItem>
                                </SelectContent>
                              </Select>
                              <button
                                onClick={() => {
                                  const updated = multipleLogos.filter((_, i) => i !== index);
                                  setMultipleLogos(updated);
                                  onChange({ logos: updated });
                                }}
                                className="bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 text-xs"
                              >
                                <X className="h-2 w-2" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {Array.from({ length: Math.max(0, 4 - multipleLogos.length) }).map((_, index) => (
                          <div
                            key={`empty-${index}`}
                            className="bg-slate-100 dark:bg-slate-800/50 rounded p-3 flex flex-col items-center justify-center h-14 border border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/50"
                            onClick={() => {
                              const refIndex = multipleLogos.length + index;
                              multipleLogoRefs.current[refIndex]?.click();
                            }}
                          >
                            <Upload className="h-4 w-4 text-slate-400" />
                          </div>
                        ))}
                      </div>

                      {Array.from({ length: 4 }).map((_, index) => (
                        <input
                          key={index}
                          type="file"
                          ref={(el) => (multipleLogoRefs.current[index] = el)}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const imageSrc = event.target?.result as string;
                                const newLogo = {
                                  src: imageSrc,
                                  position: 'center' as const,
                                  size: 15
                                };
                                const updated = [...multipleLogos, newLogo];
                                setMultipleLogos(updated);
                                onChange({ logos: updated });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          accept="image/*"
                          className="hidden"
                        />
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs flex items-center">
                          <Image className="h-3 w-3 mr-2 text-blue-500" />
                          Center Logo
                        </Label>
                        <Switch
                          checked={!!logoPreview}
                          onCheckedChange={(checked) => {
                            if (!checked) {
                              handleRemoveLogo();
                            } else if (fileInputRef.current) {
                              fileInputRef.current.click();
                            }
                          }}
                          className="data-[state=checked]:bg-blue-500 scale-75"
                        />
                      </div>

                      {logoPreview ? (
                        <div className="relative bg-slate-100 dark:bg-slate-800/50 rounded p-1">
                          <img
                            src={logoPreview}
                            alt="Center logo"
                            className="w-full h-16 object-contain rounded"
                          />
                          <button
                            onClick={handleRemoveLogo}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="bg-slate-100 dark:bg-slate-800/50 rounded p-2 flex items-center justify-center h-16 border border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/50"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 text-slate-400" />
                        </div>
                      )}

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="export" className="space-y-4 mt-0">
                    <div className="space-y-3">
                      <Label className="text-xs flex items-center">
                        <Save className="h-3 w-3 mr-2 text-blue-500" />
                        Templates
                      </Label>
                      <div className="flex gap-1">
                        <Input
                          placeholder="Template name"
                          value={currentTemplate}
                          onChange={(e) => setCurrentTemplate(e.target.value)}
                          className="flex-1 h-7 text-xs"
                        />
                        <Button
                          onClick={() => {
                            if (currentTemplate.trim()) {
                              const template = {
                                name: currentTemplate,
                                options: { ...options },
                                timestamp: Date.now()
                              };
                              const updated = [...savedTemplates, template];
                              setSavedTemplates(updated);
                              localStorage.setItem('qr-templates', JSON.stringify(updated));
                              setCurrentTemplate('');
                            }
                          }}
                          className="h-7 px-2 text-xs bg-blue-500 hover:bg-blue-600"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                      </div>

                      {savedTemplates.length > 0 && (
                        <div className="space-y-1 max-h-20 overflow-y-auto">
                          {savedTemplates.slice(0, 3).map((template, index) => (
                            <div key={index} className="flex items-center justify-between p-1 bg-muted/30 rounded text-xs">
                              <span className="truncate flex-1">{template.name}</span>
                              <div className="flex gap-0.5">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onChange(template.options)}
                                  className="h-5 px-1 text-xs"
                                >
                                  Load
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const updated = savedTemplates.filter((_, i) => i !== index);
                                    setSavedTemplates(updated);
                                    localStorage.setItem('qr-templates', JSON.stringify(updated));
                                  }}
                                  className="h-5 px-1 text-xs text-red-500 hover:text-red-600"
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs flex items-center">
                        <Download className="h-3 w-3 mr-2 text-blue-500" />
                        Export
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                        {[
                          { format: 'PNG', icon: '🖼️' },
                          { format: 'SVG', icon: '📐' },
                          { format: 'JPEG', icon: '📷' },
                          { format: 'PDF', icon: '📄' }
                        ].map((exportOption) => (
                          <button
                            key={exportOption.format}
                            className="p-2 rounded border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 text-xs transition-all"
                          >
                            <div className="text-sm mb-0.5">{exportOption.icon}</div>
                            <div className="text-xs">{exportOption.format}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs flex items-center">
                        <Layers className="h-3 w-3 mr-2 text-blue-500" />
                        Batch
                      </Label>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 space-y-2">
                        <Textarea
                          placeholder="One URL per line..."
                          className="min-h-[60px] resize-none text-xs"
                        />
                        <div className="flex justify-between items-center">
                          <Select defaultValue="png">
                            <SelectTrigger className="h-6 w-20 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="png">PNG</SelectItem>
                              <SelectItem value="svg">SVG</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button className="h-6 px-2 text-xs bg-blue-500 hover:bg-blue-600">
                            Generate
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        onChange({
                          size: 200,
                          backgroundColor: '#ffffff',
                          foregroundColor: '#000000',
                          includeMargin: true,
                          errorCorrectionLevel: 'M',
                          imageSettings: null,
                          containerStyle: 'square',
                          borderWidth: 0,
                          shadow: false,
                          gradient: { enabled: false, startColor: '#000000', endColor: '#ffffff', type: 'linear' },
                          pattern: null,
                          animation: null
                        });
                      }}
                      className="w-full h-7 text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
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