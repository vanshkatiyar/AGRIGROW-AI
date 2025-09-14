import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Loader2, 
  Tractor,
  Truck,
  Package,
  Factory,
  MapPin,
  Phone,
  IndianRupee,
  Clock,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { askAIAssistant } from '@/services/aiService';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  serviceRecommendations?: ServiceRecommendation[];
}

interface ServiceRecommendation {
  id: string;
  name: string;
  type: 'tractor' | 'harvester' | 'supplier' | 'manufacturer';
  location: string;
  rating: number;
  price: string;
  contact: string;
  distance: string;
}

const FarmerAIBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your farming assistant. I can help you find nearby tractor owners, harvesters, suppliers, and manufacturers. I can also provide farming advice, weather updates, and market prices. How can I help you today?",
      timestamp: new Date(),
      suggestions: [
        "Find tractor owners near me",
        "Show harvester services",
        "Find fertilizer suppliers",
        "Compare equipment prices",
        "Weather forecast for farming"
      ]
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
        toast.error('Speech recognition error');
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await askAIAssistant(messageToSend);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.answer, // Use response.answer from aiService
        timestamp: new Date(),
        // The aiService currently only returns 'answer', not suggestions or serviceRecommendations.
        // These would need to be added to the backend AI response if desired.
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: error.message || "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleVoiceInput = () => {
    if (!recognition.current) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
    }
  };

  const getServiceIcon = (type: string) => {
    const iconMap = {
      tractor: Tractor,
      harvester: Truck,
      supplier: Package,
      manufacturer: Factory
    };
    return iconMap[type as keyof typeof iconMap] || Package;
  };

  const ServiceRecommendationCard: React.FC<{ recommendation: ServiceRecommendation }> = ({ recommendation }) => {
    const ServiceIcon = getServiceIcon(recommendation.type);
    
    return (
      <Card className="w-64 flex-shrink-0">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ServiceIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{recommendation.name}</h4>
              <div className="flex items-center space-x-1 mt-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">{recommendation.rating}</span>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600">{recommendation.distance}</span>
              </div>
              <div className="text-sm font-medium text-green-600 mt-1">
                {recommendation.price}
              </div>
              <Button size="sm" className="w-full mt-2" variant="outline">
                <Phone className="h-3 w-3 mr-1" />
                Contact
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Bot className="h-5 w-5 text-green-600" />
          </div>
          <span>Farming Assistant</span>
          <Badge variant="secondary" className="ml-auto">AI Powered</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {message.type === 'bot' ? (
                      <AvatarFallback className="bg-green-100">
                        <Bot className="h-4 w-4 text-green-600" />
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback className="bg-blue-100">U</AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="space-y-2">
                    <div className={`p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    </div>
                    
                    {message.serviceRecommendations && message.serviceRecommendations.length > 0 && (
                      <div className="flex space-x-3 overflow-x-auto pb-2">
                        {message.serviceRecommendations.map((rec) => (
                          <ServiceRecommendationCard key={rec.id} recommendation={rec} />
                        ))}
                      </div>
                    )}
                    
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleSendMessage(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100">
                      <Bot className="h-4 w-4 text-green-600" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask me about farming services, weather, prices..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleVoiceInput}
              className={isListening ? 'bg-red-100 text-red-600' : ''}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Button onClick={() => handleSendMessage()} disabled={!inputMessage.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmerAIBot;