import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";

const CreateListing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    requirements: "",
  });
  
  const [pets, setPets] = useState([{ type: "", name: "", age: "", notes: "" }]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [customTask, setCustomTask] = useState("");

  const commonTasks = [
    "Feed pets",
    "Water plants",
    "Collect mail",
    "Take out bins",
    "Mow lawn",
    "Clean pool",
    "Walk dogs",
    "Give medication",
  ];

  const addPet = () => {
    setPets([...pets, { type: "", name: "", age: "", notes: "" }]);
  };

  const removePet = (index: number) => {
    if (pets.length > 1) {
      setPets(pets.filter((_, i) => i !== index));
    }
  };

  const updatePet = (index: number, field: string, value: string) => {
    const updated = [...pets];
    updated[index] = { ...updated[index], [field]: value };
    setPets(updated);
  };

  const toggleTask = (task: string) => {
    setSelectedTasks(prev =>
      prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task]
    );
  };

  const addCustomTask = () => {
    if (customTask.trim() && !selectedTasks.includes(customTask.trim())) {
      setSelectedTasks([...selectedTasks, customTask.trim()]);
      setCustomTask("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Filter out empty pets
      const validPets = pets.filter(p => p.type || p.name);
      
      const { error } = await supabase.from("listings").insert({
        owner_id: user.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_date: formData.startDate,
        end_date: formData.endDate,
        pets: validPets.length > 0 ? validPets : null,
        tasks: selectedTasks.length > 0 ? selectedTasks : [],
        requirements: formData.requirements,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your listing has been created successfully.",
      });

      navigate("/my-listings");
    } catch (error: any) {
      console.error("Error creating listing:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 bg-muted/50">
        <div className="container max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Create New Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Listing Title *</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Looking for house sitter in Sydney"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <LocationAutocomplete
                    id="location"
                    required
                    value={formData.location}
                    onChange={(value) => setFormData({ ...formData, location: value })}
                    placeholder="e.g., Sydney, NSW"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your home and what you're looking for..."
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Pets (optional)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addPet}>
                      Add Another Pet
                    </Button>
                  </div>
                  {pets.map((pet, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Pet {index + 1}</span>
                        {pets.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePet(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Type</Label>
                          <Input
                            placeholder="e.g., Dog, Cat"
                            value={pet.type}
                            onChange={(e) => updatePet(index, "type", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Name</Label>
                          <Input
                            placeholder="Pet name"
                            value={pet.name}
                            onChange={(e) => updatePet(index, "name", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Age</Label>
                          <Input
                            placeholder="e.g., 5 years"
                            value={pet.age}
                            onChange={(e) => updatePet(index, "age", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Special Notes</Label>
                          <Input
                            placeholder="Any special needs"
                            value={pet.notes}
                            onChange={(e) => updatePet(index, "notes", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Label>Tasks Required</Label>
                  <div className="flex flex-wrap gap-2">
                    {commonTasks.map((task) => (
                      <Button
                        key={task}
                        type="button"
                        variant={selectedTasks.includes(task) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTask(task)}
                      >
                        {task}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom task..."
                      value={customTask}
                      onChange={(e) => setCustomTask(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTask())}
                    />
                    <Button type="button" variant="outline" onClick={addCustomTask}>
                      Add
                    </Button>
                  </div>
                  {selectedTasks.filter(t => !commonTasks.includes(t)).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTasks.filter(t => !commonTasks.includes(t)).map((task) => (
                        <Button
                          key={task}
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => toggleTask(task)}
                        >
                          {task} ✕
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Special Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="Any special requirements or preferences..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Listing"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateListing;
