import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { LogOut, Plus, FileText } from "lucide-react";
import { format } from "date-fns";

interface Complaint {
  id: string;
  title: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  created_at: string;
  updated_at: string;
  categories: { name: string };
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);

  useEffect(() => {
    checkAuth();
    fetchComplaints();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/student-login");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", session.user.id)
      .single();

    setProfile(profileData);
  };

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          id,
          title,
          status,
          created_at,
          updated_at,
          categories (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error: any) {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/student-login");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <nav className="bg-card shadow-soft border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-white px-4">
              Brocamp Helpdesk
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {profile?.full_name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">My Complaints</h2>
          <Button onClick={() => navigate("/create-complaint")} className="shadow-soft">
            <Plus className="w-4 h-4 mr-2" />
            New Complaint
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">No complaints yet</p>
              <Button onClick={() => navigate("/create-complaint")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Complaint
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {complaints.map((complaint) => (
              <Card
                key={complaint.id}
                className="shadow-soft hover:shadow-medium transition-smooth cursor-pointer"
                onClick={() => navigate(`/complaint/${complaint.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{complaint.title}</CardTitle>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {complaint.categories.name}
                        </span>
                        <span>•</span>
                        <span>Created {format(new Date(complaint.created_at), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                    <StatusBadge status={complaint.status} />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
