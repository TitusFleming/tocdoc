"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Filter } from "lucide-react"

export function PatientSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would trigger a search
    console.log("Searching for:", searchTerm)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <form onSubmit={handleSearch} className="flex w-full max-w-lg items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, DOB, or diagnosis..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
          Search
        </Button>
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-4" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Filter Options</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="admitted" className="h-4 w-4 rounded border-gray-300" />
                    <Label htmlFor="admitted">Admitted</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="discharged" className="h-4 w-4 rounded border-gray-300" />
                    <Label htmlFor="discharged">Discharged</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="followup" className="h-4 w-4 rounded border-gray-300" />
                    <Label htmlFor="followup">Needs Follow-up</Label>
                  </div>
                </div>
              </div>
              <Button size="sm" className="w-full" onClick={() => setIsFiltersOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </form>
    </div>
  )
}
