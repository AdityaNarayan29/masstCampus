"use client"

import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon, ArrowUpDownIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { PageLayout } from "@/components/page-layout"
import { EntityTable } from "@/components/entity-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
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
import { CounselorForm } from "@/components/forms/counselor-form"
import { type CounselorFormData } from "@/lib/schemas"
import { brokersApi } from "@/lib/api"

type Counselor = {
  id: string
  name: string
  email: string
  phone: string
  studentsReferred: number
  target: number
  commission: number
  status: "active" | "inactive"
  joinedAt: string
  avatar?: string
}

const demoCounselors: Counselor[] = [
  {
    id: "1",
    name: "Anita Sharma",
    email: "anita.sharma@masstcampus.com",
    phone: "+91 98765 43230",
    studentsReferred: 15,
    target: 20,
    commission: 45000,
    status: "active",
    joinedAt: "2023-09-15",
  },
  {
    id: "2",
    name: "Ravi Kumar",
    email: "ravi.kumar@masstcampus.com",
    phone: "+91 98765 43231",
    studentsReferred: 12,
    target: 20,
    commission: 36000,
    status: "active",
    joinedAt: "2023-10-20",
  },
  {
    id: "3",
    name: "Meera Counselor",
    email: "meera.c@masstcampus.com",
    phone: "+91 98765 43232",
    studentsReferred: 18,
    target: 20,
    commission: 54000,
    status: "active",
    joinedAt: "2023-08-10",
  },
]

