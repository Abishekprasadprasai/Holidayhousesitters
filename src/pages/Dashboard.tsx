import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
    paidUsers: 0,
    pendingVerification: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    activeListings: 0,
    homeowners: 0,
    sitters: 0,
    recentBookings: [] as any[],
  });
  const [detailedUsers, setDetailedUsers] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<'all' | 'verified' | 'paid'>('all');
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
      if (role !== "admin") return;

      // Fetch all profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*");

      // Fetch all bookings with listing details
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`
          *,
          sitter:profiles!bookings_sitter_id_fkey(name),
          listing:listings(title, location)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch listings
      const { data: listingsData } = await supabase
        .from("listings")
        .select("*");

      // Count homeowners and sitters
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("*");

      const homeowners = rolesData?.filter((r) => r.role === "homeowner").length || 0;
      const sitters = rolesData?.filter((r) => r.role === "sitter").length || 0;

      setStats({
        totalUsers: profilesData?.length || 0,
        verifiedUsers: profilesData?.filter((u) => u.is_verified).length || 0,
        paidUsers: profilesData?.filter((u) => u.is_paid).length || 0,
        pendingVerification: profilesData?.filter((u) => !u.is_verified).length || 0,
        totalBookings: bookingsData?.length || 0,
        pendingBookings: bookingsData?.filter((b) => b.status === "pending").length || 0,
        confirmedBookings: bookingsData?.filter((b) => b.status === "accepted").length || 0,
        activeListings: listingsData?.filter((l) => l.status === "active").length || 0,
        homeowners,
        sitters,
        recentBookings: bookingsData || [],
      });

      // Fetch detailed user information with emails and listings
      if (profilesData && rolesData) {
        const usersWithDetails = await Promise.all(
          profilesData.map(async (profile) => {
            // Get user email from auth
            const { data: { user: authUser } } = await supabase.auth.admin.getUserById(profile.user_id);
            
            // Get user role
            const userRole = rolesData.find((r) => r.user_id === profile.user_id);
            
            // Get user's listings if they're a homeowner
            const { data: userListings } = await supabase
              .from("listings")
              .select("title, status")
              .eq("owner_id", profile.user_id);

            return {
              ...profile,
              email: authUser?.email || "N/A",
              role: userRole?.role || "N/A",
              listings: userListings || [],
            };
          })
        );
        setDetailedUsers(usersWithDetails);
      }
    };

    checkAuth();

    if (!roleLoading && role === "admin") {
      fetchAdminStats();
    }

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
  }, [navigate, role, roleLoading]);

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

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">User Verification</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {stats.pendingVerification} users pending verification
                  </p>
                  <Button onClick={() => navigate("/admin/verify-users")} className="w-full">
                    Verify Users
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${selectedSection === 'all' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedSection('all')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    All users
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${selectedSection === 'verified' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedSection('verified')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Completed verification
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${selectedSection === 'paid' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedSection('paid')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paid Members</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.paidUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    Active subscriptions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeListings}</div>
                  <p className="text-xs text-muted-foreground">
                    Available opportunities
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* User Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Bookings</span>
                      <span className="font-bold">{stats.totalBookings}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending</span>
                      <span className="font-bold text-yellow-600">{stats.pendingBookings}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Accepted</span>
                      <span className="font-bold text-green-600">{stats.confirmedBookings}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Homeowners</span>
                      <span className="font-bold">{stats.homeowners}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">House Sitters</span>
                      <span className="font-bold">{stats.sitters}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Verification</span>
                      <span className="font-bold text-orange-600">{stats.pendingVerification}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Tables - Conditional Rendering */}
            {selectedSection === 'all' && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>All Registered Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Listings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        detailedUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{user.role}</Badge>
                            </TableCell>
                            <TableCell>
                              {user.is_verified ? (
                                <Badge className="bg-green-500">Verified</Badge>
                              ) : (
                                <Badge variant="secondary">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.is_paid ? (
                                <Badge className="bg-blue-500">Paid</Badge>
                              ) : (
                                <Badge variant="outline">Unpaid</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.listings.length > 0 ? (
                                <div className="space-y-1">
                                  {user.listings.map((listing: any, idx: number) => (
                                    <div key={idx} className="text-sm">
                                      {listing.title} <Badge variant="outline" className="ml-1">{listing.status}</Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">No listings</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {selectedSection === 'verified' && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Verified Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Listings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedUsers.filter(u => u.is_verified).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No verified users
                          </TableCell>
                        </TableRow>
                      ) : (
                        detailedUsers.filter(u => u.is_verified).map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{user.role}</Badge>
                            </TableCell>
                            <TableCell>
                              {user.is_paid ? (
                                <Badge className="bg-blue-500">Paid</Badge>
                              ) : (
                                <Badge variant="outline">Unpaid</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.listings.length > 0 ? (
                                <div className="space-y-1">
                                  {user.listings.map((listing: any, idx: number) => (
                                    <div key={idx} className="text-sm">
                                      {listing.title} <Badge variant="outline" className="ml-1">{listing.status}</Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">No listings</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {selectedSection === 'paid' && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Paid Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Listings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedUsers.filter(u => u.is_paid).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No paid members
                          </TableCell>
                        </TableRow>
                      ) : (
                        detailedUsers.filter(u => u.is_paid).map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{user.role}</Badge>
                            </TableCell>
                            <TableCell>
                              {user.is_verified ? (
                                <Badge className="bg-green-500">Verified</Badge>
                              ) : (
                                <Badge variant="secondary">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.listings.length > 0 ? (
                                <div className="space-y-1">
                                  {user.listings.map((listing: any, idx: number) => (
                                    <div key={idx} className="text-sm">
                                      {listing.title} <Badge variant="outline" className="ml-1">{listing.status}</Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">No listings</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Recent Bookings */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Recent Booking Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentBookings.map((booking) => (
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
                            booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
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
