import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";

const ProfileEdit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<"homeowner" | "sitter" | "vet_nurse" | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Common fields
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneConsent, setPhoneConsent] = useState(false);
  const [preferredContact, setPreferredContact] = useState("email");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // Sitter fields
  const [availabilityStart, setAvailabilityStart] = useState<Date>();
  const [availabilityEnd, setAvailabilityEnd] = useState<Date>();
  const [availabilityFlexible, setAvailabilityFlexible] = useState(false);
  const [yearsExperience, setYearsExperience] = useState("");
  const [propertyTypesCaredFor, setPropertyTypesCaredFor] = useState<string[]>([]);
  const [animalsCaredFor, setAnimalsCaredFor] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState("");

  // Vet Nurse fields
  const [medicalExperience, setMedicalExperience] = useState("");
  const [emergencyServices, setEmergencyServices] = useState(false);
  const [medicationSupport, setMedicationSupport] = useState(false);
  const [triageSupport, setTriageSupport] = useState(false);
  const [generalAdvice, setGeneralAdvice] = useState(false);
  const [vetServiceDescription, setVetServiceDescription] = useState("");

  // Homeowner fields
  const [propertyType, setPropertyType] = useState("");
  const [bedroomsBathrooms, setBedroomsBathrooms] = useState("");
  const [propertyFeatures, setPropertyFeatures] = useState<string[]>([]);
  const [wifiAvailable, setWifiAvailable] = useState(false);
  const [parkingAvailable, setParkingAvailable] = useState(false);
  const [numberOfPets, setNumberOfPets] = useState("");
  const [petCareInstructions, setPetCareInstructions] = useState("");
  const [medicationNeeds, setMedicationNeeds] = useState(false);
  const [exerciseRequirements, setExerciseRequirements] = useState("");
  const [houseRules, setHouseRules] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role as "homeowner" | "sitter" | "vet_nurse");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setName(profile.name || "");
        setLocation(profile.location || "");
        setPhone(profile.phone || "");
        setPhoneConsent(profile.phone_consent || false);
        setPreferredContact(profile.preferred_contact_method || "email");
        setBio(profile.bio || "");
        setPhotoUrl(profile.photo_url || "");
        setYearsExperience(profile.years_experience || "");
        setPropertyTypesCaredFor(profile.property_types_cared_for || []);
        setAnimalsCaredFor(profile.animals_cared_for || []);
        setSkills(profile.skills || []);
        setExperience(profile.experience || "");
        setPropertyType(profile.property_type || "");
        setBedroomsBathrooms(profile.bedrooms_bathrooms || "");
        setPropertyFeatures(profile.property_features || []);
        setWifiAvailable(profile.wifi_available || false);
        setParkingAvailable(profile.parking_available || false);
        setNumberOfPets(profile.number_of_pets?.toString() || "");
        setPetCareInstructions(profile.pet_care_instructions || "");
        setMedicationNeeds(profile.medication_needs || false);
        setExerciseRequirements(profile.exercise_requirements || "");
        setHouseRules(profile.house_rules || "");
        setEmergencyContacts(profile.emergency_contacts || "");
        setAvailabilityFlexible(profile.availability_flexible || false);
        
        // Load vet nurse fields
        setMedicalExperience(profile.medical_experience || "");
        setEmergencyServices(profile.emergency_services || false);
        setMedicationSupport(profile.medication_support || false);
        setTriageSupport(profile.triage_support || false);
        setGeneralAdvice(profile.general_advice || false);
        setVetServiceDescription(profile.vet_service_description || "");
        
        if (profile.availability_start) {
          setAvailabilityStart(new Date(profile.availability_start));
        }
        if (profile.availability_end) {
          setAvailabilityEnd(new Date(profile.availability_end));
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    const profileSchema = z.object({
      name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
      location: z.string().max(200, "Location too long").optional(),
      phone: z.string().max(20, "Phone number too long").optional(),
      bio: z.string().max(2000, "Bio too long").optional(),
      photoUrl: z.string().url("Invalid URL").max(500, "URL too long").optional().or(z.literal("")),
      experience: z.string().max(2000, "Experience description too long").optional(),
      petCareInstructions: z.string().max(2000, "Instructions too long").optional(),
      exerciseRequirements: z.string().max(1000, "Requirements too long").optional(),
      houseRules: z.string().max(2000, "House rules too long").optional(),
      emergencyContacts: z.string().max(1000, "Emergency contacts too long").optional(),
    });

    const validation = profileSchema.safeParse({ 
      name, 
      location, 
      phone, 
      bio, 
      photoUrl, 
      experience,
      petCareInstructions,
      exerciseRequirements,
      houseRules,
      emergencyContacts,
    });
    
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updateData: any = {
        name,
        location,
        phone,
        phone_consent: phoneConsent,
        preferred_contact_method: preferredContact,
        bio,
        photo_url: photoUrl,
      };

      if (userRole === "sitter") {
        updateData.availability_start = availabilityStart?.toISOString().split('T')[0];
        updateData.availability_end = availabilityEnd?.toISOString().split('T')[0];
        updateData.availability_flexible = availabilityFlexible;
        updateData.years_experience = yearsExperience;
        updateData.property_types_cared_for = propertyTypesCaredFor;
        updateData.animals_cared_for = animalsCaredFor;
        updateData.skills = skills;
        updateData.experience = experience;
      } else if (userRole === "vet_nurse") {
        updateData.medical_experience = medicalExperience;
        updateData.emergency_services = emergencyServices;
        updateData.medication_support = medicationSupport;
        updateData.triage_support = triageSupport;
        updateData.general_advice = generalAdvice;
        updateData.vet_service_description = vetServiceDescription;
        updateData.skills = skills;
        updateData.experience = experience;
        updateData.availability_start = availabilityStart?.toISOString().split('T')[0];
        updateData.availability_end = availabilityEnd?.toISOString().split('T')[0];
        updateData.availability_flexible = availabilityFlexible;
      } else if (userRole === "homeowner") {
        updateData.property_type = propertyType;
        updateData.bedrooms_bathrooms = bedroomsBathrooms;
        updateData.property_features = propertyFeatures;
        updateData.wifi_available = wifiAvailable;
        updateData.parking_available = parkingAvailable;
        updateData.number_of_pets = numberOfPets ? parseInt(numberOfPets) : null;
        updateData.pet_care_instructions = petCareInstructions;
        updateData.medication_needs = medicationNeeds;
        updateData.exercise_requirements = exerciseRequirements;
        updateData.house_rules = houseRules;
        updateData.emergency_contacts = emergencyContacts;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>
                {userRole === "sitter" ? "Sitter Profile" : userRole === "vet_nurse" ? "Vet Nurse Profile" : "Homeowner Profile"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                {/* About Me Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">About Me</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <LocationAutocomplete
                        id="location"
                        value={location}
                        onChange={setLocation}
                        placeholder="City, State"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Contact Method</Label>
                      <RadioGroup value={preferredContact} onValueChange={setPreferredContact}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="email" />
                          <Label htmlFor="email">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phone" id="phone-contact" />
                          <Label htmlFor="phone-contact">Phone</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="messaging" id="messaging" />
                          <Label htmlFor="messaging">Platform Messaging</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="phone-consent"
                      checked={phoneConsent}
                      onCheckedChange={(checked) => setPhoneConsent(checked as boolean)}
                    />
                    <Label htmlFor="phone-consent">
                      Allow my phone number to be visible to other members
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photo">Profile Photo URL</Label>
                    <Input
                      id="photo"
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Sitter-specific fields */}
                {userRole === "sitter" && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Availability</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !availabilityStart && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {availabilityStart ? format(availabilityStart, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={availabilityStart}
                                onSelect={setAvailabilityStart}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !availabilityEnd && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {availabilityEnd ? format(availabilityEnd, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={availabilityEnd}
                                onSelect={setAvailabilityEnd}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="flexible"
                          checked={availabilityFlexible}
                          onCheckedChange={(checked) => setAvailabilityFlexible(checked as boolean)}
                        />
                        <Label htmlFor="flexible">Dates are flexible</Label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Experience</h3>
                      
                      <div className="space-y-2">
                        <Label>Years of House/Pet Sitting</Label>
                        <RadioGroup value={yearsExperience} onValueChange={setYearsExperience}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1-2" id="exp-1-2" />
                            <Label htmlFor="exp-1-2">1-2 years</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="3-5" id="exp-3-5" />
                            <Label htmlFor="exp-3-5">3-5 years</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="5+" id="exp-5plus" />
                            <Label htmlFor="exp-5plus">5+ years</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Types of Properties Cared For</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {["House", "Farm", "Apartment", "Other"].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`property-${type}`}
                                checked={propertyTypesCaredFor.includes(type)}
                                onCheckedChange={() => toggleArrayItem(propertyTypesCaredFor, setPropertyTypesCaredFor, type)}
                              />
                              <Label htmlFor={`property-${type}`}>{type}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Animals Cared For</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Dogs", "Cats", "Birds", "Horses", "Other"].map((animal) => (
                            <div key={animal} className="flex items-center space-x-2">
                              <Checkbox
                                id={`animal-${animal}`}
                                checked={animalsCaredFor.includes(animal)}
                                onCheckedChange={() => toggleArrayItem(animalsCaredFor, setAnimalsCaredFor, animal)}
                              />
                              <Label htmlFor={`animal-${animal}`}>{animal}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Skills & Responsibilities</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[
                            "Pet feeding & medication",
                            "Dog walking / exercise",
                            "Grooming / brushing",
                            "Garden care / pool maintenance",
                            "Security awareness"
                          ].map((skill) => (
                            <div key={skill} className="flex items-center space-x-2">
                              <Checkbox
                                id={`skill-${skill}`}
                                checked={skills.includes(skill)}
                                onCheckedChange={() => toggleArrayItem(skills, setSkills, skill)}
                              />
                              <Label htmlFor={`skill-${skill}`}>{skill}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="experience">Additional Experience Details</Label>
                        <Textarea
                          id="experience"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder="Describe your experience..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Vet Nurse-specific fields */}
                {userRole === "vet_nurse" && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Medical Experience</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="medical-experience">Professional Background</Label>
                        <Textarea
                          id="medical-experience"
                          value={medicalExperience}
                          onChange={(e) => setMedicalExperience(e.target.value)}
                          placeholder="Describe your veterinary qualifications, training, and experience..."
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vet-description">Service Description</Label>
                        <Textarea
                          id="vet-description"
                          value={vetServiceDescription}
                          onChange={(e) => setVetServiceDescription(e.target.value)}
                          placeholder="Describe the specific services you offer to pet owners..."
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Services Offered</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="medication-support"
                            checked={medicationSupport}
                            onCheckedChange={(checked) => setMedicationSupport(checked as boolean)}
                          />
                          <Label htmlFor="medication-support">Medication Support & Administration</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="emergency-services"
                            checked={emergencyServices}
                            onCheckedChange={(checked) => setEmergencyServices(checked as boolean)}
                          />
                          <Label htmlFor="emergency-services">Emergency Services & Consultation</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="triage-support"
                            checked={triageSupport}
                            onCheckedChange={(checked) => setTriageSupport(checked as boolean)}
                          />
                          <Label htmlFor="triage-support">Triage & Assessment</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="general-advice"
                            checked={generalAdvice}
                            onCheckedChange={(checked) => setGeneralAdvice(checked as boolean)}
                          />
                          <Label htmlFor="general-advice">General Pet Health Advice</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Availability</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !availabilityStart && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {availabilityStart ? format(availabilityStart, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={availabilityStart}
                                onSelect={setAvailabilityStart}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !availabilityEnd && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {availabilityEnd ? format(availabilityEnd, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={availabilityEnd}
                                onSelect={setAvailabilityEnd}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="flexible-vet"
                          checked={availabilityFlexible}
                          onCheckedChange={(checked) => setAvailabilityFlexible(checked as boolean)}
                        />
                        <Label htmlFor="flexible-vet">Dates are flexible</Label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Additional Information</h3>
                      
                      <div className="space-y-2">
                        <Label>Certifications & Qualifications</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Vet Nurse Cert", "First Aid", "Emergency Care", "Medication Admin"].map((cert) => (
                            <div key={cert} className="flex items-center space-x-2">
                              <Checkbox
                                id={`cert-${cert}`}
                                checked={skills.includes(cert)}
                                onCheckedChange={() => toggleArrayItem(skills, setSkills, cert)}
                              />
                              <Label htmlFor={`cert-${cert}`} className="text-sm">{cert}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vet-experience">Professional Experience</Label>
                        <Textarea
                          id="vet-experience"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          placeholder="Describe your veterinary experience and specializations..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Homeowner-specific fields */}
                {userRole === "homeowner" && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Property Details</h3>
                      
                      <div className="space-y-2">
                        <Label>Property Type</Label>
                        <RadioGroup value={propertyType} onValueChange={setPropertyType}>
                          {["House", "Farm", "Apartment", "Other"].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <RadioGroupItem value={type} id={`prop-${type}`} />
                              <Label htmlFor={`prop-${type}`}>{type}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bedrooms">Number of Bedrooms/Bathrooms</Label>
                        <Input
                          id="bedrooms"
                          value={bedroomsBathrooms}
                          onChange={(e) => setBedroomsBathrooms(e.target.value)}
                          placeholder="e.g., 3 bedrooms, 2 bathrooms"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Special Features</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Pool", "Garden", "Security system"].map((feature) => (
                            <div key={feature} className="flex items-center space-x-2">
                              <Checkbox
                                id={`feature-${feature}`}
                                checked={propertyFeatures.includes(feature)}
                                onCheckedChange={() => toggleArrayItem(propertyFeatures, setPropertyFeatures, feature)}
                              />
                              <Label htmlFor={`feature-${feature}`}>{feature}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="wifi"
                            checked={wifiAvailable}
                            onCheckedChange={(checked) => setWifiAvailable(checked as boolean)}
                          />
                          <Label htmlFor="wifi">Wi-Fi Available</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="parking"
                            checked={parkingAvailable}
                            onCheckedChange={(checked) => setParkingAvailable(checked as boolean)}
                          />
                          <Label htmlFor="parking">Parking Available</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Pets & Care Requirements</h3>
                      
                      <div className="space-y-2">
                        <Label>Animals</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Dogs", "Cats", "Birds", "Horses", "Other"].map((animal) => (
                            <div key={animal} className="flex items-center space-x-2">
                              <Checkbox
                                id={`pet-${animal}`}
                                checked={animalsCaredFor.includes(animal)}
                                onCheckedChange={() => toggleArrayItem(animalsCaredFor, setAnimalsCaredFor, animal)}
                              />
                              <Label htmlFor={`pet-${animal}`}>{animal}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="num-pets">Number of Pets</Label>
                        <Input
                          id="num-pets"
                          type="number"
                          value={numberOfPets}
                          onChange={(e) => setNumberOfPets(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pet-care">Special Care Instructions</Label>
                        <Textarea
                          id="pet-care"
                          value={petCareInstructions}
                          onChange={(e) => setPetCareInstructions(e.target.value)}
                          placeholder="Feeding schedule, habits, preferences..."
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="medication"
                          checked={medicationNeeds}
                          onCheckedChange={(checked) => setMedicationNeeds(checked as boolean)}
                        />
                        <Label htmlFor="medication">Medication Required</Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="exercise">Exercise Requirements</Label>
                        <Textarea
                          id="exercise"
                          value={exerciseRequirements}
                          onChange={(e) => setExerciseRequirements(e.target.value)}
                          placeholder="Daily walks, playtime, etc."
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Expectations</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="house-rules">House Rules</Label>
                        <Textarea
                          id="house-rules"
                          value={houseRules}
                          onChange={(e) => setHouseRules(e.target.value)}
                          placeholder="Any specific rules for the house sitter..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergency">Emergency Contacts</Label>
                        <Textarea
                          id="emergency"
                          value={emergencyContacts}
                          onChange={(e) => setEmergencyContacts(e.target.value)}
                          placeholder="Name, relationship, phone number..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfileEdit;
