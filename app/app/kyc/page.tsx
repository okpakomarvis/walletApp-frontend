"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatusBadge } from "@/components/status-badge"
import { authService } from "@/lib/auth-service"
import { kycService } from "@/lib/kyc-service"
import type { UserResponse, KycResponse } from "@/lib/types"
import { Shield, CheckCircle, Clock, XCircle, ArrowRight, Loader2 } from "lucide-react"

export default function KycPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [kyc, setKyc] = useState<KycResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, kycResponse] = await Promise.all([
          authService.getCurrentUser(),
          kycService.getKyc().catch(() => ({ data: null, success: false, message: "", timestamp: "" })),
        ])

        setUser(userResponse.data)
        if (kycResponse.success) {
          setKyc(kycResponse.data)
        }
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const tiers = [
    {
      level: "TIER_1",
      title: "Basic Verification",
      description: "Personal information and basic ID verification",
      limits: "Up to ₦500,000 per transaction",
      features: ["Basic transfers", "Limited withdrawals", "Standard support"],
    },
    {
      level: "TIER_2",
      title: "Enhanced Verification",
      description: "Full ID verification with proof of address",
      limits: "Up to ₦5,000,000 per transaction",
      features: ["Higher limits", "Faster withdrawals", "Priority support"],
    },
    {
      level: "TIER_3",
      title: "Premium Verification",
      description: "Complete verification with additional documents",
      limits: "Up to ₦50,000,000 per transaction",
      features: ["Maximum limits", "Instant withdrawals", "Dedicated support"],
    },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const renderKycStatus = () => {
    if (!kyc) {
      return (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>You haven't started verification yet. Choose a tier below to get started.</AlertDescription>
        </Alert>
      )
    }

    const statusConfig = {
      PENDING: {
        icon: Clock,
        color: "text-warning",
        bgColor: "bg-warning/10",
        title: "Verification In Progress",
        description: "Your documents are being reviewed. This usually takes 1-3 business days.",
      },
      APPROVED: {
        icon: CheckCircle,
        color: "text-success",
        bgColor: "bg-success/10",
        title: "Verification Approved",
        description: "Your account has been successfully verified.",
      },
      REJECTED: {
        icon: XCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        title: "Verification Rejected",
        description: kyc.rejectionReason || "Your verification was rejected. Please try again with correct documents.",
      },
    }

    const config = statusConfig[kyc.status]
    const Icon = config.icon

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}>
              <Icon className={`h-6 w-6 ${config.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{config.title}</h3>
                <StatusBadge status={kyc.status} type="kyc" />
              </div>
              <p className="text-muted-foreground mb-4">{config.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Level</p>
                  <p className="font-medium">{kyc.level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="font-medium">{formatDate(kyc.createdAt)}</p>
                </div>
                {kyc.verifiedAt && (
                  <div>
                    <p className="text-muted-foreground">Verified</p>
                    <p className="font-medium">{formatDate(kyc.verifiedAt)}</p>
                  </div>
                )}
              </div>

              {kyc.status === "REJECTED" && (
                <Button className="mt-4" onClick={() => router.push("/app/kyc/submit")}>
                  Resubmit Documents
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user || undefined} />

      <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6 space-y-6 max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold">KYC Verification</h1>
          <p className="text-muted-foreground mt-1">Verify your identity to unlock full features</p>
        </div>

        {renderKycStatus()}

        <div>
          <h2 className="text-2xl font-bold mb-4">Verification Tiers</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {tiers.map((tier, index) => {
              const isCurrentTier = kyc?.level === tier.level
              const isTierBelow = kyc && tiers.findIndex((t) => t.level === kyc.level) > index
              const isSelected = selectedTier === tier.level

              return (
                <Card
                  key={tier.level}
                  className={`relative cursor-pointer transition-all ${
                    isCurrentTier ? "border-primary" : ""
                  } ${isTierBelow ? "opacity-60" : ""} ${
                    isSelected ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"
                  }`}
                  onClick={() => {
                    if (!isTierBelow && !isCurrentTier && kyc?.status !== "PENDING") {
                      setSelectedTier(tier.level)
                    }
                  }}
                >
                  {isCurrentTier && kyc?.status === "APPROVED" && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{tier.title}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground mb-1">Transaction Limits</p>
                      <p className="font-medium">{tier.limits}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-sm text-muted-foreground mb-2">Features</p>
                      <ul className="space-y-1">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-success" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {!isTierBelow && !isCurrentTier && (
                      <Button
                        className="w-full"
                        variant={isSelected ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/app/kyc/submit?level=${tier.level}`)
                        }}
                        disabled={kyc?.status === "PENDING"}
                      >
                        {kyc?.status === "PENDING" ? "In Review" : "Start Verification"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
