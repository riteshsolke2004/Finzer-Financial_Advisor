// components/FinancialChatbot.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import {
  Brain,
  Sparkles,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Send,
  MessageCircle,
  User,
  Bot,
  PieChart,
  Target,
  Calculator,
  DollarSign,
  Wallet,
  CreditCard,
  Building,
  GraduationCap,
  Settings,
  RefreshCw,
  Info,
  Lightbulb,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Activity,
  BarChart3,
  PlusCircle
} from 'lucide-react';
import Header from './DynamicNavbar';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL ;

// Types
interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  category?: string;
  financial_analysis?: FinancialAnalysis;
}

interface FinancialAnalysis {
  total_income: number;
  total_expenses: number;
  savings_amount: number;
  savings_rate: number;
  category_breakdown: Record<string, number>;
  top_category: string;
  financial_health_score: number;
}

interface UserProfile {
  name: string;
  age: number;
  monthly_income: number;
  risk_profile: 'Conservative' | 'Moderate' | 'Aggressive';
  goal: string;
  employment_type: string;
  investment_experience: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

// Form schemas
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(18, 'Age must be 18 or above').max(100, 'Age must be 100 or below'),
  monthly_income: z.number().min(1000, 'Income must be at least ₹1,000'),
  risk_profile: z.enum(['Conservative', 'Moderate', 'Aggressive']),
  goal: z.string().min(1, 'Goal is required'),
  employment_type: z.string().min(1, 'Employment type is required'),
  investment_experience: z.string().min(1, 'Investment experience is required'),
});

const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
});

// API Service
class ChatbotAPIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async sendMessage(query: string, userProfile: UserProfile, transactions: Transaction[]) {
    try {
      const response = await fetch(`${this.baseUrl}/chatbot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          user_profile: {
            name: userProfile.name,
            age: userProfile.age,
            monthly_income: userProfile.monthly_income,
            risk_profile: userProfile.risk_profile,
            goal: userProfile.goal,
            employment_type: userProfile.employment_type,
            investment_experience: userProfile.investment_experience
          },
          transactions: transactions.map(t => ({
            description: t.description,
            amount: t.amount,
            category: t.category
          }))
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getQuickAdvice(query: string, monthlyIncome: number, age: number) {
    try {
      const response = await fetch(`${this.baseUrl}/chatbot/quick-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          monthly_income: monthlyIncome,
          age
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting quick advice:', error);
      throw error;
    }
  }

