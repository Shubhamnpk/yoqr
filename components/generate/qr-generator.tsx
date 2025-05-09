"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { QRContentType } from '@/types/qr-types';
import { Badge } from '@/components/ui/badge';
import { Link, QrCode, Wifi, User, Mail, Phone, MessageSquare, MapPin } from 'lucide-react';
import URLForm from '@/components/generate/forms/url-form';
import WifiForm from '@/components/generate/forms/wifi-form';
import ContactForm from '@/components/generate/forms/contact-form';
import TextForm from '@/components/generate/forms/text-form';
import EmailForm from '@/components/generate/forms/email-form';
import PhoneForm from '@/components/generate/forms/phone-form';
import SMSForm from '@/components/generate/forms/sms-form';
import GeoForm from '@/components/generate/forms/geo-form';

interface QRGeneratorProps {
  content: string;
  setContent: (content: string) => void;
  contentType: QRContentType;
  setContentType: (type: QRContentType) => void;
}

export default function QRCodeGenerator({
  content,
  setContent,
  contentType,
  setContentType
}: QRGeneratorProps) {
  // When content type changes, reset content
  useEffect(() => {
    setContent('');
  }, [contentType, setContent]);

  // Define tab icons and colors
  const tabConfig = {
    url: { icon: <Link className="h-4 w-4 mr-2" />, color: 'hsl(220, 100%, 60%)' },
    text: { icon: <QrCode className="h-4 w-4 mr-2" />, color: 'hsl(260, 100%, 60%)' },
    wifi: { icon: <Wifi className="h-4 w-4 mr-2" />, color: 'hsl(140, 100%, 40%)' },
    contact: { icon: <User className="h-4 w-4 mr-2" />, color: 'hsl(200, 100%, 50%)' },
    email: { icon: <Mail className="h-4 w-4 mr-2" />, color: 'hsl(330, 100%, 60%)' },
    phone: { icon: <Phone className="h-4 w-4 mr-2" />, color: 'hsl(30, 100%, 50%)' },
    sms: { icon: <MessageSquare className="h-4 w-4 mr-2" />, color: 'hsl(280, 100%, 60%)' },
    geo: { icon: <MapPin className="h-4 w-4 mr-2" />, color: 'hsl(0, 100%, 60%)' },
  };
  
  return (
    <Card className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">Create QR Code</CardTitle>
            <CardDescription>Select content type and enter the information</CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className="bg-primary/10 text-primary px-3 py-1 text-xs"
            style={{ color: tabConfig[contentType]?.color }}
          >
            {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="url" value={contentType} onValueChange={(value) => setContentType(value as QRContentType)}>
          <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-6 bg-background/50 p-1 rounded-xl">
            {Object.entries(tabConfig).map(([key, config]) => (
              <TabsTrigger 
                key={key} 
                value={key}
                className="flex items-center justify-center data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
                style={{ color: contentType === key ? config.color : undefined }}
              >
                {contentType === key && config.icon}
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </TabsTrigger>
            ))}
          
          </TabsList>
          
          <div className="bg-white dark:bg-gray-800/50 rounded-xl p-5 shadow-inner border border-border/20">
            <TabsContent value="url" className="mt-0">
              <div className="flex items-center mb-4">
                {tabConfig.url.icon}
                <h3 className="font-medium" style={{ color: tabConfig.url.color }}>URL Link</h3>
              </div>
              <URLForm content={content} setContent={setContent} />
            </TabsContent>
            
            <TabsContent value="text" className="mt-0">
              <div className="flex items-center mb-4">
                {tabConfig.text.icon}
                <h3 className="font-medium" style={{ color: tabConfig.text.color }}>Text Content</h3>
              </div>
              <TextForm content={content} setContent={setContent} />
            </TabsContent>
            
            <TabsContent value="wifi" className="mt-0">
              <div className="flex items-center mb-4">
                {tabConfig.wifi.icon}
                <h3 className="font-medium" style={{ color: tabConfig.wifi.color }}>WiFi Network</h3>
              </div>
              <WifiForm setContent={setContent} />
            </TabsContent>
            
            <TabsContent value="contact" className="mt-0">
              <div className="flex items-center mb-4">
                {tabConfig.contact.icon}
                <h3 className="font-medium" style={{ color: tabConfig.contact.color }}>Contact Information</h3>
              </div>
              <ContactForm setContent={setContent} />
            </TabsContent>
            
            <TabsContent value="email" className="mt-0">
              <div className="flex items-center mb-4">
                {tabConfig.email.icon}
                <h3 className="font-medium" style={{ color: tabConfig.email.color }}>Email Address</h3>
              </div>
              <EmailForm setContent={setContent} />
            </TabsContent>
            
            <TabsContent value="phone" className="mt-0">
              <div className="flex items-center mb-4">
                {tabConfig.phone.icon}
                <h3 className="font-medium" style={{ color: tabConfig.phone.color }}>Phone Number</h3>
              </div>
              <PhoneForm content={content} setContent={setContent} />
            </TabsContent>
            
            <TabsContent value="sms" className="mt-0">
              <div className="flex items-center mb-4">
                {tabConfig.sms.icon}
                <h3 className="font-medium" style={{ color: tabConfig.sms.color }}>SMS Message</h3>
              </div>
              <SMSForm setContent={setContent} />
            </TabsContent>
            
            <TabsContent value="geo" className="mt-0">
              <div className="flex items-center mb-4">
                {tabConfig.geo.icon}
                <h3 className="font-medium" style={{ color: tabConfig.geo.color }}>Geographic Location</h3>
              </div>
              <GeoForm setContent={setContent} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}