import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  BookOpen, 
  Star, 
  MessageCircle,
  ExternalLink,
  Bookmark,
  Clock,
  TrendingUp,
  Shield,
  Calculator,
  Lightbulb,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KnowledgeItem {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  category: string;
  sources: Source[];
  relatedQuestions: string[];
  bookmarked: boolean;
  helpful: boolean | null;
  timestamp: Date;
}

interface Source {
  title: string;
  type: 'official' | 'regulatory' | 'expert' | 'news';
  credibility: 'high' | 'medium' | 'low';
  url: string;
  excerpt: string;
}

const mockSources: Source[] = [
  {
    title: 'RBI Guidelines on Personal Finance',
    type: 'regulatory',
    credibility: 'high',
    url: '#',
    excerpt: 'Reserve Bank of India official guidelines for individual investors and financial planning best practices.'
  },
  {
    title: 'SEBI Mutual Fund Regulations',
    type: 'regulatory', 
    credibility: 'high',
    url: '#',
    excerpt: 'Securities and Exchange Board of India comprehensive framework for mutual fund investments.'
  },
  {
    title: 'Income Tax Act Section 80C',
    type: 'official',
    credibility: 'high',
    url: '#',
    excerpt: 'Official government documentation on tax-saving investment options and deduction limits.'
  }
];

const mockKnowledgeBase: KnowledgeItem[] = [
  {
    id: '1',
    question: 'What is the ideal emergency fund amount?',
    answer: 'According to RBI guidelines and financial experts, an emergency fund should contain 6-12 months of your essential expenses. For someone with your income profile, this typically means maintaining ₹3-6 lakhs in liquid instruments like savings accounts, liquid funds, or short-term FDs. The exact amount depends on your job stability, family size, and monthly expenses. Start with 3 months and gradually build to 6 months for optimal financial security.',
    confidence: 0.92,
    category: 'Emergency Planning',
    sources: mockSources,
    relatedQuestions: [
      'Where should I keep my emergency fund?',
      'How quickly should I build my emergency fund?',
      'Can I invest emergency fund in mutual funds?'
    ],
    bookmarked: false,
    helpful: null,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    question: 'Why should I invest in ELSS funds?',
    answer: 'ELSS (Equity Linked Savings Scheme) funds offer dual benefits: tax savings under Section 80C (up to ₹1.5 lakh deduction) and potential for higher returns through equity exposure. With only 3-year lock-in period (shortest among 80C options), ELSS funds are ideal for long-term wealth creation while saving taxes. They typically invest 80% in equity markets, offering inflation-beating returns over the long term. However, they carry market risk and should be part of a diversified portfolio.',
    confidence: 0.89,
    category: 'Tax Planning',
    sources: mockSources,
    relatedQuestions: [
      'What is the lock-in period for ELSS?',
      'How much can I invest in ELSS for tax savings?',
      'ELSS vs PPF - which is better?'
    ],
    bookmarked: true,
    helpful: true,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: '3',
    question: 'How to choose between large-cap and mid-cap funds?',
    answer: 'Large-cap funds invest in established companies with market capitalization above ₹20,000 crores, offering stability and consistent returns (8-12% annually). Mid-cap funds target companies with ₹5,000-20,000 crore market cap, providing higher growth potential (12-15% annually) but with increased volatility. For conservative investors or those nearing retirement, large-cap funds are suitable. Young investors with higher risk appetite can allocate more to mid-cap funds. A balanced approach might be 60% large-cap and 40% mid-cap allocation.',
    confidence: 0.85,
    category: 'Investment Strategy',
    sources: mockSources,
    relatedQuestions: [
      'What are small-cap funds?',
      'Best asset allocation by age?',
      'How to rebalance equity portfolio?'
    ],
    bookmarked: false,
    helpful: null,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
  }
];

const popularTopics = [
  { name: 'Emergency Fund', count: 125, icon: <Shield className="w-4 h-4" /> },
  { name: 'Tax Saving', count: 98, icon: <Calculator className="w-4 h-4" /> },
  { name: 'SIP Planning', count: 87, icon: <TrendingUp className="w-4 h-4" /> },
  { name: 'Mutual Funds', count: 76, icon: <BookOpen className="w-4 h-4" /> },
  { name: 'Portfolio Balance', count: 65, icon: <Star className="w-4 h-4" /> },
  { name: 'Insurance Planning', count: 54, icon: <Shield className="w-4 h-4" /> }
];

const quickSuggestions = [
  'How much should I save each month?',
  'Best mutual funds for beginners?',
  'When should I start investing?',
  'How to build wealth in 20s?',
  'Is crypto investment safe?',
  'Home loan vs rent comparison'
];

