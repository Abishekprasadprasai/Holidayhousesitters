import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, Upload, Phone, CreditCard, Users } from "lucide-react";

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-hero text-white py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                How It Works
              </h1>
              <p className="text-xl text-white/90">
                A simple, secure process to connect trusted homeowners with reliable house sitters
              </p>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20 bg-background">
          <div className="container">
            <div className="max-w-4xl mx-auto space-y-16">
              {/* Step 1 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl shadow-elegant">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Upload className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-semibold">Register & Submit Documents</h3>
                  </div>
                  <p className="text-muted-foreground text-lg mb-4">
                    Create your account and upload your Australian driver's license or passport. Choose whether you're a homeowner looking for a sitter or a sitter seeking opportunities.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Required Documents:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Australian Driver's License (preferred)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Or valid Australian Passport
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-warm flex items-center justify-center text-white font-bold text-xl shadow-elegant">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="h-6 w-6 text-secondary" />
                    <h3 className="text-2xl font-semibold">Personal Verification Process</h3>
                  </div>
                  <p className="text-muted-foreground text-lg mb-4">
                    Our team reviews your documents and conducts a personal phone interview to verify your identity and suitability. We take security seriously to protect our community.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">What We Verify:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                        Identity verification through photo ID
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                        Phone interview to assess suitability
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                        Background and reference checks
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-elegant">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-semibold">Complete Your Membership</h3>
                  </div>
                  <p className="text-muted-foreground text-lg mb-4">
                    Pay the annual membership fee of $75. Once verified and paid, you're ready to connect with our community.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Membership Benefits:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Full access to our platform for one year
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Unlimited listings and applications
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        20% of your fee supports local animal charities
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xl shadow-elegant">
                  4
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-6 w-6 text-secondary" />
                    <h3 className="text-2xl font-semibold">Connect & Arrange Your Sit</h3>
                  </div>
                  <p className="text-muted-foreground text-lg mb-4">
                    Homeowners post listings, sitters browse and apply. Message directly, discuss requirements, and arrange the perfect house sitting experience for everyone involved.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Getting Started:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                        <strong>Homeowners:</strong> Create detailed listings with your requirements
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                        <strong>Sitters:</strong> Browse available opportunities and apply
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                        <strong>Both:</strong> Communicate directly to find the perfect match
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="container relative text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
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

export default HowItWorks;
