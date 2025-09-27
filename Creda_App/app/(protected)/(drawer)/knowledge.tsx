import React, { useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, View, TextInput } from 'react-native';
import { H4, P, Small, Title } from '~/components/ui/typography';
import { Container } from '~/components/Container';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Search,
  BookOpen,
  FileText,
  MessageCircle,
  TrendingUp,
  Shield,
  Building2,
  Lightbulb,
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react-native';

// Mock data for demonstration
const mockQueries = [
  {
    id: 1,
    query: "What are SEBI guidelines for mutual fund investments?",
    answer: "According to SEBI guidelines, mutual fund investments must comply with strict regulatory frameworks. Mutual funds are required to maintain transparency in their operations, provide regular disclosures to investors, and follow prescribed investment limits across various asset classes.",
    confidence_score: 0.92,
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    relevant_documents: [
      {
        content: "SEBI regulations state that mutual funds must maintain minimum asset under management...",
        source: "sebi_guidelines_2024.pdf",
        relevance_score: 0.89
      },
      {
        content: "Investment limits for equity funds are capped at 10% per single stock...",
        source: "sebi_mutual_fund_regulations.pdf",
        relevance_score: 0.85
      }
    ]
  },
];

const popularTopics = [
  { icon: TrendingUp, title: "Investment Strategies", queries: 156 },
  { icon: Shield, title: "Risk Management", queries: 142 },
  { icon: Building2, title: "Banking Regulations", queries: 98 },
  { icon: FileText, title: "Tax Planning", queries: 87 }
];

const recentSources = [
  { name: "RBI Circular 2024", type: "Regulatory", updated: "2 days ago" },
  { name: "SEBI Guidelines", type: "Investment", updated: "1 week ago" },
  { name: "Income Tax Act", type: "Taxation", updated: "3 days ago" },
  { name: "Insurance Regulations", type: "Insurance", updated: "5 days ago" }
];

