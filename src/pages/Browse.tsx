import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2, MapPin, Calendar, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Browse = () => {
  const { role, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [sitters, setSitters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const loadUserAndData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/login");
          return;
        }

        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        setUserProfile(profile);

        // Check if user is paid
        if (!profile?.is_paid) {
          toast({
            title: "Membership Required",
            description: "Please complete your payment to access this feature.",
            variant: "destructive",
          });
          navigate("/register");
          return;
        }

        if (role === "homeowner") {
          // Load verified sitters
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("is_verified", true)
            .eq("is_paid", true);

          if (error) throw error;

          // Filter sitters by checking user_roles
          const sittersData = [];
          for (const profile of data || []) {
            const { data: roles } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", profile.user_id)
              .eq("role", "sitter")
              .single();

            if (roles) {
              sittersData.push(profile);
            }
          }

          setSitters(sittersData);
        } else if (role === "sitter") {
          // Load active listings
          const { data, error } = await supabase
            .from("listings")
            .select(`
              *,
              profiles:owner_id (name, photo_url)
            `)
            .eq("status", "active")
            .order("created_at", { ascending: false });

          if (error) throw error;
          setListings(data || []);
        }
      } catch (error: any) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!roleLoading) {
      loadUserAndData();
    }
  }, [role, roleLoading, navigate, toast]);

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 bg-muted/50">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {role === "homeowner" ? "Find House Sitters" : "Browse Opportunities"}
            </h1>
            <p className="text-muted-foreground">
              {role === "homeowner" 
                ? "Connect with verified and trusted house sitters"
                : "Discover house sitting opportunities across Australia"}
            </p>
          </div>

          {role === "homeowner" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sitters.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No verified sitters available yet.</p>
                  </CardContent>
                </Card>
              ) : (
                sitters.map((sitter) => (
                  <Card key={sitter.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        {sitter.photo_url ? (
                          <img 
                            src={sitter.photo_url} 
                            alt={sitter.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl">{sitter.name[0]}</span>
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-xl">{sitter.name}</CardTitle>
                          {sitter.ndis_certified && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              NDIS Certified
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {sitter.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {sitter.bio}
                        </p>
                      )}
                      {sitter.experience && (
                        <p className="text-sm mb-2">
                          <strong>Experience:</strong> {sitter.experience}
                        </p>
                      )}
                      {sitter.skills && sitter.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {sitter.skills.map((skill: string, idx: number) => (
                            <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      <Button className="w-full">Contact Sitter</Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {role === "sitter" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No active listings available yet.</p>
                  </CardContent>
                </Card>
              ) : (
                listings.map((listing) => (
                  <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{listing.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {listing.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(listing.start_date).toLocaleDateString()} - {new Date(listing.end_date).toLocaleDateString()}
                        </div>
                        {listing.pets && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Heart className="h-4 w-4" />
                            {listing.pets.length} pet(s) to care for
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {listing.description}
                      </p>
                      <Button className="w-full">Apply Now</Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Browse;
