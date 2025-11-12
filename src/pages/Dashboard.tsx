import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { Users, Calendar, CheckCircle, Clock } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const { role, loading: roleLoading } = useUserRole();
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

    const fetchAdminStats = async () => {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch verified users
      const { count: verifiedUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_verified", true);

      // Fetch total bookings
      const { count: totalBookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true });

      // Fetch pending bookings
      const { count: pendingBookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Fetch recent bookings with details
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`
          *,
          sitter:profiles!bookings_sitter_id_fkey(name),
          listing:listings(title, location)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalUsers: totalUsers || 0,
        verifiedUsers: verifiedUsers || 0,
        totalBookings: totalBookings || 0,
        pendingBookings: pendingBookings || 0,
      });

      setRecentBookings(bookingsData || []);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/login");
      } else if (session?.user) {
        // Fetch admin stats after auth state changes
        setTimeout(() => {
          fetchAdminStats();
        }, 0);
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

  if (isLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Admin Dashboard View
  if (role === "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container py-12">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                  Welcome back, {profile?.name}
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Log Out
              </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered members
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Verified members
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    All time bookings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting approval
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div className="space-y-1">
                          <p className="font-medium">{booking.listing?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Sitter: {booking.sitter?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Location: {booking.listing?.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No bookings yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Regular User Dashboard View
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {profile?.name}!</h1>
              <p className="text-muted-foreground mt-2">
                Role: <span className="capitalize font-medium">{role}</span>
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

            {role === "homeowner" && (
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

            {role === "sitter" && (
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
