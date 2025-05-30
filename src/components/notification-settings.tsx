"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export function NotificationSettings() {
  const [emailAdmissions, setEmailAdmissions] = useState(true)
  const [emailDischarges, setEmailDischarges] = useState(true)
  const [smsAdmissions, setSmsAdmissions] = useState(false)
  const [smsDischarges, setSmsDischarges] = useState(true)
  const [immediateNotifications, setImmediateNotifications] = useState(true)
  const { toast } = useToast()

  const handleSaveSettings = () => {
    toast({
      title: "Notification settings saved",
      description: "Your discharge notification preferences have been updated",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Discharge Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you receive notifications about patient admissions and discharges. 
          <strong> No PHI (Protected Health Information) is included in notifications.</strong>
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div>
          <h4 className="text-md font-medium mb-3">Email Notifications</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-admissions">Patient Admissions</Label>
                <p className="text-xs text-muted-foreground">
                  "A patient assigned to your practice has been admitted"
                </p>
              </div>
              <Switch
                id="email-admissions"
                checked={emailAdmissions}
                onCheckedChange={setEmailAdmissions}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-discharges">Patient Discharges</Label>
                <p className="text-xs text-muted-foreground">
                  "A patient assigned to your practice has been discharged"
                </p>
              </div>
              <Switch
                id="email-discharges"
                checked={emailDischarges}
                onCheckedChange={setEmailDischarges}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-md font-medium mb-3">SMS Notifications</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-admissions">Patient Admissions</Label>
                <p className="text-xs text-muted-foreground">
                  Text notifications for admissions
                </p>
              </div>
              <Switch
                id="sms-admissions"
                checked={smsAdmissions}
                onCheckedChange={setSmsAdmissions}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-discharges">Patient Discharges</Label>
                <p className="text-xs text-muted-foreground">
                  Text notifications for discharges (recommended for follow-up)
                </p>
              </div>
              <Switch
                id="sms-discharges"
                checked={smsDischarges}
                onCheckedChange={setSmsDischarges}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-md font-medium mb-3">Timing</h4>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="immediate">Immediate Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive notifications as soon as events occur (recommended for Medicare Advantage)
              </p>
            </div>
            <Switch
              id="immediate"
              checked={immediateNotifications}
              onCheckedChange={setImmediateNotifications}
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">HIPAA Compliance Note</h4>
        <p className="text-xs text-blue-800">
          All notifications are sent without Protected Health Information (PHI). 
          Patient details are only accessible through this secure portal after authentication.
          This ensures compliance with HIPAA regulations while enabling timely care coordination.
        </p>
      </div>

      <Button onClick={handleSaveSettings} className="w-full">
        Save Notification Settings
      </Button>
    </div>
  )
}
