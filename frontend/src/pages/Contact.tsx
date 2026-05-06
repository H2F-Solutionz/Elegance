import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });

    setFormData({ name: '', email: '', phone: '', message: '' });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['123 Jewelry Lane', 'Diamond District', 'Mumbai 400001'],
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 98765 43210', '+91 22 1234 5678'],
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['info@elegance.com', 'support@elegance.com'],
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Mon - Sat: 10 AM - 8 PM', 'Sunday: 11 AM - 6 PM'],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us - Elegance Jewelry</title>
        <meta
          name="description"
          content="Get in touch with Elegance Jewelry. Visit our store, call us, or send us a message. We're here to help with all your jewelry needs."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          {/* Hero */}
          <section className="relative h-48 md:h-64 bg-muted overflow-hidden">
            <div className="absolute inset-0 gradient-hero" />
            <div className="relative h-full container mx-auto px-4 flex items-center justify-center">
              <div className="text-center">
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2">
                  Contact Us
                </h1>
                <p className="font-sans text-muted-foreground">
                  We'd love to hear from you
                </p>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-12 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">
                  Send Us a Message
                </h2>
                <p className="font-sans text-muted-foreground mb-8">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        Send Message
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">
                    Get in Touch
                  </h2>
                  <p className="font-sans text-muted-foreground">
                    Visit our showroom or reach out through any of the channels below.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {contactInfo.map((item) => (
                    <div
                      key={item.title}
                      className="p-6 rounded-xl bg-card shadow-soft hover:shadow-medium transition-all duration-300"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-serif text-lg font-semibold mb-2">
                        {item.title}
                      </h3>
                      <div className="space-y-1">
                        {item.details.map((detail, index) => (
                          <p
                            key={index}
                            className="font-sans text-sm text-muted-foreground"
                          >
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Placeholder */}
                <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.259989936906!2d72.87721937520573!3d18.946940882228!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7cf26f4972f07%3A0x2a0d3d4d0e0e0e0e!2sDiamond%20District!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Store Location"
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Contact;
