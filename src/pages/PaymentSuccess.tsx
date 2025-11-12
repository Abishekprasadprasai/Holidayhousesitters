import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get("session_id");
        
        if (!sessionId) {
          toast({
            title: "Error",
            description: "No session ID found",
            variant: "destructive",
          });
          navigate("/register");
          return;
        }

        // Check subscription status
        const { data, error } = await supabase.functions.invoke("check-subscription");
        
        if (error) throw error;

        if (data?.is_paid) {
          toast({
            title: "Payment Successful!",
            description: "Your membership is now active. Welcome to Holiday House Sitters!",
          });
        }
      } catch (error: any) {
        console.error("Error verifying payment:", error);
        toast({
          title: "Verification Error",
          description: "Unable to verify payment. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 bg-muted/50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            {isVerifying ? (
              <>
                <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
                <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
                <p className="text-muted-foreground">
                  Please wait while we confirm your membership.
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                <p className="text-muted-foreground mb-6">
                  Your annual membership is now active. You can now access all features and connect with our verified community.
                </p>
                <div className="space-y-2">
                  <Button onClick={() => navigate("/dashboard")} className="w-full">
                    Go to Dashboard
                  </Button>
                  <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                    Return to Home
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
