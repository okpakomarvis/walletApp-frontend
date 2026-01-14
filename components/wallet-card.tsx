"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Eye, EyeOff } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import type { WalletResponse } from "@/lib/types"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface WalletCardProps {
  wallet: WalletResponse
  onViewDetails?: () => void
}

export function WalletCard({ wallet, onViewDetails }: WalletCardProps) {
  const [showBalance, setShowBalance] = useState(true)
  const { toast } = useToast()

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const maskWalletNumber = (number: string) => {
    return `****${number.slice(-4)}`
  }

  const copyWalletNumber = () => {
    navigator.clipboard.writeText(wallet.walletNumber)
    toast({
      title: "Copied!",
      description: "Wallet number copied to clipboard",
    })
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">{wallet.currency}</span>
          </div>
          <StatusBadge status={wallet.status} type="wallet" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold">
              {showBalance ? formatCurrency(wallet.balance, wallet.currency) : "••••••"}
            </p>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
          <p className="text-lg font-semibold text-success">
            {showBalance ? formatCurrency(wallet.availableBalance, wallet.currency) : "••••••"}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Wallet Number</p>
            <p className="text-sm font-mono font-medium">{maskWalletNumber(wallet.walletNumber)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyWalletNumber}>
              <Copy className="h-4 w-4" />
            </Button>
            {onViewDetails && (
              <Button variant="outline" size="sm" onClick={onViewDetails}>
                Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
