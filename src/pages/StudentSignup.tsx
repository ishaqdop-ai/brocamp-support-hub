import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  batch: z.string().min(1, "Batch is required"),
  mode: z.enum(["Hub", "Online"], { required_error: "Mode is required" }),
  location: z.enum(["Kozhikode", "Trivandrum", "Bengaluru", "Coimbatore", "Chennai", "Home"], {
    required_error: "Location is required",
  }),
});

export default function StudentSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    batch: "",
    mode: "" as "Hub" | "Online" | "",
    location: "" as "Kozhikode" | "Trivandrum" | "Bengaluru" | "Coimbatore" | "Chennai" | "Home" | "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = signupSchema.parse(formData);
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          data: {
            full_name: validated.fullName,
            batch: validated.batch,
            mode: validated.mode,
            location: validated.location,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Email already registered. Please log in instead.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Account created successfully! Please log in.");
      navigate("/student-login");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("An error occurred during signup");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold gradient-primary bg-clip-text text-white leading-[2]">
            Brocamp Helpdesk
          </CardTitle>
          <CardDescription>Create your student account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Input
                id="batch"
                type="text"
                placeholder="e.g., Batch 42"
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Mode</Label>
              <Select value={formData.mode} onValueChange={(value: "Hub" | "Online") => setFormData({ ...formData, mode: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hub">Hub</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value: typeof formData.location) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kozhikode">Kozhikode</SelectItem>
                  <SelectItem value="Trivandrum">Trivandrum</SelectItem>
                  <SelectItem value="Bengaluru">Bengaluru</SelectItem>
                  <SelectItem value="Coimbatore">Coimbatore</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/student-login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
