import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Calendar, PawPrint, Search } from "lucide-react";
import { format } from "date-fns";

type Listing = {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  pets: any;
  owner_id: string;
  owner_name?: string;
};

const Listings = () => {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);

      // Fetch active listings
      const { data: listingsData, error: listingsError } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (listingsError) throw listingsError;

      // Fetch owner profiles
      const ownerIds = listingsData?.map((l) => l.owner_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", ownerIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p.name]) || []);

      const listingsWithOwners = listingsData?.map((listing) => ({
        ...listing,
        owner_name: profileMap.get(listing.owner_id),
      })) || [];

      setListings(listingsWithOwners);
    } catch (error: any) {
      console.error("Error loading listings:", error);
      toast({
        title: "Error",
        description: "Failed to load listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading house sits...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 bg-muted/50">
        <div className="container max-w-6xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Available House Sits</h1>
            <p className="text-muted-foreground">
              Browse and apply for house sitting opportunities
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, location, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No listings match your search. Try adjusting your filters."
                    : "No house sits available at the moment. Check back soon!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2">{listing.title}</CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{listing.location}</span>
                        </div>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {listing.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(listing.start_date), "MMM d")} -{" "}
                          {format(new Date(listing.end_date), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    {listing.pets && (
                      <div className="flex items-center gap-2">
                        <PawPrint className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {Array.isArray(listing.pets) ? listing.pets.length : 0} pet(s)
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        Posted by {listing.owner_name || "Homeowner"}
                      </span>
                      <Button size="sm">View Details</Button>
                    </div>
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

export default Listings;
