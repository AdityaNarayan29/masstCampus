"use client"

import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon, ArrowUpDownIcon, ExternalLinkIcon, Loader2Icon } from "lucide-react"
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
import { PartnerForm } from "@/components/forms/partner-form"
import { type PartnerFormData } from "@/lib/schemas"
import { brokersApi } from "@/lib/api"

type Partner = {
  id: string
  name: string
  type: "individual" | "company"
  email: string
  phone: string
  schoolsOnboarded: number
  commission: number
  status: "active" | "inactive" | "pending"
  website?: string
  joinedAt: string
  avatar?: string
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null)

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      const response = await brokersApi.getAll()
      if (response.success && response.data) {
        const formattedPartners = response.data.map((b: any) => ({
          id: b.id,
          name: b.name,
          type: b.level === 0 ? "company" : "individual",
          email: b.metadata?.email || `${b.code.toLowerCase()}@partner.com`,
          phone: b.metadata?.phone || "N/A",
          schoolsOnboarded: b._count?.students || 0,
          commission: b._count?.commissions || 0,
          status: b.isActive ? "active" : "inactive",
          website: b.metadata?.website,
          joinedAt: b.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
        }))
        setPartners(formattedPartners)
      }
    } catch (error) {
      console.error("Failed to fetch partners:", error)
      toast.error("Failed to load partners")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedPartner(null)
    setIsSheetOpen(true)
  }

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner)
    setIsSheetOpen(true)
  }

  const handleDelete = (partner: Partner) => {
    setPartnerToDelete(partner)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (partnerToDelete) {
      try {
        await brokersApi.delete(partnerToDelete.id)
        setPartners(partners.filter((p) => p.id !== partnerToDelete.id))
        toast.success(`${partnerToDelete.name} has been deactivated`)
      } catch (error) {
        toast.error("Failed to deactivate partner")
      }
      setDeleteDialogOpen(false)
      setPartnerToDelete(null)
    }
  }

  const handleFormSubmit = async (data: PartnerFormData) => {
    if (selectedPartner) {
      try {
        await brokersApi.update(selectedPartner.id, {
          name: data.name,
          isActive: data.status === "active",
          metadata: {
            email: data.email,
            phone: data.phone,
            website: data.website,
          },
        })
        setPartners(
          partners.map((p) =>
            p.id === selectedPartner.id ? { ...p, ...data } : p
          )
        )
        toast.success(`${data.name} has been updated`)
      } catch (error) {
        toast.error("Failed to update partner")
      }
    } else {
      try {
        const code = data.name.toUpperCase().replace(/\s+/g, "_").slice(0, 10) + "-" + Date.now().toString().slice(-4)
        const response = await brokersApi.create({
          name: data.name,
          code,
          metadata: {
            email: data.email,
            phone: data.phone,
            website: data.website,
          },
        })
        if (response.success && response.data) {
          const newPartner: Partner = {
            id: response.data.id,
            ...data,
            schoolsOnboarded: 0,
            commission: 0,
            joinedAt: new Date().toISOString().split("T")[0],
          }
          setPartners([...partners, newPartner])
          toast.success(`${data.name} has been added`)
        }
      } catch (error) {
        toast.error("Failed to add partner")
      }
    }
    setIsSheetOpen(false)
    setSelectedPartner(null)
  }

  const columns: ColumnDef<Partner>[] = [
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
            Partner
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const partner = row.original
        const initials = partner.name.split(" ").map(n => n[0]).join("").slice(0, 2)
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={partner.avatar} alt={partner.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium flex items-center gap-2">
                {partner.name}
                {partner.website && (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLinkIcon className="h-3 w-3 text-muted-foreground" />
                  </a>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{partner.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return (
          <Badge variant="outline" className="capitalize">
            {type}
          </Badge>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
    {
      accessorKey: "schoolsOnboarded",
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
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.getValue("schoolsOnboarded")}</div>
      ),
    },
    {
      accessorKey: "commission",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Commissions
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const count = row.getValue("commission") as number
        return <div className="text-center font-medium">{count}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge
            variant={
              status === "active"
                ? "default"
                : status === "pending"
                ? "secondary"
                : "destructive"
            }
          >
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
        const partner = row.original

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(partner.id)}>
                Copy partner ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(partner)}>
                Edit details
              </DropdownMenuItem>
              <DropdownMenuItem>View schools</DropdownMenuItem>
              <DropdownMenuItem>Pay commission</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(partner)}
              >
                Deactivate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const totalSchools = partners.reduce((sum, p) => sum + p.schoolsOnboarded, 0)
  const activePartners = partners.filter(p => p.status === "active").length

  if (loading) {
    return (
      <PageLayout title="Partners" breadcrumbs={[{ label: "Partners" }]}>
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Partners" breadcrumbs={[{ label: "Partners" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partners</h1>
          <p className="text-muted-foreground">
            Manage brokers and agents who help enroll students
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partners.length}</div>
              <p className="text-xs text-muted-foreground">Brokers & agents</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePartners}</div>
              <p className="text-xs text-muted-foreground">
                {partners.length > 0 ? Math.round((activePartners / partners.length) * 100) : 0}% active rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students Enrolled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSchools}</div>
              <p className="text-xs text-muted-foreground">via partners</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg per Partner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {partners.length > 0 ? (totalSchools / partners.length).toFixed(1) : 0}
              </div>
              <p className="text-xs text-muted-foreground">students per partner</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Partners</CardTitle>
            <CardDescription>
              A list of all brokers and agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EntityTable
              columns={columns}
              data={partners}
              searchKey="name"
              searchPlaceholder="Search partners..."
              onAdd={handleAdd}
              addButtonLabel="Add Partner"
            />
          </CardContent>
        </Card>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedPartner ? "Edit Partner" : "Add Partner"}</SheetTitle>
            <SheetDescription>
              {selectedPartner
                ? "Update the partner details below."
                : "Fill in the details to add a new partner."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <PartnerForm
              partner={selectedPartner}
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
              This will deactivate {partnerToDelete?.name}. They will no longer be able to enroll students.
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
