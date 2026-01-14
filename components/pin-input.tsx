"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PinInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  className?: string
}

export function PinInput({ length = 4, value, onChange, className }: PinInputProps) {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return

    const newValue = value.split("")
    newValue[index] = digit
    const updatedValue = newValue.join("")

    onChange(updatedValue.slice(0, length))

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => setFocusedIndex(index)}
          className="w-12 h-12 text-center text-lg font-semibold"
        />
      ))}
    </div>
  )
}
