import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Compass } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface Place {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  photos?: any[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

interface MapComponentProps {
  searchQuery?: string;
  onPlaceSelect?: (place: Place) => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({ searchQuery, onPlaceSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const serviceRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (searchQuery && userLocation && serviceRef.current) {
      searchNearbyPlaces(searchQuery);
    }
  }, [searchQuery, userLocation]);

  const loadGoogleMaps = () => {
    if (window.google) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyANg3xxbXS1brkvgdxl0NYexPoi5T7uL2Q&libraries=places`;
    script.async = true;
    script.defer = true;
    
    window.initMap = initializeMap;
    script.onload = initializeMap;
    
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    const defaultLocation = { lat: 5.603717, lng: -0.186964 }; // Accra, Ghana

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 15,
      center: defaultLocation,
      styles: [
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#3b82f6' }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#f8fafc' }]
        }
      ]
    });

    serviceRef.current = new window.google.maps.places.PlacesService(mapInstanceRef.current);
    
    getCurrentLocation();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setUserLocation(location);
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(location);
            
            new window.google.maps.Marker({
              position: location,
              map: mapInstanceRef.current,
              title: 'Your Location',
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }
            });
          }
          
          toast({
            title: "Location Found",
            description: "Your location has been detected!"
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location Error",
            description: "Could not get your location. Using default location.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const searchNearbyPlaces = (query: string) => {
    if (!serviceRef.current || !userLocation) return;

    setIsLoading(true);

    // Determine search type based on query
    let type = '';
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('restaurant') || lowerQuery.includes('food') || lowerQuery.includes('eat')) {
      type = 'restaurant';
    } else if (lowerQuery.includes('hotel') || lowerQuery.includes('stay')) {
      type = 'lodging';
    } else if (lowerQuery.includes('cafe') || lowerQuery.includes('coffee')) {
      type = 'cafe';
    } else if (lowerQuery.includes('attraction') || lowerQuery.includes('tourist')) {
      type = 'tourist_attraction';
    } else if (lowerQuery.includes('shop') || lowerQuery.includes('store')) {
      type = 'store';
    }

    const request = {
      location: userLocation,
      radius: 5000, // 5km radius
      type: type || undefined,
      keyword: query
    };

    serviceRef.current.nearbySearch(request, (results: Place[], status: any) => {
      setIsLoading(false);
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setNearbyPlaces(results.slice(0, 10)); // Limit to 10 results
        displayPlacesOnMap(results.slice(0, 10));
        
        toast({
          title: "Places Found",
          description: `Found ${results.length} places nearby`
        });
      } else {
        toast({
          title: "No Results",
          description: "No places found for your search",
          variant: "destructive"
        });
      }
    });
  };

  const displayPlacesOnMap = (places: Place[]) => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers (except user location)
    // In a real app, you'd keep track of markers to clear them properly

    places.forEach((place, index) => {
      const marker = new window.google.maps.Marker({
        position: place.geometry.location,
        map: mapInstanceRef.current,
        title: place.name,
        animation: window.google.maps.Animation.DROP,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">${place.name}</h3>
            <p class="text-sm text-gray-600">${place.vicinity}</p>
            ${place.rating ? `<p class="text-sm">Rating: ${place.rating}/5</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
        if (onPlaceSelect) {
          onPlaceSelect(place);
        }
      });
    });

    // Adjust map bounds to show all places
    if (places.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(userLocation);
      places.forEach(place => bounds.extend(place.geometry.location));
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  return (
    <Card className="modern-card h-96 overflow-hidden">
      <div className="relative h-full">
        <div ref={mapRef} className="w-full h-full" />
        
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <Compass className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Searching for places...</p>
            </div>
          </div>
        )}
        
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          <Button
            variant="minimal"
            size="sm"
            onClick={getCurrentLocation}
            className="shadow-lg"
          >
            <Navigation className="h-4 w-4 mr-2" />
            My Location
          </Button>
        </div>
        
        {nearbyPlaces.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="bg-background/90 backdrop-blur-sm p-3 max-h-32 overflow-y-auto">
              <h4 className="font-semibold mb-2 text-sm">Nearby Places</h4>
              <div className="space-y-1">
                {nearbyPlaces.slice(0, 3).map((place) => (
                  <div
                    key={place.place_id}
                    className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-muted/50 p-1 rounded"
                    onClick={() => onPlaceSelect && onPlaceSelect(place)}
                  >
                    <MapPin className="h-3 w-3 text-primary" />
                    <span className="font-medium">{place.name}</span>
                    {place.rating && (
                      <span className="text-muted-foreground">⭐ {place.rating}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
};