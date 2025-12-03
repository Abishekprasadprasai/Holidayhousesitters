import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2, MapPin, Calendar, PawPrint, ArrowLeft, ClipboardList, Phone, Stethoscope, Send, MessageSquare } from "lucide-react";
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

type VetNurse = {
  user_id: string;
  name: string;
  phone: string;
  bio: string | null;
  photo_url: string | null;
  location: string | null;
};

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

type Booking = {
  id: string;
  status: string;
  sitter_id: string;
  listing_id: string;
};

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useUserRole();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [vetNurses, setVetNurses] = useState<VetNurse[]>([]);
  const [loadingVets, setLoadingVets] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);
  const [applying, setApplying] = useState(false);
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    loadListing();
    checkUserAndBooking();
  }, [id]);

  const checkUserAndBooking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        setUserProfile(profile);

        // Check if user has already applied
        const { data: booking } = await supabase
          .from("bookings")
          .select("*")
          .eq("listing_id", id)
          .eq("sitter_id", user.id)
          .single();

        setExistingBooking(booking);
      }
    } catch (error) {
      console.error("Error checking user booking:", error);
    }
  };

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

  const loadVetNurses = async () => {
    try {
      setLoadingVets(true);

      const { data: vetRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "vet_nurse");

      if (!vetRoles || vetRoles.length === 0) {
        setVetNurses([]);
        return;
      }

      const vetUserIds = vetRoles.map((r) => r.user_id);

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, name, phone, bio, photo_url, location")
        .in("user_id", vetUserIds)
        .eq("is_verified", true)
        .eq("phone_consent", true)
        .not("phone", "is", null);

      if (error) throw error;

      setVetNurses(profiles || []);
    } catch (error: any) {
      console.error("Error loading vet nurses:", error);
      toast({
        title: "Error",
        description: "Failed to load vet nurses.",
        variant: "destructive",
      });
    } finally {
      setLoadingVets(false);
    }
  };

  const handleContactVets = async () => {
    setDialogOpen(true);
    await loadVetNurses();

    if (listing?.owner_id) {
      toast({
        title: "Homeowner Notified",
        description: "The homeowner has been notified of your inquiry for vet support.",
      });
    }
  };

  const handleApply = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to apply for this listing.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!userProfile?.is_verified) {
      toast({
        title: "Verification Required",
        description: "Your account must be verified before applying.",
        variant: "destructive",
      });
      return;
    }

    setApplying(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        listing_id: id,
        sitter_id: currentUser.id,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "The homeowner has been notified and will review your application.",
      });

      // Refresh booking status
      await checkUserAndBooking();
    } catch (error: any) {
      console.error("Error applying:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application.",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  const loadMessages = async () => {
    if (!existingBooking) return;

    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("booking_id", existingBooking.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleOpenChat = async () => {
    setChatOpen(true);
    await loadMessages();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !existingBooking || !currentUser) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.from("messages").insert({
        booking_id: existingBooking.id,
        sender_id: currentUser.id,
        content: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage("");
      await loadMessages();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const getBookingStatusBadge = () => {
    if (!existingBooking) return null;
    
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      pending: { variant: "secondary", label: "Application Pending" },
      accepted: { variant: "default", label: "Application Accepted" },
      cancelled: { variant: "destructive", label: "Application Rejected" },
    };

    const config = statusConfig[existingBooking.status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  const canApply = role === "sitter" && !existingBooking && userProfile?.is_verified;
  const canChat = existingBooking?.status === "accepted";

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
                                {pet.type} {pet.age && `• ${pet.age}`}
                              </p>
                            </div>
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

              {/* Owner & Actions */}
              <div className="pt-6 border-t space-y-4">
                <p className="text-sm text-muted-foreground">
                  Posted by <span className="font-medium text-foreground">{listing.owner_name || "Homeowner"}</span>
                </p>

                {/* Sitter Application Status */}
                {role === "sitter" && existingBooking && (
                  <div className="flex items-center gap-3">
                    {getBookingStatusBadge()}
                    {canChat && (
                      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={handleOpenChat}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat with Homeowner
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Chat with {listing.owner_name || "Homeowner"}</DialogTitle>
                            <DialogDescription>
                              Discuss details about the house sitting arrangement.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="h-64 overflow-y-auto border rounded-lg p-3 space-y-3 bg-muted/30">
                            {loadingMessages ? (
                              <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-5 w-5 animate-spin" />
                              </div>
                            ) : messages.length === 0 ? (
                              <p className="text-center text-muted-foreground text-sm">
                                No messages yet. Start the conversation!
                              </p>
                            ) : (
                              messages.map((msg) => (
                                <div
                                  key={msg.id}
                                  className={`flex ${msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                                      msg.sender_id === currentUser?.id
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    }`}
                                  >
                                    <p className="text-sm">{msg.content}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                      {format(new Date(msg.created_at), "h:mm a")}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Textarea
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Type your message..."
                              className="resize-none"
                              rows={2}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                            />
                            <Button
                              onClick={handleSendMessage}
                              disabled={sendingMessage || !newMessage.trim()}
                            >
                              {sendingMessage ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                )}

                {/* Apply Button for Sitters */}
                {role === "sitter" && !existingBooking && (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleApply}
                    disabled={applying || !userProfile?.is_verified}
                  >
                    {applying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Applying...
                      </>
                    ) : !userProfile?.is_verified ? (
                      "Account Verification Required to Apply"
                    ) : (
                      "Apply for this House Sit"
                    )}
                  </Button>
                )}

                {/* Vet Contact for Homeowners */}
                {role === "homeowner" && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="w-full" onClick={handleContactVets}>
                        <Stethoscope className="h-5 w-5 mr-2" />
                        Contact Vet Nurses for Pet Support
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Available Vet Nurses</DialogTitle>
                        <DialogDescription>
                          Contact these verified vet nurses for emergency pet care support during your house sit.
                        </DialogDescription>
                      </DialogHeader>

                      {loadingVets ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : vetNurses.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No vet nurses available at the moment.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {vetNurses.map((vet) => (
                            <Card key={vet.user_id}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                  {vet.photo_url ? (
                                    <img
                                      src={vet.photo_url}
                                      alt={vet.name}
                                      className="w-16 h-16 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                      <Stethoscope className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                  )}
                                  
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-semibold">{vet.name}</h4>
                                        <Badge variant="secondary" className="mt-1">
                                          Vet Nurse
                                        </Badge>
                                        {vet.location && (
                                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {vet.location}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {vet.bio && (
                                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                        {vet.bio}
                                      </p>
                                    )}
                                    
                                    <Button
                                      size="sm"
                                      className="mt-3"
                                      asChild
                                    >
                                      <a href={`tel:${vet.phone}`}>
                                        <Phone className="h-4 w-4 mr-2" />
                                        Call {vet.phone}
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                )}
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
