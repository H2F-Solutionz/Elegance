import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const Footer: React.FC = () => {
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

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
            <Dialog open={isOwnerModalOpen} onOpenChange={setIsOwnerModalOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-3 group mt-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary transition-transform duration-300 group-hover:scale-110">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                      alt="Owner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Priya Sharma</p>
                    <p className="text-xs text-cream/60">Founder & Designer</p>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md p-0 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600"
                  alt="Priya Sharma - Founder"
                  className="w-full h-auto"
                />
                <div className="p-6">
                  <h4 className="font-serif text-xl font-bold mb-2">Priya Sharma</h4>
                  <p className="text-muted-foreground text-sm">
                    With over 20 years of experience in jewelry design, Priya founded Elegance 
                    to bring traditional craftsmanship to modern jewelry lovers.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
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
