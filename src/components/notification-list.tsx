"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Bell, Calendar, User, AlertCircle } from "lucide-react"

// Mock notification data
const notifications = [
  {
    id: "n1",
    type: "admission",
    message: "A patient assigned to your office has been admitted",
    timestamp: "2023-05-24T10:30:00Z",
    read: false,
    patientId: "P003",
  },
  {
    id: "n2",
    type: "discharge",
    message: "A patient assigned to your office has been discharged",
    timestamp: "2023-05-23T15:45:00Z",
    read: false,
    patientId: "P001",
  },
  {
    id: "n3",
    type: "new_record",
    message: "A new patient record has been added to your account",
    timestamp: "2023-05-23T09:15:00Z",
    read: true,
    patientId: "P002",
  },
  {
    id: "n4",
    type: "followup_reminder",
    message: "Follow-up reminder: Patient John Smith needs to be contacted",
    timestamp: "2023-05-22T14:00:00Z",
    read: true,
    patientId: "P001",
  },
  {
    id: "n5",
    type: "discharge",
    message: "A patient assigned to your office has been discharged",
    timestamp: "2023-05-22T11:30:00Z",
    read: true,
    patientId: "P004",
  },
]

export function NotificationList() {
  const [notificationItems, setNotificationItems] = useState(notifications)
  const { toast } = useToast()

  const markAllAsRead = () => {
    setNotificationItems(notificationItems.map((n) => ({ ...n, read: true })))
    toast({
      title: "Notifications marked as read",
      description: "All notifications have been marked as read",
    })
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "admission":
        return <User className="h-5 w-5 text-blue-500" />
      case "discharge":
        return <Bell className="h-5 w-5 text-green-500" />
      case "followup_reminder":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "new_record":
        return <Calendar className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Your latest notifications and alerts</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead}>
          Mark all as read
        </Button>
      </CardHeader>
      <CardContent className="max-h-[500px] overflow-auto">
        <div className="space-y-4">
          {notificationItems.length > 0 ? (
            notificationItems.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 rounded-lg border p-3 ${
                  notification.read ? "bg-background" : "bg-muted/50"
                }`}
              >
                <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 space-y-1">
                  <p className={`text-sm ${notification.read ? "font-normal" : "font-medium"}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatTimestamp(notification.timestamp)}</p>
                </div>
                <Link href={`/dashboard/patients/${notification.patientId}`}>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground">You don't have any notifications at the moment</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 p-2">
        <Link href="/dashboard/notifications/settings" className="w-full">
          <Button variant="ghost" size="sm" className="w-full">
            Manage notification settings
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
