import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Code, Users, Globe, Sparkles } from 'lucide-react';
import ChangelogModal from '@/components/about/changelog-modal';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-radial from-background to-background/80 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            About <span className="text-primary">YOQR</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A privacy-focused QR code generator and scanner, crafted with love in Nepal for the entire world.
          </p>
        </div>

        {/* App Info Card */}
        <Card className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Code className="h-6 w-6 mr-3 text-primary" />
              App Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Version:</span>
              <Badge variant="secondary" className="font-mono">1.0.0</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Platform:</span>
              <Badge variant="outline">Web Application</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Technology:</span>
              <Badge variant="outline">Next.js 14 + TypeScript</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Privacy:</span>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600">100% Private</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Developer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Developed By */}
          <Card className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Developed By
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    <a href="https://www.bit-nepal.com/" className="hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
                      Bit Nepal
                    </a>
                  </h3>
                  <p className="text-muted-foreground">Technology company based in Nepal</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">YO GURU Teams</h3>
                  <p className="text-muted-foreground">A passionate team of developers and designers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Made In Nepal */}
          <Card className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Made in Nepal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Proudly developed in the beautiful country of Nepal, bringing innovative technology solutions to the world.
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Heart className="h-4 w-4 mr-1 text-red-500" />
                  Made with love for the entire world
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mission Statement */}
        <Card className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              YOQR was created with a simple mission: to provide a free, privacy-focused QR code solution that works seamlessly across all devices.
              We believe in building technology that respects user privacy and empowers people to create and interact with QR codes without compromising their data.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              As a product made in Nepal, we take pride in contributing to the global technology landscape while staying true to our roots and values.
            </p>
          </CardContent>
        </Card>

        {/* What's New Section */}
        <Card className="bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Sparkles className="h-6 w-6 mr-3 text-primary" />
              What's New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Stay updated with the latest features and improvements in YOQR. View our complete version history and changelog.
            </p>
            <ChangelogModal>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                <Sparkles className="h-4 w-4 mr-2" />
                View Changelog
              </Button>
            </ChangelogModal>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">What Makes YOQR Special</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card/60 backdrop-blur-sm p-6 rounded-xl border border-border/30">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
              <p className="text-muted-foreground text-sm">No data collection, no tracking, completely private</p>
            </div>

            <div className="bg-card/60 backdrop-blur-sm p-6 rounded-xl border border-border/30">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Open Source</h3>
              <p className="text-muted-foreground text-sm">Built with modern web technologies and best practices</p>
            </div>

            <div className="bg-card/60 backdrop-blur-sm p-6 rounded-xl border border-border/30">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Free & Global</h3>
              <p className="text-muted-foreground text-sm">Completely free to use, accessible worldwide</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}