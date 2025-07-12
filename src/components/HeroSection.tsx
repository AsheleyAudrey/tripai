import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plane, MapPin, MessageCircle, Mic, ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-background via-muted/50 to-accent/10">
      {/* Modern geometric background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-dark rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full mix-blend-multiply filter blur-xl opacity-40"></div>
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 slide-up">
            <div className="inline-flex items-center px-4 py-2 bg-card border border-border rounded-full text-sm text-muted-foreground mb-6">
              <div className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse"></div>
              AI-Powered Travel Discovery
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-6">
              Trip<span className="text-gradient">AI</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover amazing places nearby with intelligent conversations and interactive maps. 
              Your modern travel companion for exploring the world around you.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-16 slide-up" style={{ animationDelay: '0.2s' }}>
            <Button 
              variant="dark" 
              size="lg" 
              onClick={onGetStarted}
              className="text-lg px-8 py-6 h-auto group"
            >
              <Plane className="mr-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              Start Exploring
            </Button>
            <Button 
              variant="minimal" 
              size="lg"
              className="text-lg px-8 py-6 h-auto group"
            >
              <MessageCircle className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform" />
              Try AI Chat
            </Button>
          </div>
          
          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 slide-up" style={{ animationDelay: '0.4s' }}>
            <Card className="modern-card p-8 text-center group">
              <div className="w-16 h-16 bg-gradient-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Smart Conversations</h3>
              <p className="text-muted-foreground leading-relaxed">
                Chat naturally with AI to discover restaurants, attractions, and hidden local gems
              </p>
            </Card>
            
            <Card className="modern-card p-8 text-center group">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mic className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Voice Commands</h3>
              <p className="text-muted-foreground leading-relaxed">
                Speak your requests and get audio responses for hands-free exploration
              </p>
            </Card>
            
            <Card className="modern-card p-8 text-center group">
              <div className="w-16 h-16 bg-gradient-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Live Maps</h3>
              <p className="text-muted-foreground leading-relaxed">
                Interactive maps with real-time place discovery and detailed information
              </p>
            </Card>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-16 slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Places Discovered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Countries Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">AI Assistant</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-muted-foreground animate-bounce">
        <div className="flex flex-col items-center">
          <span className="text-sm mb-2">Scroll to explore</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};