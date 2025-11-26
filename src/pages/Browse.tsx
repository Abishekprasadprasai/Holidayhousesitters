import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Filter } from "lucide-react";
import { MapView } from "@/components/MapView";
import { ProfileCard } from "@/components/ProfileCard";
import { geocodeLocations, calculateDistance } from "@/utils/geocoding";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Profile = {
  id: string;
  user_id: string;
  name: string;
  bio?: string;
  location?: string;
  photo_url?: string;
  skills?: string[];
  is_verified: boolean;
  role: "sitter" | "homeowner";
  lat?: number;
  lng?: number;
};

const Browse = () => {
  const { toast } = useToast();
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [roleFilter, setRoleFilter] = useState<"all" | "sitter" | "homeowner">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string>();

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allProfiles, roleFilter, searchQuery]);

  const loadProfiles = async () => {
    try {
      setLoading(true);

      // Fetch all verified and paid profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_verified", true)
        .eq("is_paid", true);

      if (profilesError) throw profilesError;

      if (!profiles || profiles.length === 0) {
        setAllProfiles([]);
        setLoading(false);
        return;
      }

      // Fetch roles for all users
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in(
          "user_id",
          profiles.map((p) => p.user_id)
        );

      if (rolesError) throw rolesError;

      // Map roles to profiles
      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) || []);

      // Filter profiles that have a role and location
      const profilesWithRole = profiles
        .filter((p) => p.location && roleMap.has(p.user_id))
        .map((p) => ({
          ...p,
          role: roleMap.get(p.user_id) as "sitter" | "homeowner",
        }));

      // Geocode all locations
      setGeocoding(true);
      const locations = profilesWithRole
        .map((p) => p.location)
        .filter(Boolean) as string[];
      const coordsMap = await geocodeLocations(locations);
      setGeocoding(false);

      // Add coordinates to profiles
      const profilesWithCoords = profilesWithRole.map((p) => {
        const coords = p.location ? coordsMap.get(p.location) : null;
        return {
          ...p,
          lat: coords?.lat,
          lng: coords?.lng,
        };
      });

      setAllProfiles(profilesWithCoords);
    } catch (error: any) {
      console.error("Error loading profiles:", error);
      toast({
        title: "Error",
        description: "Failed to load profiles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allProfiles];

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((p) => p.role === roleFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.location?.toLowerCase().includes(query) ||
          p.bio?.toLowerCase().includes(query)
      );
    }

    setFilteredProfiles(filtered);
  };

  const handleProfileClick = (profileId: string) => {
    setSelectedProfileId(profileId);
    // Scroll to profile in list
    const element = document.getElementById(`profile-${profileId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const getRecommendedProfiles = () => {
    if (!selectedProfileId || filteredProfiles.length === 0) return [];

    const selectedProfile = filteredProfiles.find((p) => p.id === selectedProfileId);
    if (!selectedProfile?.lat || !selectedProfile?.lng) return [];

    // Calculate distances and sort
    const withDistances = filteredProfiles
      .filter((p) => p.id !== selectedProfileId && p.lat && p.lng)
      .map((p) => ({
        ...p,
        distance: calculateDistance(
          selectedProfile.lat!,
          selectedProfile.lng!,
          p.lat!,
          p.lng!
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    return withDistances;
  };

  const recommendedProfiles = getRecommendedProfiles();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profiles...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (geocoding) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Preparing map locations...</p>
            <p className="text-xs text-muted-foreground mt-2">
              This may take a moment
            </p>
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
        <div className="container">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Find Sitters & Homeowners</h1>
            <p className="text-muted-foreground">
              Discover trusted sitters and homeowners in your area
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <LocationAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name, location, or suburb..."
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Profiles</SelectItem>
                  <SelectItem value="sitter">Sitters Only</SelectItem>
                  <SelectItem value="homeowner">Homeowners Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Map and List Layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2 h-[500px] lg:h-[600px]">
              <MapView
                profiles={filteredProfiles}
                selectedProfileId={selectedProfileId}
                onProfileClick={handleProfileClick}
              />
            </div>

            {/* Profile List */}
            <div className="lg:col-span-1">
              <Card className="h-[500px] lg:h-[600px] flex flex-col">
                <CardContent className="pt-6 flex-1 overflow-y-auto">
                  <h2 className="font-semibold mb-4 sticky top-0 bg-card pb-2">
                    {filteredProfiles.length} Profile{filteredProfiles.length !== 1 ? "s" : ""} Found
                  </h2>
                  {filteredProfiles.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">
                        No profiles found. Try adjusting your filters.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredProfiles.map((profile) => (
                        <div key={profile.id} id={`profile-${profile.id}`}>
                          <ProfileCard
                            {...profile}
                            isHighlighted={selectedProfileId === profile.id}
                            onClick={() => handleProfileClick(profile.id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recommended Nearby */}
          {recommendedProfiles.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">
                Recommended Near This Area
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedProfiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    {...profile}
                    onClick={() => handleProfileClick(profile.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Browse;
