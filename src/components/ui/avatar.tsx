import React, { useState, useRef } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { ChatInterface } from '@/components/ChatInterface';
import { MapComponent } from '@/components/MapComponent';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowUp, Globe, Heart, Star } from 'lucide-react';

const Index = () => {
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [showMainApp, setShowMainApp] = useState(false);
  const mainAppRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    setShowMainApp(true);
    setTimeout(() => {
      mainAppRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLocationRequest = (query: string) => {
    setCurrentQuery(query);
  };

  const handlePlaceSelect = (place: any) => {
    setSelectedPlace(place);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection onGetStarted={handleGetStarted} />
      
      {/* Main Application */}
      {showMainApp && (
        <div ref={mainAppRef} className="min-h-screen bg-gradient-subtle p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 slide-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Discover Amazing Places
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Chat with our AI assistant or explore the map to find restaurants, attractions, and hidden gems near you.
              </p>
            </div>

            {/* Main Interface Grid */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Chat Interface */}
              <div className="slide-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-primary" />
                  AI Travel Assistant
                </h3>
                <ChatInterface onLocationRequest={handleLocationRequest} />
              </div>

              {/* Map Component */}
              <div className="slide-up" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <div className="w-5 h-5 mr-2 bg-gradient-dark rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  </div>
                  Interactive Map
                </h3>
                <MapComponent 
                  searchQuery={currentQuery} 
                  onPlaceSelect={handlePlaceSelect}
                />
              </div>
            </div>

            {/* Selected Place Details */}
            {selectedPlace && (
              <Card className="modern-card p-6 mb-8 slide-up">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-dark rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold mb-2">{selectedPlace.name}</h4>
                    <p className="text-muted-foreground mb-2">{selectedPlace.vicinity}</p>
                    {selectedPlace.rating && (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(selectedPlace.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {selectedPlace.rating}/5
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedPlace.types?.slice(0, 3).map((type: string) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {type.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-6 slide-up" style={{ animationDelay: '0.6s' }}>
              <Card className="modern-card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-dark rounded-full flex items-center justify-center mx-auto mb-4 float-animation">
                  <Globe className="h-8 w-8 text-primary-foreground" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Smart Recommendations</h4>
                <p className="text-sm text-muted-foreground">
                  Get personalized suggestions based on your preferences and location
                </p>
              </Card>

              <Card className="modern-card p-6 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 float-animation" style={{ animationDelay: '1s' }}>
                  <Heart className="h-8 w-8 text-accent-foreground" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Save Favorites</h4>
                <p className="text-sm text-muted-foreground">
                  Bookmark places you love and create your personal travel list
                </p>
              </Card>

              <Card className="modern-card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-dark rounded-full flex items-center justify-center mx-auto mb-4 float-animation" style={{ animationDelay: '2s' }}>
                  <Star className="h-8 w-8 text-primary-foreground" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Real Reviews</h4>
                <p className="text-sm text-muted-foreground">
                  See ratings and reviews from other travelers to make informed choices
                </p>
              </Card>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-12 slide-up" style={{ animationDelay: '0.8s' }}>
              <Card className="modern-card p-8 bg-gradient-dark text-primary-foreground max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Ready for Your Next Adventure?</h3>
                <p className="text-lg mb-6 text-primary-foreground/90">
                  Start exploring with TripAI and discover amazing places you never knew existed.
                </p>
                <Button 
                  variant="light" 
                  size="lg"
                  className="text-lg px-8 py-6 h-auto"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <ArrowUp className="mr-2 h-5 w-5" />
                  Back to Top
                </Button>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {showMainApp && (
        <Button
          variant="dark"
          size="icon"
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-float z-50 pulse-modern"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default Index;
