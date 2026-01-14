import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
  type?: "transaction" | "wallet" | "kyc" | "user" | "notification"
}

export function StatusBadge({ status, type = "transaction" }: StatusBadgeProps) {
  const getVariant = () => {
    if (type === "transaction") {
      switch (status) {
        case "SUCCESS":
          return "default"
        case "PENDING":
          return "secondary"
        case "FAILED":
        case "REVERSED":
          return "destructive"
        default:
          return "outline"
      }
    }

    if (type === "wallet" || type === "user") {
      switch (status) {
        case "ACTIVE":
          return "default"
        case "FROZEN":
        case "SUSPENDED":
        case "LOCKED":
          return "destructive"
        default:
          return "outline"
      }
    }

    if (type === "kyc") {
      switch (status) {
        case "APPROVED":
          return "default"
        case "PENDING":
          return "secondary"
        case "REJECTED":
          return "destructive"
        case "NONE":
          return "outline"
        default:
          return "outline"
      }
    }

    if (type === "notification") {
      switch (status) {
        case "URGENT":
          return "destructive"
        case "HIGH":
          return "default"
        case "MEDIUM":
          return "secondary"
        case "LOW":
          return "outline"
        default:
          return "outline"
      }
    }

    return "outline"
  }

  const getColor = () => {
    if (type === "transaction") {
      switch (status) {
        case "SUCCESS":
          return "bg-success text-success-foreground"
        case "PENDING":
          return "bg-warning text-warning-foreground"
        case "FAILED":
        case "REVERSED":
          return "bg-destructive text-destructive-foreground"
        default:
          return ""
      }
    }

    if (type === "kyc") {
      switch (status) {
        case "APPROVED":
          return "bg-success text-success-foreground"
        case "PENDING":
          return "bg-warning text-warning-foreground"
        case "REJECTED":
          return "bg-destructive text-destructive-foreground"
        default:
          return ""
      }
    }

    return ""
  }

  return (
    <Badge variant={getVariant()} className={getColor()}>
      {status}
    </Badge>
  )
}