export default function CounselorsPage() {
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [counselorToDelete, setCounselorToDelete] = useState<Counselor | null>(null)

  useEffect(() => {
    fetchCounselors()
  }, [])

  const fetchCounselors = async () => {
    try {
      const response = await brokersApi.getAll()
      if (response.success && response.data) {
        const formattedCounselors = response.data.map((b: any) => ({
          id: b.id,
          name: b.name,
          email: b.metadata?.email || `${b.code.toLowerCase()}@masstcampus.com`,
          phone: b.metadata?.phone || "N/A",
          studentsReferred: b._count?.students || 0,
          target: b.metadata?.target || 20,
          commission: b.metadata?.totalCommission || 0,
          status: b.isActive ? "active" : "inactive",
          joinedAt: b.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
        }))
        setCounselors(formattedCounselors)
      }
    } catch (error) {
      console.error("Failed to fetch counselors:", error)
      setCounselors(demoCounselors)
      toast.info("Using demo data (API unavailable)")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedCounselor(null)
    setIsSheetOpen(true)
  }

  const handleEdit = (counselor: Counselor) => {
    setSelectedCounselor(counselor)
    setIsSheetOpen(true)
  }

  const handleDelete = (counselor: Counselor) => {
    setCounselorToDelete(counselor)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (counselorToDelete) {
      try {
        await brokersApi.delete(counselorToDelete.id)
        setCounselors(counselors.filter((c) => c.id !== counselorToDelete.id))
        toast.success(`${counselorToDelete.name} has been deactivated`)
      } catch (error) {
        setCounselors(counselors.filter((c) => c.id !== counselorToDelete.id))
        toast.success(`${counselorToDelete.name} has been deactivated (Demo Mode)`)
      }
      setDeleteDialogOpen(false)
      setCounselorToDelete(null)
    }
  }

  const handleFormSubmit = async (data: CounselorFormData) => {
    if (selectedCounselor) {
      try {
        await brokersApi.update(selectedCounselor.id, {
          name: data.name,
          isActive: data.status === "active",
          metadata: {
            email: data.email,
            phone: data.phone,
            target: data.target,
          },
        })
        setCounselors(
          counselors.map((c) =>
            c.id === selectedCounselor.id
              ? { ...c, ...data }
              : c
          )
        )
        toast.success(`${data.name} has been updated`)
      } catch (error) {
        setCounselors(
          counselors.map((c) =>
            c.id === selectedCounselor.id
              ? { ...c, ...data }
              : c
          )
        )
        toast.success(`${data.name} has been updated (Demo Mode)`)
      }
    } else {
      try {
        const code = data.name.toUpperCase().replace(/\s+/g, "_").slice(0, 10)
        const response = await brokersApi.create({
          name: data.name,
          code: code,
          metadata: {
            email: data.email,
            phone: data.phone,
            target: data.target,
          },
        })
        if (response.success && response.data) {
          const newCounselor: Counselor = {
            id: response.data.id,
            ...data,
            studentsReferred: 0,
            commission: 0,
            joinedAt: new Date().toISOString().split("T")[0],
          }
          setCounselors([...counselors, newCounselor])
          toast.success(`${data.name} has been added`)
        }
      } catch (error) {
        const newCounselor: Counselor = {
          id: String(Date.now()),
          ...data,
          studentsReferred: 0,
          commission: 0,
          joinedAt: new Date().toISOString().split("T")[0],
        }
        setCounselors([...counselors, newCounselor])
        toast.success(`${data.name} has been added (Demo Mode)`)
      }
    }
    setIsSheetOpen(false)
    setSelectedCounselor(null)
  }

  const columns: ColumnDef<Counselor>[] = [
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
            Counselor
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const counselor = row.original
        const initials = counselor.name.split(" ").map(n => n[0]).join("")
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={counselor.avatar} alt={counselor.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{counselor.name}</div>
              <div className="text-sm text-muted-foreground">{counselor.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
    {
      accessorKey: "studentsReferred",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Progress
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const counselor = row.original
        const progress = (counselor.studentsReferred / counselor.target) * 100
        return (
          <div className="w-32 space-y-1">
            <Progress value={Math.min(progress, 100)} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {counselor.studentsReferred}/{counselor.target} students
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "commission",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Commission
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = row.getValue("commission") as number
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(amount)
        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "joinedAt",
      header: "Joined",
      cell: ({ row }) => {
        const dateStr = row.getValue("joinedAt") as string
        const [year, month, day] = dateStr.split("-")
        return <div>{`${day}/${month}/${year}`}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const counselor = row.original

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(counselor.id)}>
                Copy counselor ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(counselor)}>
                Edit details
              </DropdownMenuItem>
              <DropdownMenuItem>View referrals</DropdownMenuItem>
              <DropdownMenuItem>Pay commission</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(counselor)}
              >
                Deactivate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const totalCommission = counselors.reduce((sum, c) => sum + c.commission, 0)
  const totalReferred = counselors.reduce((sum, c) => sum + c.studentsReferred, 0)
  const activeCounselors = counselors.filter(c => c.status === "active").length

  if (loading) {
    return (
      <PageLayout title="Counselors" breadcrumbs={[{ label: "Counselors" }]}>
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Counselors" breadcrumbs={[{ label: "Counselors" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Counselors</h1>
          <p className="text-muted-foreground">
            Manage counselors who help students enroll in schools
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Counselors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counselors.length}</div>
              <p className="text-xs text-muted-foreground">Registered counselors</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Counselors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCounselors}</div>
              <p className="text-xs text-muted-foreground">
                {counselors.length > 0 ? Math.round((activeCounselors / counselors.length) * 100) : 0}% active rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referred</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReferred}</div>
              <p className="text-xs text-muted-foreground">students referred</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(totalCommission)}
              </div>
              <p className="text-xs text-muted-foreground">earned this quarter</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Counselors</CardTitle>
            <CardDescription>
              A list of all counselors helping students find schools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EntityTable
              columns={columns}
              data={counselors}
              searchKey="name"
              searchPlaceholder="Search counselors..."
              onAdd={handleAdd}
              addButtonLabel="Add Counselor"
            />
          </CardContent>
        </Card>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedCounselor ? "Edit Counselor" : "Add Counselor"}</SheetTitle>
            <SheetDescription>
              {selectedCounselor
                ? "Update the counselor details below."
                : "Fill in the details to add a new counselor."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <CounselorForm
              counselor={selectedCounselor}
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
              This will deactivate {counselorToDelete?.name}. They will no longer be able to refer students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  )
}
