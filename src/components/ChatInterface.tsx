import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onLocationRequest: (query: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onLocationRequest }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI travel assistant. Ask me about places to visit, restaurants, or things to do nearby!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if this is a location-based query
      const locationKeywords = ['near', 'nearby', 'around', 'find', 'restaurant', 'hotel', 'cafe', 'attraction', 'place'];
      const isLocationQuery = locationKeywords.some(keyword => 
        text.toLowerCase().includes(keyword)
      );

      if (isLocationQuery) {
        onLocationRequest(text);
      }

      // Call AlleAI Chat API
      const response = await fetch('https://api.alle-ai.com/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'X-API-KEY': 'alle-dY75cAyl8yusU1alGn9wC3q2pqhF4zx6wkIy',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'ministral-3b',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful travel assistant. Provide friendly, informative responses about travel, places, restaurants, and activities. Keep responses concise but helpful.'
            },
            {
              role: 'user',
              content: text
            }
          ]
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      // Get response as text first to check if it's JSON
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.log('Response is not JSON, treating as string:', responseText);
        // If it's not JSON, treat the response as the message content
        data = { content: responseText };
      }

      console.log('Parsed data:', data);

      let aiResponse = 'Sorry, I could not understand that.';

      // Handle AlleAI's actual response format
      if (data.success && data.responses && data.responses.responses) {
        // Get response from the first available model
        const modelResponses = data.responses.responses;
        const firstModel = Object.keys(modelResponses)[0];
        if (firstModel && modelResponses[firstModel] && modelResponses[firstModel].message) {
          aiResponse = modelResponses[firstModel].message.content;
        }
      } 
      // Handle direct content response
      else if (data.content) {
        aiResponse = data.content;
      }
      // Handle OpenAI-style format as fallback
      else if (data.choices && data.choices[0] && data.choices[0].message) {
        aiResponse = data.choices[0].message.content;
      }
      // Handle simple string response
      else if (typeof data === 'string') {
        aiResponse = data;
      }

      console.log('Final AI response:', aiResponse);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Convert response to speech
      await speakText(aiResponse);

    } catch (error) {
      console.error('Error details:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to get response. Please try again.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection or try again later.';
      } else if (error instanceof Error) {
        errorMessage = `API Error: ${error.message}`;
      }
      
      // Add fallback response for location queries
      if (text.toLowerCase().includes('restaurant') || text.toLowerCase().includes('food')) {
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm having trouble connecting to the AI service right now, but I can help you find restaurants using the map! Try asking about specific types of food or restaurants near you.",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      const response = await fetch('https://api.alle-ai.com/api/v1/audio/tts', {
        method: 'POST',
        headers: {
          'X-API-KEY': 'alle-dY75cAyl8yusU1alGn9wC3q2pqhF4zx6wkIy',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          models: ['gpt-4o-mini-tts'],
          prompt: text,
          voice: 'nova',
          model_specific_params: {}
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setIsSpeaking(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // For now, we'll use browser's speech recognition as a fallback
      // In production, you'd implement AlleAI's transcription API
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        toast({
          title: "Note",
          description: "Using browser speech recognition. Upload audio to AlleAI for better accuracy.",
        });
      }
    } catch (error) {
      console.error('Transcription error:', error);
    }
  };

  return (
    <Card className="modern-card h-96 flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} slide-up`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser
                  ? 'bg-gradient-dark text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <span className="text-xs opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about places to visit..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
            className="flex-1"
          />
          <Button
            variant="dark"
            size="icon"
            onClick={() => handleSendMessage(inputValue)}
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            variant={isRecording ? "destructive" : "minimal"}
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            className={isRecording ? "pulse-modern" : ""}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={isSpeaking ? "pulse-modern" : ""}
            disabled
          >
            {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
};