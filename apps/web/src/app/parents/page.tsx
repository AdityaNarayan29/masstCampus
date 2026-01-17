"use client"

import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon, ArrowUpDownIcon, Loader2Icon, UsersIcon } from "lucide-react"
import { toast } from "sonner"

import { PageLayout } from "@/components/page-layout"
import { EntityTable } from "@/components/entity-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { ParentForm } from "@/components/forms/parent-form"
import { type ParentFormData } from "@/lib/schemas"
import { parentsApi } from "@/lib/api"

type Parent = {
  id: string
  name: string
  email: string
  phone: string
  children: number
  occupation?: string
  address?: string
  status: "active" | "inactive"
  createdAt: string
}

const demoParents: Parent[] = [
  {
    id: "1",
    name: "Rajesh Sharma",
    email: "rajesh.sharma@email.com",
    phone: "+91 98765 43210",
    children: 2,
    occupation: "Engineer",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Sunita Patel",
    email: "sunita.patel@email.com",
    phone: "+91 98765 43211",
    children: 1,
    occupation: "Doctor",
    status: "active",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Amit Kumar",
    email: "amit.kumar@email.com",
    phone: "+91 98765 43212",
    children: 3,
    occupation: "Business Owner",
    status: "active",
    createdAt: "2024-03-10",
  },
]

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [parentToDelete, setParentToDelete] = useState<Parent | null>(null)

  useEffect(() => {
    fetchParents()
  }, [])

  const fetchParents = async () => {
    try {
      const response = await parentsApi.getAll()
      if (response.success && response.data) {
        const formattedParents = response.data.parents.map((p: any) => ({
          id: p.id,
          name: p.user ? `${p.user.profile?.firstName || ''} ${p.user.profile?.lastName || ''}`.trim() : "Unknown",
          email: p.user?.email || "N/A",
          phone: p.phone || p.user?.profile?.phone || "N/A",
          children: p._count?.children || 0,
          occupation: p.occupation,
          address: p.address,
          status: p.user?.isActive ? "active" : "inactive",
          createdAt: p.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
        }))
        setParents(formattedParents)
      }
    } catch (error) {
      console.error("Failed to fetch parents:", error)
      setParents(demoParents)
      toast.info("Using demo data (API unavailable)")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedParent(null)
    setIsSheetOpen(true)
  }

  const handleEdit = (parent: Parent) => {
    setSelectedParent(parent)
    setIsSheetOpen(true)
  }

  const handleDelete = (parent: Parent) => {
    setParentToDelete(parent)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (parentToDelete) {
      try {
        await parentsApi.delete(parentToDelete.id)
        setParents(parents.filter((p) => p.id !== parentToDelete.id))
        toast.success(`${parentToDelete.name} has been removed`)
      } catch (error) {
        setParents(parents.filter((p) => p.id !== parentToDelete.id))
        toast.success(`${parentToDelete.name} has been removed (Demo Mode)`)
      }
      setDeleteDialogOpen(false)
      setParentToDelete(null)
    }
  }

  const handleFormSubmit = async (data: ParentFormData) => {
    const nameParts = data.name.split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(" ") || ""

    if (selectedParent) {
      try {
        await parentsApi.update(selectedParent.id, {
          firstName,
          lastName,
          email: data.email,
          phone: data.phone,
          occupation: data.occupation,
          address: data.address,
        })
        setParents(
          parents.map((p) =>
            p.id === selectedParent.id ? { ...p, ...data, children: selectedParent.children } : p
          )
        )
        toast.success(`${data.name} has been updated`)
      } catch (error) {
        setParents(
          parents.map((p) =>
            p.id === selectedParent.id ? { ...p, ...data, children: selectedParent.children } : p
          )
        )
        toast.success(`${data.name} has been updated (Demo Mode)`)
      }
    } else {
      try {
        const response = await parentsApi.create({
          firstName,
          lastName,
          email: data.email,
          phone: data.phone,
          occupation: data.occupation,
          address: data.address,
        })
        if (response.success && response.data) {
          const newParent: Parent = {
            id: response.data.id,
            ...data,
            children: 0,
            createdAt: new Date().toISOString().split("T")[0],
          }
          setParents([...parents, newParent])
          toast.success(`${data.name} has been added`)
        }
      } catch (error) {
        const newParent: Parent = {
          id: String(Date.now()),
          ...data,
          children: 0,
          createdAt: new Date().toISOString().split("T")[0],
        }
        setParents([...parents, newParent])
        toast.success(`${data.name} has been added (Demo Mode)`)
      }
    }
    setIsSheetOpen(false)
    setSelectedParent(null)
  }

  const columns: ColumnDef<Parent>[] = [
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
            Parent
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const parent = row.original
        const initials = parent.name.split(" ").map(n => n[0]).join("")
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={undefined} alt={parent.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{parent.name}</div>
              <div className="text-sm text-muted-foreground">{parent.email}</div>
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
      accessorKey: "children",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Children
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue("children")}</span>
        </div>
      ),
    },
    {
      accessorKey: "occupation",
      header: "Occupation",
      cell: ({ row }) => <div>{row.getValue("occupation") || "N/A"}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "active" ? "default" : "destructive"}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Registered",
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
        const parent = row.original

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(parent.id)}>
                Copy parent ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(parent)}>
                Edit details
              </DropdownMenuItem>
              <DropdownMenuItem>View children</DropdownMenuItem>
              <DropdownMenuItem>Send message</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(parent)}
              >
                Remove parent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const activeParents = parents.filter((p) => p.status === "active").length
  const totalChildren = parents.reduce((sum, p) => sum + p.children, 0)
  const avgChildren = parents.length > 0 ? (totalChildren / parents.length).toFixed(1) : "0"

  if (loading) {
    return (
      <PageLayout title="Parents" breadcrumbs={[{ label: "Parents" }]}>
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Parents" breadcrumbs={[{ label: "Parents" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parents</h1>
          <p className="text-muted-foreground">
            Manage all parents across all schools
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Parents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parents.length}</div>
              <p className="text-xs text-muted-foreground">Registered parents</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Parents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeParents}</div>
              <p className="text-xs text-muted-foreground">
                {parents.length > 0 ? Math.round((activeParents / parents.length) * 100) : 0}% active rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Children</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalChildren}</div>
              <p className="text-xs text-muted-foreground">Students enrolled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Children</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgChildren}</div>
              <p className="text-xs text-muted-foreground">per parent</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Parents</CardTitle>
            <CardDescription>
              A list of all parents registered across all schools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EntityTable
              columns={columns}
              data={parents}
              searchKey="name"
              searchPlaceholder="Search parents..."
              onAdd={handleAdd}
              addButtonLabel="Add Parent"
            />
          </CardContent>
        </Card>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedParent ? "Edit Parent" : "Add Parent"}</SheetTitle>
            <SheetDescription>
              {selectedParent
                ? "Update the parent details below."
                : "Fill in the details to add a new parent."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <ParentForm
              parent={selectedParent}
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
              This will permanently remove {parentToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  )
}