export default function Knowledge() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [queryHistory, setQueryHistory] = useState(mockQueries);

  const handleSearch = async () => {
    console.log('Searching for:', searchQuery);
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      const response = await fetch('https://fafe2d2eb319.ngrok-free.app/rag_query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
        },
        body: JSON.stringify({
          query: searchQuery,
          top_k: 5 // number of relevant documents to consider
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const newQuery = {
          id: Date.now(),
          query: searchQuery,
          answer: result.data.answer,
          confidence_score: result.data.confidence_score,
          timestamp: new Date(),
          relevant_documents: result.data.relevant_documents || []
        };

        setQueryHistory([newQuery, ...queryHistory]);
        setSearchQuery('');
      } else {
        // Handle API error
        console.error('API returned error:', result);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Error calling RAG API:', error);

      // Fallback to simulated response in case of error
      const fallbackQuery = {
        id: Date.now(),
        query: searchQuery,
        answer: "Sorry, there was an error processing your query. Please try again later.",
        confidence_score: 0.0,
        timestamp: new Date(),
        relevant_documents: []
      };

      setQueryHistory([fallbackQuery, ...queryHistory]);
      setSearchQuery('');
    } finally {
      setIsSearching(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-success';
    if (score >= 0.7) return 'text-warning';
    return 'text-destructive';
  };

  const getConfidenceIcon = (score: number) => {
    if (score >= 0.9) return <CheckCircle size={16} className="text-success" />;
    if (score >= 0.7) return <AlertCircle size={16} className="text-warning" />;
    return <AlertCircle size={16} className="text-destructive" />;
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <Title className="px-4 mt-4">Knowledge & Sources</Title>

      {/* Search Section */}
      <View className="px-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Ask Financial Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <P className="text-muted-foreground mb-4">
              Get expert advice backed by official financial documents and regulations
            </P>

            <View className="flex-row items-center bg-background border border-border rounded-lg px-3 py-2 mb-3">
              <Search size={20} className="text-muted-foreground mr-3" />
              <TextInput
                className="flex-1 text-foreground"
                placeholder="Ask about investments, taxes, regulations..."
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
                onSubmitEditing={handleSearch}
              />
            </View>

            <TouchableOpacity
              className={`py-3 px-4 rounded-lg flex-row items-center justify-center ${isSearching ? 'bg-muted' : 'bg-primary'
                }`}
              onPress={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <Clock size={16} className="text-muted-foreground mr-2" />
              ) : (
                <MessageCircle size={16} className="text-primary-foreground mr-2" />
              )}
              <P className={isSearching ? 'text-muted-foreground' : 'text-primary-foreground font-medium'}>
                {isSearching ? 'Searching...' : 'Ask Question'}
              </P>
            </TouchableOpacity>
          </CardContent>
        </Card>
      </View>


      <View className="px-4 mt-4">
        <H4 className="mb-3">Recent Questions</H4>
        {queryHistory.length === 0 ? (
          <Card>
            <CardContent className="items-center py-6">
              <BookOpen size={48} className="text-muted-foreground mb-3" />
              <P className="text-muted-foreground text-center mb-2">No questions asked yet</P>
              <Small className="text-muted-foreground text-center">
                Start by asking a financial question above
              </Small>
            </CardContent>
          </Card>
        ) : (
          queryHistory.map((item) => (
            <Card key={item.id} className="mb-3">
              <CardHeader>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <CardTitle className="text-base">{item.query}</CardTitle>
                  </View>
                  <View className="flex-row items-center">
                    {getConfidenceIcon(item.confidence_score)}
                    <Small className={`ml-1 ${getConfidenceColor(item.confidence_score)}`}>
                      {Math.round(item.confidence_score * 100)}%
                    </Small>
                  </View>
                </View>
                <View className="flex-row items-center mt-2">
                  <Clock size={14} className="text-muted-foreground mr-1" />
                  <Small className="text-muted-foreground">
                    {formatTimeAgo(item.timestamp)}
                  </Small>
                </View>
              </CardHeader>
              <CardContent>
                <P className="mb-4">{item.answer}</P>

                {item.relevant_documents && item.relevant_documents.length > 0 && (
                  <View>
                    <Small className="text-muted-foreground font-medium mb-2">Sources:</Small>
                    {item.relevant_documents.map((doc, index) => (
                      <View
                        key={index}
                        className="bg-muted rounded-lg p-3 mb-2"
                      >
                        <View className="flex-row items-center justify-between mb-1">
                          <Small className="font-medium">{doc.source}</Small>
                          <View className="flex-row items-center">
                            <Star size={12} className="text-warning mr-1" />
                            <Small className="text-muted-foreground">
                              {Math.round(doc.relevance_score * 100)}%
                            </Small>
                          </View>
                        </View>
                        <Small className="text-muted-foreground italic">
                          "{doc.content}"
                        </Small>
                      </View>
                    ))}
                  </View>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </View>

      {/* Popular Topics */}
      <View className="px-4 mt-4">
        <H4 className="mb-3">Popular Topics</H4>
        <View className="flex-row flex-wrap gap-3">
          {popularTopics.map((topic, index) => (
            <TouchableOpacity
              key={index}
              className="bg-card border border-border rounded-xl p-4 flex-1 min-w-0"
              style={{ minWidth: '48%' }}
            >
              <topic.icon size={24} className="text-primary mb-2" />
              <P className="font-medium mb-1">{topic.title}</P>
              <Small className="text-muted-foreground">{topic.queries} queries</Small>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Sources */}
      <View className="px-4 mt-4">
        <H4 className="mb-3">Recent Sources</H4>
        <Card>
          <CardContent className="p-0">
            {recentSources.map((source, index) => (
              <View
                key={index}
                className={`p-4 flex-row items-center justify-between ${index < recentSources.length - 1 ? 'border-b border-border' : ''
                  }`}
              >
                <View className="flex-row items-center flex-1">
                  <FileText size={20} className="text-muted-foreground mr-3" />
                  <View className="flex-1">
                    <P className="font-medium">{source.name}</P>
                    <Small className="text-muted-foreground">{source.type}</Small>
                  </View>
                </View>
                <Small className="text-muted-foreground">{source.updated}</Small>
              </View>
            ))}
          </CardContent>
        </Card>
      </View>

      {/* Bottom spacing */}
      <View className="h-6" />
    </ScrollView>
  );
}

