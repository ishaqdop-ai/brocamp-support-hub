import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { ArrowLeft, Send, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  sender_type: string;
  created_at: string;
  profiles: { full_name: string };
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  attachment_url: string | null;
  attachment_type: string | null;
  created_at: string;
  updated_at: string;
  categories: { name: string };
  profiles: {
    full_name: string;
    batch: string;
    mode: string;
    location: string;
  };
}

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    checkAuth();
    fetchComplaintDetails();
    fetchMessages();
    subscribeToMessages();
  }, [id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/student-login");
      return;
    }
    setCurrentUserId(session.user.id);
  };

  const fetchComplaintDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          categories (name),
          profiles (full_name, batch, mode, location)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setComplaint(data);
    } catch (error) {
      toast.error("Failed to load complaint details");
      navigate("/student-dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        profiles (full_name)
      `)
      .eq("complaint_id", id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages-complaint-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `complaint_id=eq.${id}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || complaint?.status === "Closed") return;

    try {
      setSending(true);
      const { error } = await supabase.from("messages").insert({
        complaint_id: id,
        sender_id: currentUserId,
        sender_type: "student",
        content: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage("");
      toast.success("Message sent");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleCloseComplaint = async () => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ status: "Closed" })
        .eq("id", id);

      if (error) throw error;

      toast.success("Complaint closed");
      fetchComplaintDetails();
    } catch (error) {
      toast.error("Failed to close complaint");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-muted-foreground">Loading complaint details...</div>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <nav className="bg-card shadow-soft border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate("/student-dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            {complaint.status !== "Closed" && (complaint.status === "Resolved" || complaint.status === "In Progress") && (
              <Button variant="outline" onClick={handleCloseComplaint}>
                Close Complaint
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-medium mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{complaint.title}</CardTitle>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {complaint.categories.name}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(complaint.created_at), "MMM d, yyyy")}
                  </span>
                  <span>Batch: {complaint.profiles.batch}</span>
                  <span>{complaint.profiles.mode} - {complaint.profiles.location}</span>
                </div>
              </div>
              <StatusBadge status={complaint.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{complaint.description}</p>
            </div>
            {complaint.attachment_url && (
              <div>
                <h3 className="font-semibold mb-2">Attachment</h3>
                {complaint.attachment_type === "image" ? (
                  <img
                    src={complaint.attachment_url}
                    alt="Complaint attachment"
                    className="max-w-full h-auto rounded-lg shadow-soft"
                  />
                ) : (
                  <video controls className="max-w-full rounded-lg shadow-soft">
                    <source src={complaint.attachment_url} />
                    Your browser does not support video playback.
                  </video>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No messages yet</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === "student" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        message.sender_type === "student"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {message.sender_type === "admin" ? "Admin" : message.profiles.full_name}
                        </span>
                        <span className="text-xs opacity-70">
                          {format(new Date(message.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {complaint.status !== "Closed" && (
              <div className="flex gap-2 pt-4 border-t border-border">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                />
                <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
            {complaint.status === "Closed" && (
              <p className="text-sm text-muted-foreground text-center py-4 border-t border-border">
                This complaint is closed. No new messages can be sent.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
