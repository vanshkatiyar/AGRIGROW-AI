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
import axios from 'axios';

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
      const response = await getBotResponse(messageToSend);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
        serviceRecommendations: response.serviceRecommendations
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBotResponse = async (message: string): Promise<{
    content: string;
    suggestions?: string[];
    serviceRecommendations?: ServiceRecommendation[];
  }> => {
    // Simulate AI processing with intelligent responses based on keywords
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('tractor') || lowerMessage.includes('plowing') || lowerMessage.includes('cultivation')) {
      return {
        content: "I found several tractor owners near your location. Here are the top recommendations based on ratings and proximity:",
        suggestions: [
          "Show tractor rental rates",
          "Find tractor with specific attachments",
          "Book tractor for tomorrow",
          "Compare tractor owners"
        ],
        serviceRecommendations: [
          {
            id: '1',
            name: "Rajesh Tractor Services",
            type: 'tractor',
            location: "2.5 km away",
            rating: 4.8,
            price: "₹800/day",
            contact: "+91 98765 43210",
            distance: "2.5 km"
          },
          {
            id: '2',
            name: "Modern Farm Equipment",
            type: 'tractor',
            location: "4.1 km away",
            rating: 4.6,
            price: "₹750/day",
            contact: "+91 98765 43211",
            distance: "4.1 km"
          }
        ]
      };
    }
    
    if (lowerMessage.includes('harvester') || lowerMessage.includes('harvest') || lowerMessage.includes('combine')) {
      return {
        content: "Here are the best harvester services available in your area:",
        suggestions: [
          "Check harvester availability",
          "Compare harvester prices",
          "Book harvester service",
          "Find mini harvester"
        ],
        serviceRecommendations: [
          {
            id: '3',
            name: "Singh Harvesting Co.",
            type: 'harvester',
            location: "3.2 km away",
            rating: 4.9,
            price: "₹1200/hour",
            contact: "+91 98765 43212",
            distance: "3.2 km"
          }
        ]
      };
    }
    
    if (lowerMessage.includes('supplier') || lowerMessage.includes('fertilizer') || lowerMessage.includes('seeds') || lowerMessage.includes('pesticide')) {
      return {
        content: "I found several agricultural suppliers near you offering quality products at competitive prices:",
        suggestions: [
          "Find organic fertilizers",
          "Compare seed prices",
          "Check pesticide availability",
          "Find irrigation supplies"
        ],
        serviceRecommendations: [
          {
            id: '4',
            name: "Green Valley Suppliers",
            type: 'supplier',
            location: "1.8 km away",
            rating: 4.7,
            price: "Best prices guaranteed",
            contact: "+91 98765 43213",
            distance: "1.8 km"
          },
          {
            id: '5',
            name: "Krishi Kendra",
            type: 'supplier',
            location: "5.0 km away",
            rating: 4.5,
            price: "Bulk discounts available",
            contact: "+91 98765 43214",
            distance: "5.0 km"
          }
        ]
      };
    }
    
    if (lowerMessage.includes('manufacturer') || lowerMessage.includes('equipment') || lowerMessage.includes('machinery')) {
      return {
        content: "Here are the top agricultural equipment manufacturers and dealers in your region:",
        suggestions: [
          "Find irrigation equipment",
          "Compare machinery prices",
          "Check warranty options",
          "Find spare parts"
        ],
        serviceRecommendations: [
          {
            id: '6',
            name: "Mahindra Tractors Dealer",
            type: 'manufacturer',
            location: "8.5 km away",
            rating: 4.8,
            price: "Authorized dealer",
            contact: "+91 98765 43215",
            distance: "8.5 km"
          }
        ]
      };
    }
    
    if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('forecast')) {
      return {
        content: "Based on the latest weather forecast for your area:\n\n🌤️ Today: Partly cloudy, 28°C\n🌧️ Tomorrow: Light rain expected, 25°C\n☀️ This week: Good conditions for farming activities\n\nRecommendation: Complete any pending field work today before the rain tomorrow.",
        suggestions: [
          "7-day weather forecast",
          "Rainfall predictions",
          "Best farming days this week",
          "Weather alerts for farming"
        ]
      };
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('market') || lowerMessage.includes('rate')) {
      return {
        content: "Current market prices in your area:\n\n🌾 Wheat: ₹2,150/quintal\n🌽 Maize: ₹1,850/quintal\n🍅 Tomato: ₹25/kg\n🥔 Potato: ₹18/kg\n\nPrices are trending upward this week. Good time to sell if you have stock ready.",
        suggestions: [
          "View all crop prices",
          "Price trend analysis",
          "Best selling locations",
          "Price alerts setup"
        ]
      };
    }
    
    // Default response for general queries
    return {
      content: "I can help you with various farming needs. Here's what I can assist you with:\n\n🚜 Find tractor and harvester owners\n📦 Locate suppliers for seeds, fertilizers, pesticides\n🏭 Connect with equipment manufacturers\n🌤️ Weather forecasts and farming advice\n💰 Market prices and trends\n\nWhat would you like to know more about?",
      suggestions: [
        "Find tractor owners near me",
        "Show fertilizer suppliers",
        "Weather forecast",
        "Current market prices",
        "Find harvester services"
      ]
    };
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