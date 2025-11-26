import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 bg-muted/50">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-muted-foreground">
              Get in touch with our team - we're here to help
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Phone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold mb-2">1800 555 0123</p>
                <p className="text-sm text-muted-foreground">
                  Call us directly for immediate assistance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold mb-2">support@holidayhousesitters.com.au</p>
                <p className="text-sm text-muted-foreground">
                  We'll respond within 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold mb-2">Australia Wide</p>
                <p className="text-sm text-muted-foreground">
                  Serving homeowners and sitters across all states and territories
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">How long does verification take?</h3>
                <p className="text-sm text-muted-foreground">
                  Our team typically completes verification within 2-3 business days after receiving your application and documents.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What happens after I register?</h3>
                <p className="text-sm text-muted-foreground">
                  After registration, our team will review your documents and contact you for a phone interview. Once verified and payment is confirmed, you can start using the platform.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How do I report an issue?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact us immediately via phone or email. For urgent matters, please call us during business hours.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