  async getSupportedTopics() {
    try {
      const response = await fetch(`${this.baseUrl}/chatbot/topics`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting topics:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/chatbot/health`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
}

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
};

const getCategoryIcon = (category: string) => {
  const icons = {
    'savings': Wallet,
    'investment': TrendingUp,
    'budgeting': Calculator,
    'debt': CreditCard,
    'retirement': Building,
    'tax': GraduationCap,
    'general': Lightbulb
  };
  return icons[category as keyof typeof icons] || MessageCircle;
};

const getCategoryColor = (category: string) => {
  const colors = {
    'savings': 'text-green-600 bg-green-100',
    'investment': 'text-blue-600 bg-blue-100',
    'budgeting': 'text-purple-600 bg-purple-100',
    'debt': 'text-red-600 bg-red-100',
    'retirement': 'text-orange-600 bg-orange-100',
    'tax': 'text-indigo-600 bg-indigo-100',
    'general': 'text-gray-600 bg-gray-100'
  };
  return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-100';
};

const FinancialChatbot: React.FC = () => {
  const apiService = new ChatbotAPIService();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'John Doe',
    age: 28,
    monthly_income: 75000,
    risk_profile: 'Moderate',
    goal: 'Wealth Building',
    employment_type: 'Salaried',
    investment_experience: 'Beginner'
  });
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      description: 'Rent',
      amount: 15000,
      category: 'Needs',
      date: '2025-10-01'
    },
    {
      id: '2',
      description: 'Groceries',
      amount: 8000,
      category: 'Needs',
      date: '2025-10-01'
    },
    {
      id: '3',
      description: 'Entertainment',
      amount: 5000,
      category: 'Wants',
      date: '2025-10-01'
    }
  ]);
  
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [supportedTopics, setSupportedTopics] = useState<any>(null);
  const [botStatus, setBotStatus] = useState<'online' | 'offline' | 'error'>('online');

  // Form instances
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: userProfile
  });

  const transactionForm = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
      category: 'Needs',
      date: new Date().toISOString().split('T')[0]
    }
  });

  // Load initial data
  useEffect(() => {
    loadSupportedTopics();
    checkBotHealth();
    addWelcomeMessage();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSupportedTopics = async () => {
    try {
      const topics = await apiService.getSupportedTopics();
      setSupportedTopics(topics);
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  };

  const checkBotHealth = async () => {
    try {
      const health = await apiService.healthCheck();
      setBotStatus(health.groq_api_status === 'available' ? 'online' : 'offline');
    } catch (error) {
      setBotStatus('error');
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'bot',
      content: `👋 Hi ${userProfile.name}! I'm your AI Financial Advisor. I can help you with:

💰 **Savings strategies** - Emergency funds, savings optimization
📈 **Investment planning** - Portfolio allocation, mutual funds, SIPs
📊 **Budgeting** - Expense tracking, 50-30-20 rule
💳 **Debt management** - Repayment strategies, EMI planning
🏦 **Retirement planning** - Corpus calculation, pension planning
📋 **Tax planning** - Deductions, tax-efficient investments

Ask me anything about your finances! For example:
- "How much should I save each month?"
- "What's the best investment strategy for my age?"
- "How can I reduce my expenses?"`,
      timestamp: new Date().toISOString(),
      category: 'general'
    };

    setMessages([welcomeMessage]);
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await apiService.sendMessage(message, userProfile, transactions);

      // Add bot response
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.answer,
        timestamp: response.timestamp,
        category: response.query_category,
        financial_analysis: response.financial_analysis
      };

      setMessages(prev => [...prev, botMessage]);

      toast({
        title: "Financial advice received! 💡",
        description: `Category: ${response.query_category} | Method: ${response.method}`,
      });

    } catch (error) {
      console.error('Error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again later or contact support if the issue persists.",
        timestamp: new Date().toISOString(),
        category: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Message failed",
        description: "Unable to get financial advice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdvice = async (query: string) => {
    setIsLoading(true);
    
    try {
      const response = await apiService.getQuickAdvice(query, userProfile.monthly_income, userProfile.age);
      
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: response.answer,
        timestamp: response.timestamp,
        category: response.query_category
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Quick advice error:', error);
      toast({
        title: "Quick advice failed",
        description: "Unable to get quick advice. Please try the full chat.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (data: z.infer<typeof profileSchema>) => {
    setUserProfile(data);
    setShowProfileDialog(false);
    
    toast({
      title: "Profile updated successfully!",
      description: "Your financial profile has been updated for better advice.",
    });
  };

  const addTransaction = (data: z.infer<typeof transactionSchema>) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      ...data
    };

    setTransactions(prev => [...prev, newTransaction]);
    setShowTransactionDialog(false);
    transactionForm.reset();
    
    toast({
      title: "Transaction added!",
      description: "New transaction added to your financial data.",
    });
  };

  const clearChat = () => {
    setMessages([]);
    addWelcomeMessage();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto p-4 space-y-6">
          
          {/* Header */}
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardHeader className="relative z-10 pb-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                <div className="space-y-2">
                  <CardTitle className="text-4xl lg:text-5xl font-bold flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Brain className="h-10 w-10" />
                    </div>
                    <span>FinAssist AI</span>
                  </CardTitle>
                  <CardDescription className="text-blue-100 text-lg">
                    Your personal AI financial advisor powered by advanced language models
                  </CardDescription>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge className={`px-4 py-2 text-sm ${
                    botStatus === 'online' ? 'bg-green-500/20 text-green-100 border-green-400/30' :
                    botStatus === 'offline' ? 'bg-yellow-500/20 text-yellow-100 border-yellow-400/30' :
                    'bg-red-500/20 text-red-100 border-red-400/30'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      botStatus === 'online' ? 'bg-green-400' :
                      botStatus === 'offline' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    {botStatus === 'online' ? 'Online' : botStatus === 'offline' ? 'Limited' : 'Error'}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Groq LLaMA
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col shadow-lg">
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <MessageCircle className="h-5 w-5" />
                        <span>Financial Chat</span>
                      </CardTitle>
                      <CardDescription>
                        Ask me anything about your finances
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={clearChat}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowProfileDialog(true)}>
                        <Settings className="h-4 w-4 mr-1" />
                        Profile
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-3 ${
                          message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                        }`}>
                          {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        
                        <div className={`max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                          <div className={`rounded-lg p-3 ${
                            message.type === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}>
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            
                            {/* Category Badge */}
                            {message.category && message.type === 'bot' && (
                              <div className="mt-2">
                                <Badge className={`text-xs ${getCategoryColor(message.category)}`}>
                                  {React.createElement(getCategoryIcon(message.category), { className: "h-3 w-3 mr-1" })}
                                  {message.category}
                                </Badge>
                              </div>
                            )}
                          </div>
                          
                          {/* Financial Analysis */}
                          {message.financial_analysis && message.type === 'bot' && (
                            <Card className="mt-3 border-l-4 border-l-blue-500">
                              <CardHeader className="py-3">
                                <CardTitle className="text-sm flex items-center space-x-2">
                                  <BarChart3 className="h-4 w-4" />
                                  <span>Financial Analysis</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="py-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <div className="font-medium">Savings Rate</div>
                                    <div className="text-lg font-bold text-green-600">
                                      {message.financial_analysis.savings_rate.toFixed(1)}%
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium">Health Score</div>
                                    <div className="text-lg font-bold text-blue-600">
                                      {message.financial_analysis.financial_health_score}/100
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium">Monthly Savings</div>
                                    <div className="text-lg font-bold text-purple-600">
                                      {formatCurrency(message.financial_analysis.savings_amount)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium">Top Category</div>
                                    <div className="text-sm font-medium">
                                      {message.financial_analysis.top_category}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                          
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>FinAssist is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Ask me about savings, investments, budgeting..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(currentMessage);
                        }
                      }}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={() => sendMessage(currentMessage)}
                      disabled={isLoading || !currentMessage.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Quick Questions */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5" />
                    <span>Quick Questions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      "How much should I save monthly?",
                      "Best investment for ₹10,000?",
                      "How to reduce my expenses?",
                      "Emergency fund calculation?",
                      "Tax saving investments?",
                      "SIP recommendations?"
                    ].map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start h-auto p-2 text-xs"
                        onClick={() => handleQuickAdvice(question)}
                        disabled={isLoading}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Your Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Income</span>
                      <span className="font-bold">{formatCurrency(userProfile.monthly_income)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Age</span>
                      <span className="font-bold">{userProfile.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Profile</span>
                      <Badge variant="outline" className="text-xs">{userProfile.risk_profile}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Goal</span>
                      <span className="font-medium text-xs">{userProfile.goal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transactions</span>
                      <span className="font-bold">{transactions.length}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowProfileDialog(true)}
                      className="flex-1"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTransactionDialog(true)}
                      className="flex-1"
                    >
                      <PlusCircle className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Supported Topics */}
              
            </div>
          </div>

          {/* Profile Dialog */}
          <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Update Your Financial Profile</DialogTitle>
                <DialogDescription>
                  Provide accurate information for better personalized advice
                </DialogDescription>
              </DialogHeader>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(updateProfile)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={profileForm.control}
                    name="monthly_income"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Income (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="risk_profile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Risk Profile</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Conservative">Conservative</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="Aggressive">Aggressive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="employment_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Salaried">Salaried</SelectItem>
                              <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                              <SelectItem value="Business">Business</SelectItem>
                              <SelectItem value="Professional">Professional</SelectItem>
                              <SelectItem value="Student">Student</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={profileForm.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Financial Goal</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Wealth Building, Retirement, House Purchase" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="investment_experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investment Experience</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowProfileDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Update Profile
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Transaction Dialog */}
          <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
                <DialogDescription>
                  Add a financial transaction to improve advice accuracy
                </DialogDescription>
              </DialogHeader>
              <Form {...transactionForm}>
                <form onSubmit={transactionForm.handleSubmit(addTransaction)} className="space-y-4">
                  <FormField
                    control={transactionForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Grocery shopping, Netflix subscription" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={transactionForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={transactionForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Needs">Needs</SelectItem>
                              <SelectItem value="Wants">Wants</SelectItem>
                              <SelectItem value="Savings">Savings</SelectItem>
                              <SelectItem value="Investments">Investments</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={transactionForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowTransactionDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Add Transaction
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default FinancialChatbot;
