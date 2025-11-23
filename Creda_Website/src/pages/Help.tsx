import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Book, 
  Video, 
  FileText,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  Mic,
  DollarSign,
  Target,
  PieChart,
  Calculator
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';

const Help: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const quickHelp = [
    {
      title: 'Voice Commands',
      description: 'Learn how to use voice commands',
      icon: <Mic className="w-5 h-5" />,
      action: () => {}
    },
    {
      title: 'Portfolio Management',
      description: 'Understand portfolio optimization',
      icon: <PieChart className="w-5 h-5" />,
      action: () => {}
    },
    {
      title: 'Budget Planning',
      description: 'Create and manage budgets',
      icon: <Calculator className="w-5 h-5" />,
      action: () => {}
    },
    {
      title: 'Investment Goals',
      description: 'Set and track financial goals',
      icon: <Target className="w-5 h-5" />,
      action: () => {}
    }
  ];

  const faqData = [
    {
      question: 'How do I use voice commands with CREDA?',
      answer: 'Say "Hey CREDA" to activate the voice assistant, then give commands like "show my portfolio", "optimize my budget", or "check my financial health". CREDA supports multiple Indian languages including Hindi, Tamil, Bengali, and more.'
    },
    {
      question: 'How is my portfolio optimized?',
      answer: 'CREDA uses Modern Portfolio Theory and machine learning algorithms to optimize your investments based on your risk tolerance, investment horizon, and financial goals. The system considers factors like age, income, and dependents to create personalized allocations.'
    },
    {
      question: 'Is my financial data secure?',
      answer: 'Yes, CREDA uses bank-level encryption and security measures. Your data is encrypted both in transit and at rest. We follow RBI guidelines and never share your personal financial information with third parties.'
    },
    {
      question: 'How accurate are the financial recommendations?',
      answer: 'Our AI models are trained on comprehensive financial data and regulatory guidelines from SEBI, RBI, and IRDAI. However, recommendations are for informational purposes only and should not replace professional financial advice.'
    },
    {
      question: 'Can I export my financial data?',
      answer: 'Yes, you can export your data anytime from the Settings page. We provide data in multiple formats including PDF reports and CSV files for your records.'
    },
    {
      question: 'How do I set up investment goals?',
      answer: 'Go to the Goals section and click "Create Goal". Specify your target amount, timeline, and goal type (retirement, house, education, etc.). CREDA will suggest optimal investment strategies to achieve your goals.'
    },
    {
      question: 'What languages does CREDA support?',
      answer: 'CREDA supports 11+ Indian languages including Hindi, English, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and Urdu for both voice commands and interface.'
    },
    {
      question: 'How often should I rebalance my portfolio?',
      answer: 'CREDA monitors your portfolio continuously and sends alerts when rebalancing is needed (typically when allocation drifts more than 5% from target). Generally, rebalancing quarterly or semi-annually is recommended.'
    }
  ];

  const contactMethods = [
    {
      title: 'Email Support',
      description: 'Get help via email',
      icon: <Mail className="w-5 h-5" />,
      contact: 'support@creda.ai',
      action: () => window.open('mailto:support@creda.ai')
    },
    {
      title: 'Phone Support',
      description: '24/7 customer support',
      icon: <Phone className="w-5 h-5" />,
      contact: '+91-800-CREDA-AI',
      action: () => {}
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: <MessageCircle className="w-5 h-5" />,
      contact: 'Available 9 AM - 9 PM IST',
      action: () => {
        toast({
          title: "Live Chat",
          description: "Chat feature will be available soon!",
        });
      }
    }
  ];

  const resources = [
    {
      title: 'Getting Started Guide',
      description: 'Complete guide to using CREDA',
      type: 'Article',
      icon: <FileText className="w-5 h-5" />,
      url: '#'
    },
    {
      title: 'Voice Commands Tutorial',
      description: 'Learn all voice commands',
      type: 'Video',
      icon: <Video className="w-5 h-5" />,
      url: '#'
    },
    {
      title: 'Investment Basics',
      description: 'Understanding investments in India',
      type: 'Course',
      icon: <Book className="w-5 h-5" />,
      url: '#'
    },
    {
      title: 'Tax Planning Guide',
      description: 'Optimize your taxes with CREDA',
      type: 'Guide',
      icon: <FileText className="w-5 h-5" />,
      url: '#'
    }
  ];

  const handleContactSupport = () => {
    toast({
      title: "Support Request",
      description: "Our team will get back to you within 24 hours.",
    });
  };

  const filteredFaq = faqData.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gradient flex items-center justify-center gap-3">
          <HelpCircle className="w-10 h-10" />
          Help & Support
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find answers to your questions, learn how to use CREDA effectively, and get support when you need it.
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search for help articles, tutorials, or FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </motion.div>

      {/* Quick Help */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold mb-6">Quick Help</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickHelp.map((item, index) => (
            <Card key={index} className="glass-effect hover:shadow-glow transition-all cursor-pointer" onClick={item.action}>
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center dark:text-white text-foreground mx-auto">
                  {item.icon}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Find quick answers to common questions about CREDA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredFaq.map((faq, index) => (
              <Collapsible key={index} open={openFaq === index} onOpenChange={() => setOpenFaq(openFaq === index ? null : index)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto text-left"
                  >
                    <span className="font-medium">{faq.question}</span>
                    {openFaq === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 text-muted-foreground">
                    {faq.answer}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Resources & Tutorials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold mb-6">Resources & Tutorials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource, index) => (
            <Card key={index} className="glass-effect hover:shadow-glow transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center dark:text-white text-foreground">
                    {resource.icon}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{resource.title}</h3>
                      <Badge variant="outline">{resource.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      View {resource.type}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Need personalized help? Reach out to our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactMethods.map((method, index) => (
                <div key={index} className="text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center dark:text-white text-foreground mx-auto">
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{method.title}</h3>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                    <p className="text-sm font-medium mt-1">{method.contact}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={method.action}>
                    Contact
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Card className="glass-effect">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Was this helpful?</h3>
            <p className="text-muted-foreground mb-4">
              Help us improve our documentation and support
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button key={star} variant="ghost" size="sm">
                  <Star className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Help;