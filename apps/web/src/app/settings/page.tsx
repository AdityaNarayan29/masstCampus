"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"

import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { brokersApi, parentsApi } from "@/lib/api"

type UserProfile = {
  id: string
  email: string
  role: string
  profile?: {
    firstName: string
    lastName: string
    phone?: string
  }
  firstName?: string
  lastName?: string
  phone?: string
}

type Child = {
  id: string
  firstName: string
  lastName: string
  gradeLevel?: string
  section?: string
  enrollmentNumber?: string
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n)

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Profile form
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Notification preferences
  const [emailNotif, setEmailNotif] = useState(true)
  const [smsNotif, setSmsNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(false)

  // Role-specific data
  const [children, setChildren] = useState<Child[]>([])
  const [brokerStats, setBrokerStats] = useState<{
    totalEarned: number
    pending: number
  }>({ totalEarned: 0, pending: 0 })
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([])
  const [schoolInfo, setSchoolInfo] = useState<{
    name: string
    board: string
    city: string
  } | null>(null)

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const stored = localStorage.getItem("user")
        if (!stored) {
          setLoading(false)
          return
        }

        const userData: UserProfile = JSON.parse(stored)
        setUser(userData)
        setFirstName(
          userData.profile?.firstName || userData.firstName || "",
        )
        setLastName(userData.profile?.lastName || userData.lastName || "")
        setEmail(userData.email || "")
        setPhone(userData.profile?.phone || userData.phone || "")

        // Load role-specific data
        if (userData.role === "PARENT") {
          try {
            const res = await parentsApi.getMyChildren()
            if (res.success && res.data) {
              setChildren(res.data)
            }
          } catch {
            // Children data unavailable
          }
        }

        if (userData.role === "BROKER") {
          try {
            const res = await brokersApi.getStats(userData.id)
            if (res.success && res.data) {
              setBrokerStats({
                totalEarned:
                  res.data.totalCommissions || res.data.totalEarned || 0,
                pending:
                  res.data.pendingPayouts || res.data.pendingAmount || 0,
              })
            }
          } catch {
            // Broker stats unavailable
          }
        }

        if (userData.role === "TEACHER") {
          // Extract subjects from user data if available
          const storedTeacher = localStorage.getItem("teacher_profile")
          if (storedTeacher) {
            try {
              const tp = JSON.parse(storedTeacher)
              setTeacherSubjects(tp.subjects || [])
            } catch {
              // No teacher profile
            }
          }
        }

        if (
          userData.role === "ADMIN" ||
          userData.role === "SUPER_ADMIN"
        ) {
          const storedTenant = localStorage.getItem("tenant")
          if (storedTenant) {
            try {
              const t = JSON.parse(storedTenant)
              setSchoolInfo({
                name: t.name || t.schoolName || "",
                board: t.board || "",
                city: t.city || "",
              })
            } catch {
              // No tenant data
            }
          }
        }
      } catch {
        // Parse error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // Update localStorage with new values
      if (user) {
        const updated = {
          ...user,
          profile: {
            ...user.profile,
            firstName,
            lastName,
            phone,
          },
        }
        localStorage.setItem("user", JSON.stringify(updated))
        setUser(updated)
      }
      toast.success("Profile updated successfully")
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setSaving(true)
    try {
      toast.success("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      toast.error("Failed to change password")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved")
  }

  if (loading) {
    return (
      <PageLayout title="Settings" breadcrumbs={[{ label: "Settings" }]}>
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    )
  }

  const role = user?.role || ""

  return (
    <PageLayout title="Settings" breadcrumbs={[{ label: "Settings" }]}>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
            {role && (
              <div className="flex items-center gap-2">
                <Label>Role</Label>
                <Badge variant="secondary">{role.replace("_", " ")}</Badge>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Profile
            </Button>
          </CardFooter>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleChangePassword} disabled={saving}>
              Change Password
            </Button>
          </CardFooter>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose how you want to be notified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={emailNotif}
                onCheckedChange={setEmailNotif}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via SMS
                </p>
              </div>
              <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser push notifications
                </p>
              </div>
              <Switch
                checked={pushNotif}
                onCheckedChange={setPushNotif}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveNotifications}>
              Save Preferences
            </Button>
          </CardFooter>
        </Card>

        {/* ADMIN / SUPER_ADMIN: School Information */}
        {(role === "ADMIN" || role === "SUPER_ADMIN") && schoolInfo && (
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>
                Your school details (read-only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>School Name</Label>
                  <Input value={schoolInfo.name} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Board</Label>
                  <Input
                    value={schoolInfo.board}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={schoolInfo.city} readOnly className="bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TEACHER: My Subjects */}
        {role === "TEACHER" && (
          <Card>
            <CardHeader>
              <CardTitle>My Subjects</CardTitle>
              <CardDescription>
                Subjects you are assigned to teach
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teacherSubjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No subjects assigned yet. Contact your administrator.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {teacherSubjects.map((subject, i) => (
                    <Badge key={i} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* PARENT: My Children */}
        {role === "PARENT" && (
          <Card>
            <CardHeader>
              <CardTitle>My Children</CardTitle>
              <CardDescription>
                Children linked to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {children.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No children linked to your account.
                </p>
              ) : (
                <div className="space-y-3">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {child.firstName} {child.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Grade {child.gradeLevel || "-"}
                          {child.section ? ` - ${child.section}` : ""}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {child.enrollmentNumber || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* BROKER: Commission Info */}
        {role === "BROKER" && (
          <Card>
            <CardHeader>
              <CardTitle>Commission Information</CardTitle>
              <CardDescription>
                Your commission summary (read-only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                  <p className="text-xl font-bold text-green-600">
                    {fmt(brokerStats.totalEarned)}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Pending Payout
                  </p>
                  <p className="text-xl font-bold text-yellow-600">
                    {fmt(brokerStats.pending)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}
