import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Shield, Heart, Users, CheckCircle2 } from "lucide-react";
import { ClientPhotosCarousel } from "@/components/ClientPhotosCarousel";
import LocationMap from "@/components/LocationMap";

type Listing = {
  id: string;
  title: string;
  type: 'house_sit' | 'sitter';
  suburb: string;
  latitude: number;
  longitude: number;
};

// Mock data for demonstration
const mockListings: Listing[] = [
  {
    id: '1',
    title: '2-Week House Sit in Carlton',
    type: 'house_sit',
    suburb: 'Carlton, VIC',
    latitude: -37.800,
    longitude: 144.966,
  },
  {
    id: '2',
    title: 'Pet-Loving Sitter in Brunswick',
    type: 'sitter',
    suburb: 'Brunswick, VIC',
    latitude: -37.770,
    longitude: 144.961,
  },
  {
    id: '3',
    title: 'House Sit Available in St Kilda',
    type: 'house_sit',
    suburb: 'St Kilda, VIC',
    latitude: -37.867,
    longitude: 144.981,
  },
  {
    id: '4',
    title: 'Experienced Sitter in Fitzroy',
    type: 'sitter',
    suburb: 'Fitzroy, VIC',
    latitude: -37.800,
    longitude: 144.978,
  },
  {
    id: '5',
    title: '3-Week Sit in Richmond',
    type: 'house_sit',
    suburb: 'Richmond, VIC',
    latitude: -37.823,
    longitude: 144.998,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-hero">
          <div className="absolute inset-0 bg-black/20" />
          <div className="container relative py-24 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Reliable Holiday Housesitter
                </h1>
                <p className="text-xl text-white/90">
                  Connect with verified, caring sitters for your home and beloved pets. Peace of mind while you're away.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                      Join Now
                    </Button>
                  </Link>
                  <Link to="/how-it-works">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white text-white hover:bg-white/20">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <ClientPhotosCarousel />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose Us?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We make finding the perfect house sitter simple, safe, and stress-free
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 hover:shadow-medium transition-shadow">
                <CardContent className="pt-6">
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Verified Sitters</h3>
                  <p className="text-muted-foreground">
                    Every sitter is personally verified by our team through ID checks and phone interviews
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-medium transition-shadow">
                <CardContent className="pt-6">
                  <Heart className="h-12 w-12 text-secondary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Caring Community</h3>
                  <p className="text-muted-foreground">
                    Join a trusted community of pet lovers and responsible house sitters
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-medium transition-shadow">
                <CardContent className="pt-6">
                  <Users className="h-12 w-12 text-accent mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Direct Communication</h3>
                  <p className="text-muted-foreground">
                    Message and connect directly with potential sitters before making decisions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Find House Sits and Sitters on the Map</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore current sits and trusted sitters in your area
              </p>
            </div>
            <LocationMap listings={mockListings} />
            <div className="mt-8 text-center">
              <Link to="/browse">
                <Button size="lg">Browse All Listings</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We connect trusted homeowners with reliable house sitters through a secure, verified platform
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Register & Submit Documents</h3>
                  <p className="text-muted-foreground">
                    Create your account and upload your Australian driver's license or passport. Choose whether you're a homeowner looking for a sitter or a sitter seeking opportunities.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Personal Verification Process</h3>
                  <p className="text-muted-foreground">
                    Our team reviews your documents and conducts a personal phone interview to verify your identity and suitability. We take security seriously to protect our community.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Complete Your Membership</h3>
                  <p className="text-muted-foreground">
                    Pay the annual membership fee of $75 (with 20% supporting local animal charities). Once verified and paid, you're ready to connect with our community.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Connect & Arrange Your Sit</h3>
                  <p className="text-muted-foreground">
                    Homeowners post listings, sitters browse and apply. Message directly, discuss requirements, and arrange the perfect house sitting experience for everyone involved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">For Homeowners</h2>
                <ul className="space-y-4">
                  {[
                    "Find trusted sitters for your pets and home",
                    "Screen multiple applicants for each sit",
                    "Direct messaging with potential sitters",
                    "Peace of mind with verified members only",
                    "Supporting local animal charity with every booking"
                  ].map((benefit, index) => (
                    <li key={index} className="flex gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="mt-8 inline-block">
                  <Button size="lg">Post a Listing</Button>
                </Link>
              </div>

              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">For Sitters</h2>
                <ul className="space-y-4">
                  {[
                    "Free accommodation while caring for pets",
                    "Experience different locations across Australia",
                    "Build your reputation with reviews",
                    "Flexible opportunities year-round",
                    "Join a supportive community of sitters"
                  ].map((benefit, index) => (
                    <li key={index} className="flex gap-3">
                      <CheckCircle2 className="h-6 w-6 text-secondary flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="mt-8 inline-block">
                  <Button size="lg" variant="secondary">Apply for Sits</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="container relative text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
              Join our trusted community today and discover the perfect house sitting arrangement
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Join Now - $75/year
              </Button>
            </Link>
            <p className="mt-4 text-sm text-white/75">
              20% of membership fees support local animal charities
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
