import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  Twitter, 
  Linkedin, 
  Github, 
  Mail, 
  Phone, 
  MapPin,
  Heart
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LandingFooter: React.FC = () => {
  const { t } = useLanguage();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Voice Assistant', href: '/voice' },
        { label: 'Portfolio', href: '/portfolio' },
        { label: 'Analytics', href: '/analytics' },
        { label: 'Security', href: '/security' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press', href: '/press' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '/contact' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Documentation', href: '/docs' },
        { label: 'API Reference', href: '/api' },
        { label: 'Community', href: '/community' },
        { label: 'Status', href: '/status' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'Compliance', href: '/compliance' },
        { label: 'Licenses', href: '/licenses' }
      ]
    }
  ];

  return (
    <footer className="bg-gradient-to-r from-primary/10 via-background to-accent/10 border-t border-border/50">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-gradient">CREDA</span>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
                Empowering India's financial future with AI-powered multilingual voice assistance and advanced portfolio management.
              </p>
              <div className="flex items-center space-x-4">
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <Github className="w-5 h-5" />
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-foreground text-lg">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t border-border/50 mb-8"
        >
          <div className="flex items-center space-x-3 text-muted-foreground">
            <Mail className="w-5 h-5 text-primary" />
            <span>support@creda.ai</span>
          </div>
          <div className="flex items-center space-x-3 text-muted-foreground">
            <Phone className="w-5 h-5 text-primary" />
            <span>+91 98765 43210</span>
          </div>
          <div className="flex items-center space-x-3 text-muted-foreground">
            <MapPin className="w-5 h-5 text-primary" />
            <span>Mumbai, India</span>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/50 space-y-4 md:space-y-0"
        >
          <div className="flex items-center space-x-2 text-muted-foreground">
            <span>© 2024 CREDA. Made with</span>
            <Heart className="w-4 h-4 text-error fill-current" />
            <span>for India's financial future</span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span>🇮🇳 Proudly Indian</span>
            <span>•</span>
            <span>🔒 Bank-Grade Security</span>
            <span>•</span>
            <span>🌐 11+ Languages</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default LandingFooter;