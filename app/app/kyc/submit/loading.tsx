import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}
