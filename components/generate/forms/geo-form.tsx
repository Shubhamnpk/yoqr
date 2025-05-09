"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface GeoFormProps {
  setContent: (content: string) => void;
}

export default function GeoForm({ setContent }: GeoFormProps) {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  
  // Update the geo content when fields change
  useEffect(() => {
    if (latitude && longitude) {
      const geoString = `geo:${latitude},${longitude}`;
      setContent(geoString);
    }
  }, [latitude, longitude, setContent]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!latitude || !longitude) return;
    
    const geoString = `geo:${latitude},${longitude}`;
    setContent(geoString);
  };
  
  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setUsingCurrentLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          setUsingCurrentLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUsingCurrentLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="latitude">Latitude</Label>
        <Input
          id="latitude"
          type="text"
          placeholder="e.g. 37.7749"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="longitude">Longitude</Label>
        <Input
          id="longitude"
          type="text"
          placeholder="e.g. -122.4194"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          required
        />
      </div>
      
      <Button 
        type="button"
        variant="outline"
        className="w-full"
        onClick={getCurrentLocation}
        disabled={usingCurrentLocation}
      >
        {usingCurrentLocation ? (
          "Getting Location..."
        ) : (
          <>
            <MapPin className="h-4 w-4 mr-2" />
            Use Current Location
          </>
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground">
        Creates a QR code that opens the location in maps when scanned
      </p>
      
      <Button type="submit" className="w-full" disabled={!latitude || !longitude}>
        Generate QR Code
      </Button>
    </form>
  );
}