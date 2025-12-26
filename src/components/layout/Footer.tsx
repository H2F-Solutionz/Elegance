import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, X } from 'lucide-react';

const Footer: React.FC = () => {
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOwnerModalOpen(false);
    };
    if (isOwnerModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOwnerModalOpen]);

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
      {/* Profile Image Popup */}
      {isOwnerModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setIsOwnerModalOpen(false)}
        >
          {/* Blurred overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
          
          {/* Circular image container */}
          <div 
            className="relative z-10 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-56 w-56 sm:h-72 sm:w-72 md:h-80 md:w-80 rounded-full overflow-hidden border-4 border-primary shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600"
                alt="Lajithan - Founder"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Close button on edge */}
            <button
              onClick={() => setIsOwnerModalOpen(false)}
              className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-charcoal border-2 border-primary text-cream flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

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
            
            {/* Owner Image - Click to open popup */}
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
