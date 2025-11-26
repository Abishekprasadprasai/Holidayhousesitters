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
  const [role, setRole] = useState<"homeowner" | "sitter" | "vet_nurse" | "admin">("sitter");
  const [adminCode, setAdminCode] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [vetExperience, setVetExperience] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

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
    
    // Validate vet nurse experience
    if (role === "vet_nurse") {
      if (!vetExperience) {
        toast({
          title: "Experience required",
          description: "Please select your years of veterinary experience",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Check if document is required based on role and experience
    const documentRequired = 
      role === "sitter" || 
      role === "homeowner" || 
      role === "admin" || 
      (role === "vet_nurse" && vetExperience === "less-than-1");
    
    if (documentRequired && !document) {
      const message = role === "vet_nurse" 
        ? "Vet nurses with less than 1 year experience require a police check"
        : "Please upload your Australian driver's license or passport";
      toast({
        title: "Document required",
        description: message,
        variant: "destructive",
      });
      return;
    }

    // File validation - check size and type
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    
    if (document.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    if (!ALLOWED_TYPES.includes(document.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or PDF file",
        variant: "destructive",
      });
      return;
    }

    // Input validation using zod
    const registrationSchema = z.object({
      name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
      email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
      password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password too long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
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

      // Upload identity document if provided
      let filePath = null;
      if (document) {
        const fileExt = document.name.split('.').pop();
        filePath = `${authData.user.id}/identity.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('identity-documents')
          .upload(filePath, document);

        if (uploadError) throw uploadError;
      }

      // Update profile with document URL and vet experience if applicable
      const updateData: any = {};
      if (filePath) {
        updateData.document_url = filePath;
      }
      if (role === "vet_nurse") {
        updateData.years_experience = vetExperience;
      }
      
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', authData.user.id);

        if (updateError) throw updateError;
      }

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

      // Registration successful - different messages for vet nurses vs others
      const successMessage = role === "vet_nurse" 
        ? "Your account has been created. An admin will verify your documents, and once verified, you'll have full access to the platform."
        : "Your account has been created. An admin will verify your documents, then you can complete payment to access all features.";
      
      toast({
        title: "Registration successful!",
        description: successMessage,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
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
                    <RadioGroupItem value="vet_nurse" id="vet_nurse" />
                    <Label htmlFor="vet_nurse" className="font-normal cursor-pointer">
                      Offer vet support services
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

              {role === "vet_nurse" && (
                <div className="space-y-2">
                  <Label htmlFor="vetExperience">Years of Veterinary Experience *</Label>
                  <RadioGroup 
                    value={vetExperience} 
                    onValueChange={setVetExperience}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="less-than-1" id="exp-less-1" />
                      <Label htmlFor="exp-less-1" className="font-normal cursor-pointer">
                        Less than 1 year (Police check required)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1-3" id="exp-1-3" />
                      <Label htmlFor="exp-1-3" className="font-normal cursor-pointer">
                        1-3 years
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3-5" id="exp-3-5" />
                      <Label htmlFor="exp-3-5" className="font-normal cursor-pointer">
                        3-5 years
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5-plus" id="exp-5-plus" />
                      <Label htmlFor="exp-5-plus" className="font-normal cursor-pointer">
                        5+ years
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="document">
                  {role === "vet_nurse" && vetExperience !== "less-than-1" 
                    ? "Identity Document (Optional)" 
                    : "Identity Document *"}
                </Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Input
                    id="document"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setDocument(e.target.files?.[0] || null)}
                    className="hidden"
                    required={role === "sitter" || role === "homeowner" || role === "admin" || (role === "vet_nurse" && vetExperience === "less-than-1")}
                  />
                  <label htmlFor="document" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {document ? document.name : role === "vet_nurse" && vetExperience !== "less-than-1" 
                        ? "Upload Police Check (Optional)" 
                        : role === "vet_nurse" && vetExperience === "less-than-1"
                        ? "Upload Police Check (Required)"
                        : "Upload Australian Driver's License or Passport"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {role === "vet_nurse" 
                        ? "Police check - PDF, JPG, or PNG (max 5MB)" 
                        : "PDF, JPG, or PNG (max 5MB)"}
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
