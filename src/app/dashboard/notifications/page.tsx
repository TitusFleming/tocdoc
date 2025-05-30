import { NotificationList } from "@/components/notification-list"
import { NotificationSettings } from "@/components/notification-settings"

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Manage your notification preferences and view recent notifications.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <NotificationList />
        <NotificationSettings />
      </div>
    </div>
  )
}
