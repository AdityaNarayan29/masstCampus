"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon, ArrowUpDownIcon } from "lucide-react"

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

type Teacher = {
  id: string
  name: string
  email: string
  phone: string
  school: string
  subjects: string[]
  status: "active" | "inactive" | "on_leave"
  joinedAt: string
  avatar?: string
}

const teachers: Teacher[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@vidyamandir.com",
    phone: "+91 98765 43220",
    school: "Vidyamandir Classes",
    subjects: ["Mathematics", "Physics"],
    status: "active",
    joinedAt: "2023-06-15",
  },
  {
    id: "2",
    name: "Jane Doe",
    email: "jane.doe@vidyamandir.com",
    phone: "+91 98765 43221",
    school: "Vidyamandir Classes",
    subjects: ["Chemistry", "Biology"],
    status: "active",
    joinedAt: "2023-08-20",
  },
  {
    id: "3",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@demo.com",
    phone: "+91 98765 43222",
    school: "Demo School",
    subjects: ["English", "History"],
    status: "active",
    joinedAt: "2024-01-10",
  },
  {
    id: "4",
    name: "Meera Patel",
    email: "meera.patel@demo.com",
    phone: "+91 98765 43223",
    school: "Demo School",
    subjects: ["Computer Science"],
    status: "on_leave",
    joinedAt: "2023-11-05",
  },
]

const columns: ColumnDef<Teacher>[] = [
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
          Teacher
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const teacher = row.original
      const initials = teacher.name.split(" ").map(n => n[0]).join("")
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={teacher.avatar} alt={teacher.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{teacher.name}</div>
            <div className="text-sm text-muted-foreground">{teacher.email}</div>
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
    accessorKey: "school",
    header: "School",
    cell: ({ row }) => <div>{row.getValue("school")}</div>,
  },
  {
    accessorKey: "subjects",
    header: "Subjects",
    cell: ({ row }) => {
      const subjects = row.getValue("subjects") as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {subjects.map((subject) => (
            <Badge key={subject} variant="outline" className="text-xs">
              {subject}
            </Badge>
          ))}
        </div>
      )
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
              : status === "on_leave"
              ? "secondary"
              : "destructive"
          }
        >
          {status === "on_leave" ? "On Leave" : status}
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
      const teacher = row.original

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(teacher.id)}>
              Copy teacher ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem>Edit details</DropdownMenuItem>
            <DropdownMenuItem>View schedule</DropdownMenuItem>
            <DropdownMenuItem>Assign classes</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Remove teacher
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function TeachersPage() {
  return (
    <PageLayout title="Teachers" breadcrumbs={[{ label: "Teachers" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">
            Manage all teachers across all schools
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">+1 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">75% active rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Meera Patel</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg per School</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">teachers per school</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Teachers</CardTitle>
            <CardDescription>
              A list of all teachers registered across all schools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EntityTable
              columns={columns}
              data={teachers}
              searchKey="name"
              searchPlaceholder="Search teachers..."
              onAdd={() => console.log("Add teacher")}
              addButtonLabel="Add Teacher"
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
