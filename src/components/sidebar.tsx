"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Bell, Settings, HelpCircle, FileText, Calendar, Shield } from "lucide-react"

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Admin Panel",
    href: "/dashboard/admin",
    icon: Shield,
    adminOnly: true,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const response = await fetch('/api/user/role')
          if (response.ok) {
            const data = await response.json()
            setUserRole(data.role)
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
        }
      }
    }

    fetchUserRole()
  }, [user])

  const visibleLinks = sidebarLinks.filter(link => {
    if (link.adminOnly) {
      return userRole === 'ADMIN'
    }
    return true
  })

  return (
    <aside className="hidden border-r bg-background md:block md:w-64">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="py-2">
          <h2 className="text-lg font-semibold tracking-tight">Navigation</h2>
        </div>
        <nav className="flex-1">
          <ul className="grid gap-1">
            {visibleLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === link.href && "bg-accent text-accent-foreground",
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto">
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium">HIPAA Compliance</p>
              <p className="text-xs text-muted-foreground">
                Remember: All patient data is protected health information. Never share login credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
