"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon, ArrowUpDownIcon } from "lucide-react"

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

const counselors: Counselor[] = [
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
  {
    id: "4",
    name: "Suresh Verma",
    email: "suresh.v@masstcampus.com",
    phone: "+91 98765 43233",
    studentsReferred: 8,
    target: 15,
    commission: 24000,
    status: "active",
    joinedAt: "2024-01-05",
  },
  {
    id: "5",
    name: "Priya Singh",
    email: "priya.s@masstcampus.com",
    phone: "+91 98765 43234",
    studentsReferred: 5,
    target: 15,
    commission: 15000,
    status: "inactive",
    joinedAt: "2023-12-01",
  },
]

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
          <Progress value={progress} className="h-2" />
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
            <DropdownMenuItem>Edit details</DropdownMenuItem>
            <DropdownMenuItem>View referrals</DropdownMenuItem>
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

export default function CounselorsPage() {
  const totalCommission = counselors.reduce((sum, c) => sum + c.commission, 0)
  const totalReferred = counselors.reduce((sum, c) => sum + c.studentsReferred, 0)

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
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Counselors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {counselors.filter(c => c.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">80% active rate</p>
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
              onAdd={() => console.log("Add counselor")}
              addButtonLabel="Add Counselor"
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
