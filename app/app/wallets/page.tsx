"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MobileNav } from "@/components/mobile-nav"
import { WalletCard } from "@/components/wallet-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { authService } from "@/lib/auth-service"
import { walletService } from "@/lib/wallet-service"
import type { UserResponse, WalletResponse } from "@/lib/types"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function WalletsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserResponse | null>(null)
  const [wallets, setWallets] = useState<WalletResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState("NGN")

  const currencies = ["NGN", "USD", "EUR", "GBP"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, walletsResponse] = await Promise.all([
          authService.getCurrentUser(),
          walletService.getWallets(),
        ])

        setUser(userResponse.data)
        setWallets(walletsResponse.data)
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleCreateWallet = async () => {
    setCreating(true)
    try {
      const response = await walletService.createWallet({ currency: selectedCurrency })
      if (response.success) {
        setWallets([...wallets, response.data])
        setDialogOpen(false)
        toast({
          title: "Wallet Created",
          description: `Your ${selectedCurrency} wallet has been created successfully`,
        })
      }
    } catch (error) {
      console.error("[v0] Error creating wallet:", error)
      toast({
        title: "Error",
        description: "Failed to create wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user || undefined} />

      <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Wallets</h1>
            <p className="text-muted-foreground mt-1">Manage your digital wallets</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleCreateWallet} disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Wallet
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              onViewDetails={() => router.push(`/app/wallets/${wallet.walletNumber}`)}
            />
          ))}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