const Knowledge: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<KnowledgeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [knowledgeHistory, setKnowledgeHistory] = useState<KnowledgeItem[]>(mockKnowledgeBase);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const results = mockKnowledgeBase.filter(item => 
        item.question.toLowerCase().includes(query.toLowerCase()) ||
        item.answer.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 1000);
  };

  const handleQuestionClick = (question: string) => {
    setSearchQuery(question);
    handleSearch(question);
  };

  const toggleBookmark = (id: string) => {
    setKnowledgeHistory(prev => 
      prev.map(item => 
        item.id === id ? { ...item, bookmarked: !item.bookmarked } : item
      )
    );
  };

  const markHelpful = (id: string, helpful: boolean) => {
    setKnowledgeHistory(prev => 
      prev.map(item => 
        item.id === id ? { ...item, helpful } : item
      )
    );
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'official': return '🏛️';
      case 'regulatory': return '⚖️';
      case 'expert': return '👨‍💼';
      case 'news': return '📰';
      default: return '📄';
    }
  };

  const getCredibilityColor = (credibility: string) => {
    switch (credibility) {
      case 'high': return 'text-success';
      case 'medium': return 'text-warning';
      case 'low': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Financial Knowledge Hub 🧠
          </h1>
          <p className="text-lg text-muted-foreground">
            AI-powered answers to all your financial questions
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              ref={searchInputRef}
              placeholder="Ask any financial question..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="pl-12 pr-4 py-6 text-lg rounded-full border-2 border-primary/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto"
        >
          {quickSuggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuestionClick(suggestion)}
              className="rounded-full text-xs hover:bg-primary/10"
            >
              {suggestion}
            </Button>
          ))}
        </motion.div>
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Search Results for "{searchQuery}"
                </CardTitle>
                <CardDescription>
                  {searchResults.length} results found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSearching ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">AI is analyzing your question...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedItem(result)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{result.question}</h3>
                          <Badge variant="outline" className="ml-2 flex-shrink-0">
                            {(result.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {result.answer}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{result.category}</Badge>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(result.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No results found. Try a different search term.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs defaultValue="explore" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="history">My Questions</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Popular Topics
                  </CardTitle>
                  <CardDescription>
                    Most searched financial topics this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {popularTopics.map((topic, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleQuestionClick(topic.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-primary rounded-lg text-white">
                              {topic.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold">{topic.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {topic.count} questions
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-warning" />
                    Featured Insights
                  </CardTitle>
                  <CardDescription>
                    Curated financial wisdom from experts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-card rounded-lg">
                      <h4 className="font-semibold mb-2">💡 Smart Tip of the Day</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        "Start investing even with small amounts. Time in the market beats timing the market. 
                        A SIP of just ₹1,000 monthly can grow to ₹10+ lakhs in 20 years with 12% returns."
                      </p>
                      <Button variant="ghost" size="sm">
                        Learn More <ExternalLink className="ml-2 w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-gradient-card rounded-lg">
                      <h4 className="font-semibold mb-2">📈 Market Insight</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        "Large-cap funds have outperformed mid-cap funds in the last 6 months. 
                        Consider rebalancing if your mid-cap allocation exceeds 30%."
                      </p>
                      <Button variant="ghost" size="sm">
                        View Analysis <ExternalLink className="ml-2 w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-base">AI Knowledge Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">10,000+</p>
                    <p className="text-sm text-muted-foreground">Questions Answered</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-success">94.2%</p>
                    <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-info">2.1s</p>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Calculator className="mr-2 w-4 h-4" />
                    SIP Calculator
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 w-4 h-4" />
                    Risk Profiler
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 w-4 h-4" />
                    Insurance Planner
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Your Question History
              </CardTitle>
              <CardDescription>
                All your previous queries and AI responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {knowledgeHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{item.question}</h4>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(item.id)}
                          >
                            <Bookmark className={`w-4 h-4 ${item.bookmarked ? 'fill-current text-warning' : ''}`} />
                          </Button>
                          <Badge variant="outline">
                            {(item.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.answer}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">{item.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markHelpful(item.id, true)}
                            className={item.helpful === true ? 'text-success' : ''}
                          >
                            👍
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markHelpful(item.id, false)}
                            className={item.helpful === false ? 'text-error' : ''}
                          >
                            👎
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-warning" />
                Bookmarked Questions
              </CardTitle>
              <CardDescription>
                Your saved financial insights for quick reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {knowledgeHistory.filter(item => item.bookmarked).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border-l-4 border-l-warning bg-warning/5"
                  >
                    <h4 className="font-medium mb-2">{item.question}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.answer}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{item.category}</Badge>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {knowledgeHistory.filter(item => item.bookmarked).length === 0 && (
                  <div className="text-center py-8">
                    <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No bookmarks yet. Save useful answers for quick access!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Trending This Week
              </CardTitle>
              <CardDescription>
                Most popular financial questions and topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  'Should I invest in crypto or stocks?',
                  'How to plan for child education costs?',
                  'Best investment options for senior citizens',
                  'Tax implications of equity mutual funds',
                  'How to build passive income streams?'
                ].map((question, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleQuestionClick(question)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-primary text-white text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{question}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Answer Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-bold">{selectedItem.question}</h2>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                      ✕
                    </Button>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    <p>{selectedItem.answer}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Sources & References</h3>
                    {selectedItem.sources.map((source, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span>{getSourceIcon(source.type)}</span>
                            <h4 className="font-medium">{source.title}</h4>
                          </div>
                          <Badge variant="outline" className={getCredibilityColor(source.credibility)}>
                            {source.credibility} credibility
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{source.excerpt}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold">Related Questions</h3>
                    <div className="space-y-2">
                      {selectedItem.relatedQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => {
                            setSelectedItem(null);
                            handleQuestionClick(question);
                          }}
                        >
                          <MessageCircle className="mr-2 w-4 h-4" />
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Knowledge;