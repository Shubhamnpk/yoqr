"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';

interface WifiFormProps {
  setContent: (content: string) => void;
}

export default function WifiForm({ setContent }: WifiFormProps) {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [authType, setAuthType] = useState('WPA');
  const [hidden, setHidden] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Create WiFi string format: WIFI:T:{type};S:{ssid};P:{password};H:{hidden};;
  useEffect(() => {
    if (ssid) {
      const wifiString = `WIFI:T:${authType};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
      setContent(wifiString);
    }
  }, [ssid, password, authType, hidden, setContent]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssid) return;
    
    const wifiString = `WIFI:T:${authType};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
    setContent(wifiString);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ssid">Network Name (SSID)</Label>
        <Input
          id="ssid"
          placeholder="Your WiFi network name"
          value={ssid}
          onChange={(e) => setSsid(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="auth-type">Authentication Type</Label>
        <Select value={authType} onValueChange={setAuthType}>
          <SelectTrigger id="auth-type">
            <SelectValue placeholder="Select authentication type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WPA">WPA/WPA2/WPA3</SelectItem>
            <SelectItem value="WEP">WEP</SelectItem>
            <SelectItem value="nopass">No Password</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {authType !== 'nopass' && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="WiFi password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Switch
          id="hidden-network"
          checked={hidden}
          onCheckedChange={setHidden}
        />
        <Label htmlFor="hidden-network">Hidden Network</Label>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Creates a QR code that automatically connects to WiFi when scanned
      </p>
      
      <Button type="submit" className="w-full" disabled={!ssid}>
        Generate QR Code
      </Button>
    </form>
  );
}