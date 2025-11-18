import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { CheckCircle, X, FileText, Mail, Phone, MapPin } from "lucide-react";

interface PendingUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  location: string | null;
  document_url: string | null;
  created_at: string;
  role: string;
}

const AdminVerifyUsers = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingUserId, setVerifyingUserId] = useState<string | null>(null);
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

      if (!roleLoading && role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You must be an admin to access this page.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      fetchPendingUsers();
    };

    checkAuth();
  }, [role, roleLoading, navigate]);

  const fetchPendingUsers = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-pending-users`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch pending users");
      }

      const { users } = await response.json();
      setPendingUsers(users || []);
    } catch (error: any) {
      console.error("Error fetching pending users:", error);
      toast({
        title: "Error",
        description: "Failed to load pending users. " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    setVerifyingUserId(userId);
    try {
      const { data: { user: admin } } = await supabase.auth.getUser();
      
      if (!admin) throw new Error("Admin not authenticated");

      // Update profile to verified
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          is_verified: true,
          verification_date: new Date().toISOString(),
          verified_by_admin_id: admin.id,
        })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      // Create verification log
      const { error: logError } = await supabase
        .from("verification_logs")
        .insert({
          user_id: userId,
          admin_id: admin.id,
          method: "in-person",
          notes: "User verified by admin through verification panel",
        });

      if (logError) throw logError;

      toast({
        title: "User Verified",
        description: "User has been successfully verified.",
      });

      // Refresh the list
      fetchPendingUsers();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setVerifyingUserId(null);
    }
  };

  if (roleLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">User Verification</h1>
              <p className="text-muted-foreground mt-2">
                Review and verify pending user registrations
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>

          {pendingUsers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No Pending Verifications</p>
                <p className="text-sm text-muted-foreground mt-2">
                  All users have been verified!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{user.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {user.role}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Registered {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleVerifyUser(user.user_id)}
                          disabled={verifyingUserId === user.user_id}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {verifyingUserId === user.user_id ? "Verifying..." : "Verify"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        {user.phone && (
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Phone</p>
                              <p className="text-sm text-muted-foreground">{user.phone}</p>
                            </div>
                          </div>
                        )}
                        {user.location && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Location</p>
                              <p className="text-sm text-muted-foreground">{user.location}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {user.bio && (
                          <div>
                            <p className="text-sm font-medium mb-1">Bio</p>
                            <p className="text-sm text-muted-foreground">{user.bio}</p>
                          </div>
                        )}
                        {user.document_url && (
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Identity Document</p>
                              <a
                                href={user.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                View Document
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
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

export default AdminVerifyUsers;
