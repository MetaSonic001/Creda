import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Mic, 
  TrendingUp, 
  Shield, 
  Globe, 
  Zap, 
  Brain,
  ChevronRight,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import ReliableVoiceAssistant from '@/components/ReliableVoiceAssistant';
import LandingNavbar from '@/components/layout/LandingNavbar';
import LandingFooter from '@/components/layout/LandingFooter';

const LandingPage: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Mic className="w-8 h-8 text-voice-active" />,
      title: "Multilingual Voice Interface",
      description: "Speak naturally in Hindi, English, or any of 11+ Indian languages. Our AI understands your accent and dialect perfectly.",
      stats: "11+ Languages Supported"
    },
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: "AI-Powered Portfolio Optimization", 
      description: "Nobel Prize-winning Markowitz theory adapted for Indian markets. Get personalized investment strategies in under 0.1 seconds.",
      stats: "99.9% Mathematical Accuracy"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-success" />,
      title: "Smart Budget Learning",
      description: "Multi-Armed Bandit algorithm learns your spending patterns and continuously improves your budget recommendations.",
      stats: "Self-Learning Budget AI"
    },
    {
      icon: <Shield className="w-8 h-8 text-warning" />,
      title: "Regulatory Compliance",
      description: "All advice backed by official RBI, SEBI, and IRDAI guidelines. Get authoritative answers from 50+ financial documents.",
      stats: "50+ Official Documents"
    },
    {
      icon: <Zap className="w-8 h-8 text-secondary" />,
      title: "Lightning Fast Processing",
      description: "Sub-3 second voice processing, <0.1s portfolio calculations, <0.5s financial queries. Built for speed.",
      stats: "<3s Voice Response"
    },
    {
      icon: <Globe className="w-8 h-8 text-accent" />,
      title: "Indian Market Expertise",
      description: "Designed specifically for Indian investors. Understands PPF, ELSS, chit funds, and local investment instruments.",
      stats: "100% Indian-Focused"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer, Mumbai",
      content: "Speaking in Hindi and getting perfect investment advice feels magical. Creda understood my Marwari accent better than my bank manager!",
      rating: 5,
      language: "Hindi + English"
    },
    {
      name: "Rajesh Kumar",
      role: "Business Owner, Chennai", 
      content: "The portfolio optimization is incredible. It suggested exactly what my financial advisor recommended, but in Tamil and instantly.",
      rating: 5,
      language: "Tamil"
    },
    {
      name: "Anita Patel",
      role: "Doctor, Ahmedabad",
      content: "Finally, a finance app that understands Gujarati financial terms. The voice assistant feels like talking to a knowledgeable friend.",
      rating: 5,
      language: "Gujarati"
    }
  ];

  const stats = [
    { value: "11+", label: "Languages Supported" },
    { value: "<3s", label: "Voice Response Time" },
    { value: "50+", label: "Official Documents" },
    { value: "99.9%", label: "Calculation Accuracy" }
  ];

  return (
    <div className="min-h-screen">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="relative container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <Badge variant="secondary" className="mb-4 text-sm font-medium">
              🚀 Powered by Advanced AI & Indian Market Data
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-gradient">{t('hero.title')}</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="xl" variant="hero" asChild>
                <Link to="/dashboard">
                  {t('action.getStarted')} <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button size="xl" variant="glass" asChild>
                <Link to="/voice">
                  <Mic className="mr-2" /> {t('action.tryDemo')}
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              {t('voice.activate')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gradient mb-6">
              Revolutionary AI Finance Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the future of financial management with cutting-edge AI that understands Indian markets and languages.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full glass-effect hover:shadow-glow transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-gradient-primary rounded-lg group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {feature.stats}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice Assistant Demo */}
      <section id="voice-demo" className="py-20 px-4 bg-gradient-card">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
              Meet Creda - Your AI Financial Assistant
            </h2>
            <p className="text-lg text-muted-foreground">
              Try our voice assistant right here. Say "Hey Creda" followed by any financial question in your preferred language.
            </p>
          </motion.div>

          <ReliableVoiceAssistant isCompact={false} />
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
              Loved by Users Across India
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our multilingual users say about their experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full glass-effect hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {testimonial.language}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that works best for your financial journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="relative p-8 glass-effect hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl">Free</CardTitle>
                  <div className="text-3xl font-bold">₹0<span className="text-lg text-muted-foreground">/month</span></div>
                  <CardDescription>Perfect for getting started</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>Basic voice commands</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>Portfolio tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>3 languages supported</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/dashboard">Get Started Free</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="relative p-8 glass-effect hover:shadow-glow transition-all duration-300 border-primary">
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-white">
                  Most Popular
                </Badge>
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl">Pro</CardTitle>
                  <div className="text-3xl font-bold">₹299<span className="text-lg text-muted-foreground">/month</span></div>
                  <CardDescription>Advanced AI-powered features</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>All Free features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>Advanced portfolio optimization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>11+ Indian languages</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>Premium voice responses</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-primary" asChild>
                    <Link to="/dashboard">Start Pro Trial</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="relative p-8 glass-effect hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <div className="text-3xl font-bold">₹999<span className="text-lg text-muted-foreground">/month</span></div>
                  <CardDescription>For institutions & businesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>All Pro features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>Custom integrations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span>White-label options</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/dashboard">Contact Sales</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Financial Future?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of Indians already using AI-powered financial advice in their native language.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="xl" variant="secondary" asChild>
                <Link to="/dashboard">
                  Start Your Journey <ChevronRight className="ml-2" />
                </Link>
              </Button>
              <Button size="xl" variant="glass" asChild>
                <Link to="/voice">
                  <Mic className="mr-2" /> Try Voice Assistant
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 opacity-90">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Free to Start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">11+ Languages</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">SEBI Compliant</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      <LandingFooter />
    </div>
  );
};

export default LandingPage;