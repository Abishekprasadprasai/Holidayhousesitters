import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { z } from "zod";

const ADMIN_CODE = "8823";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"homeowner" | "sitter" | "admin">("sitter");
  const [adminCode, setAdminCode] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Test mode flag - set to true to bypass Stripe payment
  const TEST_MODE = true;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate admin code if admin role is selected
    if (role === "admin") {
      if (adminCode.trim() !== ADMIN_CODE) {
        toast({
          title: "Invalid admin code",
          description: "The admin access code you entered is incorrect.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (!document) {
      toast({
        title: "Document required",
        description: "Please upload your Australian driver's license or passport",
        variant: "destructive",
      });
      return;
    }

    // Input validation using zod
    const registrationSchema = z.object({
      name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
      email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
      password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
    });

    const validation = registrationSchema.safeParse({ name, email, password });
    if (!validation.success) {
      toast({
        title: "Validation error",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name,
            role,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed");

      // Upload identity document
      const fileExt = document.name.split('.').pop();
      const filePath = `${authData.user.id}/identity.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('identity-documents')
        .upload(filePath, document);

      if (uploadError) throw uploadError;

      // Update profile with document URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ document_url: filePath })
        .eq('user_id', authData.user.id);

      if (updateError) throw updateError;

      // Handle admin signup separately
      if (role === "admin") {
        // Submit admin request for manual approval
        const { error: adminRequestError } = await supabase
          .from('pending_admin_requests')
          .insert({ user_id: authData.user.id });

        if (adminRequestError) throw adminRequestError;

        toast({
          title: "Admin request submitted!",
          description: "Your admin access request has been submitted for review. You'll be notified once approved.",
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      if (TEST_MODE) {
        // Test mode: Mark user as paid and redirect to dashboard
        const { error: paymentUpdateError } = await supabase
          .from('profiles')
          .update({ is_paid: true })
          .eq('user_id', authData.user.id);

        if (paymentUpdateError) throw paymentUpdateError;

        toast({
          title: "Registration successful!",
          description: "Test mode: Payment skipped. Redirecting to dashboard...",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        // Production mode: Create Stripe checkout session
        toast({
          title: "Registration successful!",
          description: "Redirecting to payment...",
        });

        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
          "create-checkout"
        );

        if (checkoutError) throw checkoutError;

        // Redirect to Stripe checkout
        if (checkoutData?.url) {
          window.location.href = checkoutData.url;
        }
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join Holiday House Sitters</CardTitle>
            <CardDescription>
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label>I want to</Label>
                <RadioGroup 
                  value={role} 
                  onValueChange={(value: any) => setRole(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sitter" id="sitter" />
                    <Label htmlFor="sitter" className="font-normal cursor-pointer">
                      Become a house/pet sitter
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="homeowner" id="homeowner" />
                    <Label htmlFor="homeowner" className="font-normal cursor-pointer">
                      Find a sitter for my home/pets
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="font-normal cursor-pointer">
                      Administrator (Requires Code)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {role === "admin" && (
                <div className="space-y-2">
                  <Label htmlFor="adminCode">Admin Access Code *</Label>
                  <Input
                    id="adminCode"
                    type="password"
                    placeholder="Enter admin code"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    required
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the admin access code to proceed with admin registration
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="document">Identity Document *</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Input
                    id="document"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setDocument(e.target.files?.[0] || null)}
                    className="hidden"
                    required
                  />
                  <label htmlFor="document" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {document ? document.name : "Upload Australian Driver's License or Passport"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPG, or PNG (max 5MB)
                    </p>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
