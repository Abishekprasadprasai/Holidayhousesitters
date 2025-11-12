import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Heart, CheckCircle2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import clientPhoto1 from "@/assets/client-photo-1.jpg";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-hero">
          <div className="absolute inset-0 bg-black/20" />
          <div className="container relative py-20">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                About Holiday House Sitters
              </h1>
              <p className="text-xl text-white/90">
                Connecting caring communities through trusted house and pet sitting services across Australia
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Holiday House Sitters was founded with a simple mission: to create a trusted platform where homeowners can find reliable, caring individuals to look after their homes and beloved pets while they're away.
                  </p>
                  <p>
                    Founded by Karlina, who understands the challenges of finding trustworthy house sitters firsthand, we've built a community based on trust, transparency, and genuine care for animals and homes.
                  </p>
                  <p>
                    What started as a small network has grown into a thriving community of verified homeowners and sitters across Australia, all committed to providing peace of mind and exceptional care.
                  </p>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-large">
                <img 
                  src={clientPhoto1} 
                  alt="Happy client with their pet" 
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Verification Process */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Our Verification Process</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Every member is personally verified to ensure the highest standards of trust and safety
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Identity Verification</h3>
                  <p className="text-muted-foreground">
                    Government-issued ID check to confirm identity and ensure accountability
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Phone Interview</h3>
                  <p className="text-muted-foreground">
                    Personal phone conversation with our team to discuss experience and expectations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Background Check</h3>
                  <p className="text-muted-foreground">
                    Thorough review of references and experience to maintain community standards
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Charity Partnership */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <Heart className="h-16 w-16 text-secondary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6">Giving Back to Our Community</h2>
              <p className="text-xl text-muted-foreground mb-8">
                We believe in supporting the animals we all love. That's why 20% of all membership fees are donated to local animal charities and rescue organizations.
              </p>
              <p className="text-muted-foreground">
                When you join Holiday House Sitters, you're not just finding trusted care for your pets and home – you're also helping animals in need across Australia.
              </p>
            </div>
          </div>
        </section>

        {/* Membership */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">Membership Benefits</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1">Annual Membership - $75/year</h3>
                        <p className="text-muted-foreground">Full access to our platform for 12 months</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1">Verified Community</h3>
                        <p className="text-muted-foreground">Connect only with personally verified members</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1">Direct Messaging</h3>
                        <p className="text-muted-foreground">Communicate directly with potential sitters or homeowners</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1">Unlimited Applications</h3>
                        <p className="text-muted-foreground">Apply to as many sits as you like (sitters) or post multiple listings (homeowners)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1">Support Local Charities</h3>
                        <p className="text-muted-foreground">20% of your membership supports animal welfare organizations</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <Link to="/register">
                      <Button size="lg">Join Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
              <p className="text-muted-foreground mb-8">
                Have questions? We'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
