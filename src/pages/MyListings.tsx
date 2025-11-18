import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";

const MyListings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<Record<string, any[]>>({});
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);

  useEffect(() => {
    fetchListingsAndApplicants();
  }, []);

  const fetchListingsAndApplicants = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch listings
      const { data: listingsData, error: listingsError } = await supabase
        .from("listings")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (listingsError) throw listingsError;

      setListings(listingsData || []);

      // Fetch applicants for each listing
      if (listingsData && listingsData.length > 0) {
        const applicantsMap: Record<string, any[]> = {};

        for (const listing of listingsData) {
          const { data: bookingsData, error: bookingsError } = await supabase
            .from("bookings")
            .select(`
              *,
              sitter:profiles!bookings_sitter_id_fkey(
                user_id,
                name,
                bio,
                photo_url,
                experience,
                skills,
                is_verified,
                is_paid
              )
            `)
            .eq("listing_id", listing.id)
            .order("created_at", { ascending: false });

          if (!bookingsError) {
            applicantsMap[listing.id] = bookingsData || [];
          }
        }

        setApplicants(applicantsMap);
      }

      setIsLoading(false);
    } catch (error: any) {
      console.error("Error fetching listings:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: "accepted" | "cancelled") => {
    setUpdatingBooking(bookingId);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Application ${status === "accepted" ? "approved" : "rejected"}.`,
      });

      // Refresh the data
      await fetchListingsAndApplicants();
    } catch (error: any) {
      console.error("Error updating booking:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingBooking(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      accepted: "default",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 bg-muted/50">
        <div className="container max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Listings</h1>
              <p className="text-muted-foreground mt-2">
                Manage your property listings and review applications
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Go Back to Dashboard
              </Button>
              <Button onClick={() => navigate("/listings/new")}>
                Create New Listing
              </Button>
            </div>
          </div>

          {listings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't created any listings yet.
                </p>
                <Button onClick={() => navigate("/listings/new")}>
                  Create Your First Listing
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {listings.map((listing) => (
                <Card key={listing.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{listing.title}</CardTitle>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {listing.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(listing.start_date), "MMM d")} - {format(new Date(listing.end_date), "MMM d, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {applicants[listing.id]?.length || 0} applicants
                          </span>
                        </div>
                      </div>
                      <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                        {listing.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{listing.description}</p>

                    {applicants[listing.id] && applicants[listing.id].length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold">Applications</h3>
                        {applicants[listing.id].map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-start justify-between p-4 border rounded-lg"
                          >
                            <div className="flex gap-4">
                              {booking.sitter.photo_url && (
                                <img
                                  src={booking.sitter.photo_url}
                                  alt={booking.sitter.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{booking.sitter.name}</h4>
                                  {booking.sitter.is_verified && (
                                    <Badge variant="secondary" className="text-xs">
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {booking.sitter.bio || "No bio provided"}
                                </p>
                                {booking.sitter.skills && booking.sitter.skills.length > 0 && (
                                  <div className="flex gap-2 mt-2">
                                    {booking.sitter.skills.slice(0, 3).map((skill: string, idx: number) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                  Applied {format(new Date(booking.created_at), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(booking.status)}
                              {booking.status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateBookingStatus(booking.id, "accepted")}
                                    disabled={updatingBooking === booking.id}
                                  >
                                    {updatingBooking === booking.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Approve"
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateBookingStatus(booking.id, "cancelled")}
                                    disabled={updatingBooking === booking.id}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No applications yet for this listing.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyListings;
