"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService } from "@/lib/auth-service"
import { kycService } from "@/lib/kyc-service"
import type { UserResponse } from "@/lib/types"
import type { KycSubmissionRequest } from "@/lib/kyc-service"
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react"

type KycStep = "personal" | "identity" | "address" | "review" | "result"

export default function KycSubmitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [step, setStep] = useState<KycStep>("personal")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<KycSubmissionRequest>({
    level: (searchParams.get("level") as "TIER_1" | "TIER_2" | "TIER_3") || "TIER_1",
    fullName: "",
    idType: "",
    idNumber: "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  })

  const [files, setFiles] = useState<{
    idDocument: File | null
    proofOfAddress: File | null
    selfie: File | null
  }>({
    idDocument: null,
    proofOfAddress: null,
    selfie: null,
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userResponse = await authService.getCurrentUser()
        setUser(userResponse.data)
        setFormData((prev) => ({
          ...prev,
          fullName: `${userResponse.data.firstName} ${userResponse.data.lastName}`,
        }))
      } catch (error) {
        console.error("[v0] Error fetching user:", error)
        router.push("/auth/login")
      }
    }
    fetchUser()
  }, [router])

  const handleFileChange = (field: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFiles({ ...files, [field]: file })
    }
  }

  const handleSubmit = async () => {
    if (!files.idDocument || !files.proofOfAddress || !files.selfie) {
      setError("Please upload all required documents")
      return
    }

    setError("")
    setLoading(true)

    try {
      await kycService.submitKyc(formData, {
        idDocument: files.idDocument,
        proofOfAddress: files.proofOfAddress,
        selfie: files.selfie,
      })

      setSuccess(true)
      setStep("result")
    } catch (err: unknown) {
      const apiError = err as { message?: string }
      setError(apiError.message || "Submission failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderPersonalInfo = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Step 1 of 3 - Tell us about yourself</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Input
            id="nationality"
            value={formData.nationality}
            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Verification Level</Label>
          <Select value={formData.level} onValueChange={(value: any) => setFormData({ ...formData, level: value })}>
            <SelectTrigger id="level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TIER_1">Tier 1 - Basic</SelectItem>
              <SelectItem value="TIER_2">Tier 2 - Enhanced</SelectItem>
              <SelectItem value="TIER_3">Tier 3 - Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" onClick={() => setStep("identity")}>
          Next
        </Button>
      </CardContent>
    </Card>
  )

  const renderIdentity = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Identity Verification</CardTitle>
        <CardDescription>Step 2 of 3 - Provide your ID details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="idType">ID Type</Label>
          <Select value={formData.idType} onValueChange={(value) => setFormData({ ...formData, idType: value })}>
            <SelectTrigger id="idType">
              <SelectValue placeholder="Select ID type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="drivers_license">Driver's License</SelectItem>
              <SelectItem value="national_id">National ID Card</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="idNumber">ID Number</Label>
          <Input
            id="idNumber"
            value={formData.idNumber}
            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
            required
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="idDocument">ID Document (Front)</Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <input
              id="idDocument"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange("idDocument", e)}
              className="hidden"
            />
            <label htmlFor="idDocument" className="cursor-pointer">
              {files.idDocument ? (
                <div className="flex items-center justify-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <span>{files.idDocument.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="selfie">Selfie with ID</Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <input
              id="selfie"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("selfie", e)}
              className="hidden"
            />
            <label htmlFor="selfie" className="cursor-pointer">
              {files.selfie ? (
                <div className="flex items-center justify-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <span>{files.selfie.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload a selfie holding your ID</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep("personal")}>
            Back
          </Button>
          <Button className="flex-1" onClick={() => setStep("address")}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderAddress = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Address Information</CardTitle>
        <CardDescription>Step 3 of 3 - Confirm your address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="proofOfAddress">Proof of Address</Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <input
              id="proofOfAddress"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange("proofOfAddress", e)}
              className="hidden"
            />
            <label htmlFor="proofOfAddress" className="cursor-pointer">
              {files.proofOfAddress ? (
                <div className="flex items-center justify-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <span>{files.proofOfAddress.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Utility bill, bank statement, etc.</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep("identity")}>
            Back
          </Button>
          <Button className="flex-1" onClick={() => setStep("review")}>
            Review
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderReview = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Review & Submit</CardTitle>
        <CardDescription>Please verify all information is correct</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-muted-foreground">Full Name:</p>
              <p>{formData.fullName}</p>
              <p className="text-muted-foreground">Date of Birth:</p>
              <p>{formData.dateOfBirth}</p>
              <p className="text-muted-foreground">Nationality:</p>
              <p>{formData.nationality}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Identity</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-muted-foreground">ID Type:</p>
              <p>{formData.idType}</p>
              <p className="text-muted-foreground">ID Number:</p>
              <p>{formData.idNumber}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Address</h3>
            <p className="text-sm">
              {formData.address}, {formData.city}, {formData.state} {formData.postalCode}, {formData.country}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Documents</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                ID Document: {files.idDocument?.name}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Selfie: {files.selfie?.name}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Proof of Address: {files.proofOfAddress?.name}
              </li>
            </ul>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep("address")}>
            Back
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Application
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderResult = () => (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="pt-12 pb-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-success/10 mx-auto flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Application Submitted</h2>
          <p className="text-muted-foreground">
            Your KYC documents have been submitted for review. We'll notify you once the verification is complete.
          </p>
        </div>

        <Alert>
          <AlertDescription>
            Verification usually takes 1-3 business days. You can continue using your account with current limits.
          </AlertDescription>
        </Alert>

        <Button onClick={() => router.push("/app/kyc")}>Back to KYC</Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user || undefined} />

      <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6">
        {step === "personal" && renderPersonalInfo()}
        {step === "identity" && renderIdentity()}
        {step === "address" && renderAddress()}
        {step === "review" && renderReview()}
        {step === "result" && renderResult()}
      </main>

      <MobileNav />
    </div>
  )
}
