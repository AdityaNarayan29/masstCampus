"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon, ArrowUpDownIcon, ExternalLinkIcon } from "lucide-react"

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

const partners: Partner[] = [
  {
    id: "1",
    name: "EduConnect Ltd",
    type: "company",
    email: "contact@educonnect.com",
    phone: "+91 98765 43240",
    schoolsOnboarded: 5,
    commission: 250000,
    status: "active",
    website: "https://educonnect.com",
    joinedAt: "2023-06-15",
  },
  {
    id: "2",
    name: "SchoolBridge Inc",
    type: "company",
    email: "hello@schoolbridge.in",
    phone: "+91 98765 43241",
    schoolsOnboarded: 3,
    commission: 150000,
    status: "active",
    website: "https://schoolbridge.in",
    joinedAt: "2023-08-20",
  },
  {
    id: "3",
    name: "Vikram Mehta",
    type: "individual",
    email: "vikram.mehta@gmail.com",
    phone: "+91 98765 43242",
    schoolsOnboarded: 2,
    commission: 80000,
    status: "active",
    joinedAt: "2023-11-10",
  },
  {
    id: "4",
    name: "EduTech Solutions",
    type: "company",
    email: "info@edutechsol.com",
    phone: "+91 98765 43243",
    schoolsOnboarded: 0,
    commission: 0,
    status: "pending",
    website: "https://edutechsol.com",
    joinedAt: "2024-04-01",
  },
]

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
          Schools
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
        maximumFractionDigits: 0,
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
            <DropdownMenuItem>Edit details</DropdownMenuItem>
            <DropdownMenuItem>View schools</DropdownMenuItem>
            <DropdownMenuItem>Pay commission</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Deactivate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function PartnersPage() {
  const totalCommission = partners.reduce((sum, p) => sum + p.commission, 0)
  const totalSchools = partners.reduce((sum, p) => sum + p.schoolsOnboarded, 0)

  return (
    <PageLayout title="Partners" breadcrumbs={[{ label: "Partners" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partners</h1>
          <p className="text-muted-foreground">
            Manage partners who help onboard new schools to the platform
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partners.length}</div>
              <p className="text-xs text-muted-foreground">+1 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {partners.filter(p => p.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">75% active rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Schools Onboarded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSchools}</div>
              <p className="text-xs text-muted-foreground">via partners</p>
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
              <p className="text-xs text-muted-foreground">paid out</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Partners</CardTitle>
            <CardDescription>
              A list of all partners helping onboard schools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EntityTable
              columns={columns}
              data={partners}
              searchKey="name"
              searchPlaceholder="Search partners..."
              onAdd={() => console.log("Add partner")}
              addButtonLabel="Add Partner"
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
