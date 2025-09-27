import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, FileText, Mic, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { ApiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Advisory: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await ApiService.ragQuery(query);
      setResponse(result);
      toast({ title: "Query Processed", description: "AI analysis complete" });
    } catch (error) {
      toast({ title: "Query Error", description: "Please try again", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
                 className="text-3xl font-bold text-gradient">
        AI Financial Advisory 🧠
      </motion.h1>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Ask Your Financial Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Ask about investments, tax planning, insurance..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
            />
            <Button onClick={handleQuery} disabled={isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {response && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-success" />
                <Badge variant="secondary">Confidence: {((response.data?.confidence_score || 0.92) * 100).toFixed(0)}%</Badge>
              </div>
              <p className="text-sm leading-relaxed">{response.data?.answer}</p>
              
              {response.data?.relevant_documents && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Sources:</p>
                  {response.data.relevant_documents.slice(0, 2).map((doc: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      <span>{doc.source}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <div className="text-center">
            <Button variant="voice" onClick={() => toast({ title: "Voice Assistant", description: "Say 'Hey Creda' followed by your question" })}>
              <Mic className="mr-2" /> Use Voice Assistant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Advisory;