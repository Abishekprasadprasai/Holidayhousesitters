import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Calendar, PawPrint, ArrowLeft, ClipboardList } from "lucide-react";
import { format } from "date-fns";

type Listing = {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  pets: any;
  requirements: string;
  tasks: string[];
  owner_id: string;
  owner_name?: string;
};

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      setLoading(true);

      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .eq("status", "active")
        .single();

      if (listingError) throw listingError;

      if (!listingData) {
        toast({
          title: "Not Found",
          description: "This listing could not be found.",
          variant: "destructive",
        });
        navigate("/listings");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", listingData.owner_id)
        .single();

      setListing({
        ...listingData,
        owner_name: profile?.name,
      });
    } catch (error: any) {
      console.error("Error loading listing:", error);
      toast({
        title: "Error",
        description: "Failed to load listing details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading listing details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 bg-muted/50">
        <div className="container max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/listings")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-4">{listing.title}</CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg">{listing.location}</span>
                  </div>
                </div>
                <Badge className="text-sm px-3 py-1">Active</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{listing.description}</p>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  House Sitting Dates
                </h3>
                <p className="text-muted-foreground">
                  {format(new Date(listing.start_date), "MMMM d, yyyy")} -{" "}
                  {format(new Date(listing.end_date), "MMMM d, yyyy")}
                </p>
              </div>

              {/* Pets */}
              {listing.pets && Array.isArray(listing.pets) && listing.pets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <PawPrint className="h-5 w-5" />
                    Pets to Care For ({listing.pets.length})
                  </h3>
                  <div className="grid gap-3">
                    {listing.pets.map((pet: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{pet.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {pet.type} • {pet.breed}
                              </p>
                            </div>
                            <Badge variant="outline">{pet.age}</Badge>
                          </div>
                          {pet.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{pet.notes}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {listing.tasks && listing.tasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Responsibilities
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {listing.tasks.map((task, index) => (
                      <li key={index}>{task}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {listing.requirements && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  <p className="text-muted-foreground">{listing.requirements}</p>
                </div>
              )}

              {/* Owner */}
              <div className="pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  Posted by <span className="font-medium text-foreground">{listing.owner_name || "Homeowner"}</span>
                </p>
                <Button size="lg" className="w-full">
                  Apply for this House Sit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ListingDetails;
