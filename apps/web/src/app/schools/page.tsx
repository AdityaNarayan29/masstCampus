"use client"

import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon, ArrowUpDownIcon, CheckCircle2Icon, XCircleIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { PageLayout } from "@/components/page-layout"
import { EntityTable } from "@/components/entity-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SchoolForm } from "@/components/forms/school-form"
import { type SchoolWithThemeFormData } from "@/lib/schemas"
import { tenantApi } from "@/lib/api"
import type { TenantTheme } from "@school-crm/types"

// Helper to normalize theme from form data to TenantTheme
function normalizeTheme(theme: SchoolWithThemeFormData["theme"]): TenantTheme | undefined {
  if (!theme) return undefined
  return {
    ...theme,
    fonts: theme.fonts ? {
      heading: theme.fonts.heading || "Inter, sans-serif",
      body: theme.fonts.body || "Inter, sans-serif",
    } : undefined,
  }
}

type School = {
  id: string
  name: string
  domain: string
  students: number
  teachers: number
  status: "active" | "inactive" | "pending"
  plan: "free" | "basic" | "premium"
  createdAt: string
  theme?: TenantTheme
}

const demoSchools: School[] = [
  {
    id: "1",
    name: "Vidyamandir Classes",
    domain: "vidyamandir.masstcampus.com",
    students: 150,
    teachers: 12,
    status: "active",
    plan: "premium",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Demo School",
    domain: "demo.masstcampus.com",
    students: 50,
    teachers: 5,
    status: "active",
    plan: "basic",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Development Tenant",
    domain: "dev.masstcampus.com",
    students: 25,
    teachers: 3,
    status: "active",
    plan: "free",
    createdAt: "2024-03-10",
  },
]

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null)

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const response = await tenantApi.getAll()
      if (response.success && response.data) {
        const formattedSchools = response.data.map((t: any) => ({
          id: t.id,
          name: t.name,
          domain: t.domain || `${t.slug}.masstcampus.com`,
          students: t._count?.students || 0,
          teachers: t._count?.teachers || 0,
          status: t.isActive ? "active" : "inactive",
          plan: t.plan?.toLowerCase() || "free",
          createdAt: t.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
          theme: t.theme,
        }))
        setSchools(formattedSchools)
      }
    } catch (error) {
      console.error("Failed to fetch schools:", error)
      setSchools(demoSchools)
      toast.info("Using demo data (API unavailable)")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedSchool(null)
    setIsSheetOpen(true)
  }

  const handleEdit = (school: School) => {
    setSelectedSchool(school)
    setIsSheetOpen(true)
  }

  const handleDelete = (school: School) => {
    setSchoolToDelete(school)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (schoolToDelete) {
      try {
        await tenantApi.delete(schoolToDelete.id)
        setSchools(schools.filter((s) => s.id !== schoolToDelete.id))
        toast.success(`${schoolToDelete.name} has been deleted`)
      } catch (error) {
        setSchools(schools.filter((s) => s.id !== schoolToDelete.id))
        toast.success(`${schoolToDelete.name} has been deleted (Demo Mode)`)
      }
      setDeleteDialogOpen(false)
      setSchoolToDelete(null)
    }
  }

  const handleFormSubmit = async (data: SchoolWithThemeFormData) => {
    if (selectedSchool) {
      try {
        await tenantApi.update(selectedSchool.id, {
          name: data.name,
          domain: data.domain,
          isActive: data.status === "active",
          plan: data.plan.toUpperCase(),
          theme: data.theme,
        })
        setSchools(
          schools.map((s) =>
            s.id === selectedSchool.id
              ? { ...s, name: data.name, domain: data.domain, status: data.status, plan: data.plan, theme: normalizeTheme(data.theme) }
              : s
          )
        )
        toast.success(`${data.name} has been updated`)
      } catch (error) {
        setSchools(
          schools.map((s) =>
            s.id === selectedSchool.id
              ? { ...s, name: data.name, domain: data.domain, status: data.status, plan: data.plan, theme: normalizeTheme(data.theme) }
              : s
          )
        )
        toast.success(`${data.name} has been updated (Demo Mode)`)
      }
    } else {
      try {
        const response = await tenantApi.create({
          name: data.name,
          domain: data.domain,
          slug: data.domain.split(".")[0],
          plan: data.plan.toUpperCase(),
          theme: data.theme,
        })
        if (response.success && response.data) {
          const newSchool: School = {
            id: response.data.id,
            name: data.name,
            domain: data.domain,
            status: data.status,
            plan: data.plan,
            theme: normalizeTheme(data.theme),
            students: 0,
            teachers: 0,
            createdAt: new Date().toISOString().split("T")[0],
          }
          setSchools([...schools, newSchool])
          toast.success(`${data.name} has been added`)
        }
      } catch (error) {
        const newSchool: School = {
          id: String(Date.now()),
          name: data.name,
          domain: data.domain,
          status: data.status,
          plan: data.plan,
          theme: normalizeTheme(data.theme),
          students: 0,
          teachers: 0,
          createdAt: new Date().toISOString().split("T")[0],
        }
        setSchools([...schools, newSchool])
        toast.success(`${data.name} has been added (Demo Mode)`)
      }
    }
    setIsSheetOpen(false)
    setSelectedSchool(null)
  }

  const columns: ColumnDef<School>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            School Name
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "domain",
      header: "Domain",
      cell: ({ row }) => (
        <code className="text-sm bg-muted px-2 py-1 rounded">
          {row.getValue("domain")}
        </code>
      ),
    },
    {
      accessorKey: "students",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Students
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="text-center">{row.getValue("students")}</div>,
    },
    {
      accessorKey: "teachers",
      header: "Teachers",
      cell: ({ row }) => <div className="text-center">{row.getValue("teachers")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge
            variant={status === "active" ? "default" : status === "pending" ? "secondary" : "destructive"}
            className="flex w-fit items-center gap-1"
          >
            {status === "active" ? (
              <CheckCircle2Icon className="h-3 w-3" />
            ) : (
              <XCircleIcon className="h-3 w-3" />
            )}
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "plan",
      header: "Plan",
      cell: ({ row }) => {
        const plan = row.getValue("plan") as string
        return (
          <Badge variant="outline" className="capitalize">
            {plan}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const dateStr = row.getValue("createdAt") as string
        const [year, month, day] = dateStr.split("-")
        return <div>{`${day}/${month}/${year}`}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const school = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(school.id)}>
                Copy school ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(school)}>
                Edit school
              </DropdownMenuItem>
              <DropdownMenuItem>Manage users</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(school)}
              >
                Delete school
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const totalStudents = schools.reduce((acc, s) => acc + s.students, 0)
  const activeSchools = schools.filter((s) => s.status === "active").length
  const premiumSchools = schools.filter((s) => s.plan === "premium").length

  if (loading) {
    return (
      <PageLayout title="Schools" breadcrumbs={[{ label: "Schools" }]}>
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Schools" breadcrumbs={[{ label: "Schools" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schools</h1>
          <p className="text-muted-foreground">
            Manage all registered schools on the platform
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schools.length}</div>
              <p className="text-xs text-muted-foreground">Registered on platform</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSchools}</div>
              <p className="text-xs text-muted-foreground">
                {schools.length > 0 ? Math.round((activeSchools / schools.length) * 100) : 0}% active rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Across all schools</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Schools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{premiumSchools}</div>
              <p className="text-xs text-muted-foreground">
                {schools.length > 0 ? Math.round((premiumSchools / schools.length) * 100) : 0}% on premium plan
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Schools</CardTitle>
            <CardDescription>
              A list of all schools registered on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EntityTable
              columns={columns}
              data={schools}
              searchKey="name"
              searchPlaceholder="Search schools..."
              onAdd={handleAdd}
              addButtonLabel="Add School"
            />
          </CardContent>
        </Card>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedSchool ? "Edit School" : "Add School"}</SheetTitle>
            <SheetDescription>
              {selectedSchool
                ? "Update the school details and theme settings."
                : "Fill in the details and customize the theme."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 pb-6">
            <SchoolForm
              school={selectedSchool}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {schoolToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  )
}
