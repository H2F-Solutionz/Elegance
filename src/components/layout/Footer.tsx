import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, X } from 'lucide-react';

const Footer: React.FC = () => {
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (isOwnerModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOwnerModalOpen]);

  // Handle ESC key to close modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOwnerModalOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOwnerModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOwnerModalOpen, handleKeyDown]);

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'Youtube' },
  ];

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Shop', href: '/categories/women' },
    { name: 'Hot Sales', href: '/hot-sales' },
    { name: 'Contact', href: '/contact' },
  ];

  const customerService = [
    { name: 'FAQ', href: '/faq' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns', href: '/returns' },
    { name: 'Size Guide', href: '/size-guide' },
  ];

  return (
    <footer className="bg-charcoal text-cream">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold text-gradient-gold">Elegance</h3>
            <p className="font-sans text-cream/70 text-sm leading-relaxed">
              Crafting timeless jewelry pieces that celebrate your most precious moments. 
              Each piece tells a story of elegance and sophistication.
            </p>
            
            {/* Owner Image */}
            <button 
              onClick={() => setIsOwnerModalOpen(true)}
              className="flex items-center gap-3 group mt-4"
            >
              <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary transition-transform duration-300 group-hover:scale-110">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                  alt="Owner"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Lajithan</p>
                <p className="text-xs text-cream/60">Founder</p>
              </div>
            </button>

            {/* Enhanced Owner Modal */}
            {isOwnerModalOpen && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center"
                onClick={() => setIsOwnerModalOpen(false)}
              >
                {/* Backdrop with blur */}
                <div 
                  className="absolute inset-0 bg-charcoal/80 backdrop-blur-md animate-fade-in"
                  style={{ animationDuration: '0.3s' }}
                />
                
                {/* Enlarged circular image */}
                <div 
                  className="relative z-10 animate-scale-in"
                  style={{ animationDuration: '0.4s', animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-[70vw] h-[70vw] max-w-[400px] max-h-[400px] md:w-[50vw] md:h-[50vw] md:max-w-[500px] md:max-h-[500px] lg:max-w-[550px] lg:max-h-[550px] rounded-full overflow-hidden border-4 border-primary shadow-2xl shadow-primary/30">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800"
                      alt="Lajithan - Founder"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Close button on top-right edge */}
                  <button
                    onClick={() => setIsOwnerModalOpen(false)}
                    className="absolute -top-2 -right-2 md:top-2 md:right-2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-charcoal border-2 border-primary text-cream flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:scale-110"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5 md:h-6 md:w-6" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="font-sans text-sm text-cream/70 hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {customerService.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="font-sans text-sm text-cream/70 hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="font-sans text-sm text-cream/70">
                  123 Jewelry Lane, Diamond District, Mumbai 400001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="font-sans text-sm text-cream/70 hover:text-primary transition-colors"
                >
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a
                  href="mailto:info@elegance.com"
                  className="font-sans text-sm text-cream/70 hover:text-primary transition-colors"
                >
                  info@elegance.com
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="h-10 w-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-cream/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-sans text-xs text-cream/50">
              © {new Date().getFullYear()} Elegance Jewelry. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="font-sans text-xs text-cream/50 hover:text-cream transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="font-sans text-xs text-cream/50 hover:text-cream transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
