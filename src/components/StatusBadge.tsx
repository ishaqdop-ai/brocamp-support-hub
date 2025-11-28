import { Badge } from "@/components/ui/badge";

type Status = "Open" | "In Progress" | "Resolved" | "Closed";

const statusConfig: Record<
  Status,
  { variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  Open: { variant: "default", className: "bg-primary text-primary-foreground" },
  "In Progress": { variant: "secondary", className: "bg-warning text-warning-foreground" },
  Resolved: { variant: "outline", className: "bg-success text-success-foreground" },
  Closed: { variant: "secondary", className: "bg-muted text-muted-foreground" },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] || statusConfig.Open;

  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
}
