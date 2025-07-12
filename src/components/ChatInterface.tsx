import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

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
        const locationKeywords = ['near', 'nearby', 'around', 'find', 'restaurant', 'hotel', 'cafe', 'attraction', 'place'];
        const isLocationQuery = locationKeywords.some(keyword =>
            text.toLowerCase().includes(keyword)
        );

        if (isLocationQuery) {
            onLocationRequest(text);
        }

        const response = await axios.post(
            'https://puny-moyna-yawoffeh-a3130120.koyeb.app/stories/generate',
            { query: text },
            {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            }
        );

        const aiResponse = typeof response.data === 'string'
            ? response.data
            : 'Sorry, I could not understand that.';

        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponse,
            isUser: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        await speakText(aiResponse);

        } catch (error) {
        console.error('Error details:', error);
        toast({
            title: "Connection Error",
            description: "Failed to get response. Please try again.",
            variant: "destructive"
        });
        } finally {
        setIsLoading(false);
        }
    }


  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      const response = await axios.post(
        'https://api.alle-ai.com/api/v1/audio/tts',
        {
            models: ['gpt-4o-mini-tts'],
            prompt: text,
            voice: 'nova',
            model_specific_params: {}
        },
        {
            headers: {
            'X-API-KEY': 'alle-dY75cAyl8yusU1alGn9wC3q2pqhF4zx6wkIy',
            'Content-Type': 'application/json',
            Accept: 'application/json'
            },
            responseType: 'blob'
        }
        );

        const audioBlob = new Blob([response.data], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
    } catch (error) {
        console.log(error);
        toast({
          title: "Speech Error",
          description: "Failed to convert text to speech. Please try again.",
          variant: "destructive"
        });
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