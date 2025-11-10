import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      // Fetch profile
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(profileData);
      }

      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {profile?.name}!</h1>
              <p className="text-muted-foreground mt-2">
                Role: <span className="capitalize font-medium">{profile?.role}</span>
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Log Out
            </Button>
          </div>

          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Verification Status:</span>
                <span className={`font-semibold ${profile?.is_verified ? 'text-accent' : 'text-muted-foreground'}`}>
                  {profile?.is_verified ? "✓ Verified" : "Pending Verification"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment Status:</span>
                <span className={`font-semibold ${profile?.is_paid ? 'text-accent' : 'text-muted-foreground'}`}>
                  {profile?.is_paid ? "✓ Paid" : "Payment Pending"}
                </span>
              </div>
              {!profile?.is_verified && (
                <p className="text-sm text-muted-foreground">
                  Our team will contact you soon to verify your account.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete your profile to start connecting with others
                </p>
                <Button className="w-full" onClick={() => navigate("/profile/edit")}>
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {profile?.role === "homeowner" && (
              <Card>
                <CardHeader>
                  <CardTitle>Post a Listing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {profile?.is_verified && profile?.is_paid 
                      ? "Create a new house sitting opportunity"
                      : "Complete verification and payment to post listings"}
                  </p>
                  <Button 
                    className="w-full" 
                    disabled={!profile?.is_verified || !profile?.is_paid}
                    onClick={() => navigate("/listings/new")}
                  >
                    Create Listing
                  </Button>
                </CardContent>
              </Card>
            )}

            {profile?.role === "sitter" && (
              <Card>
                <CardHeader>
                  <CardTitle>Find Sits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {profile?.is_verified && profile?.is_paid 
                      ? "Browse available house sitting opportunities"
                      : "Complete verification and payment to apply for sits"}
                  </p>
                  <Button 
                    className="w-full"
                    disabled={!profile?.is_verified || !profile?.is_paid}
                    onClick={() => navigate("/listings")}
                  >
                    Browse Listings
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
