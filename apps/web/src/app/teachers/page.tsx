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
import { TeacherForm } from "@/components/forms/teacher-form"
import { type TeacherFormData } from "@/lib/schemas"
import { teachersApi } from "@/lib/api"

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

const schools = ["Vidyamandir Classes", "Demo School", "Development Tenant"]

const demoTeachers: Teacher[] = [
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
]

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null)

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await teachersApi.getAll()
      if (response.success && response.data) {
        const formattedTeachers = response.data.teachers.map((t: any) => ({
          id: t.id,
          name: `${t.firstName} ${t.lastName}`,
          email: t.email,
          phone: t.phone || "N/A",
          school: t.tenant?.name || "Unknown",
          subjects: t.subjects || [],
          status: t.status?.toLowerCase() || "active",
          joinedAt: t.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
        }))
        setTeachers(formattedTeachers)
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error)
      setTeachers(demoTeachers)
      toast.info("Using demo data (API unavailable)")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedTeacher(null)
    setIsSheetOpen(true)
  }

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsSheetOpen(true)
  }

  const handleDelete = (teacher: Teacher) => {
    setTeacherToDelete(teacher)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (teacherToDelete) {
      try {
        await teachersApi.delete(teacherToDelete.id)
        setTeachers(teachers.filter((t) => t.id !== teacherToDelete.id))
        toast.success(`${teacherToDelete.name} has been removed`)
      } catch (error) {
        setTeachers(teachers.filter((t) => t.id !== teacherToDelete.id))
        toast.success(`${teacherToDelete.name} has been removed (Demo Mode)`)
      }
      setDeleteDialogOpen(false)
      setTeacherToDelete(null)
    }
  }

  const handleFormSubmit = async (data: TeacherFormData) => {
    const nameParts = data.name.split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(" ") || ""
    const subjects = data.subjects.split(",").map((s) => s.trim())

    if (selectedTeacher) {
      try {
        await teachersApi.update(selectedTeacher.id, {
          firstName,
          lastName,
          email: data.email,
          phone: data.phone,
          subjects,
          status: data.status.toUpperCase(),
        })
        setTeachers(
          teachers.map((t) =>
            t.id === selectedTeacher.id
              ? { ...t, ...data, subjects }
              : t
          )
        )
        toast.success(`${data.name} has been updated`)
      } catch (error) {
        setTeachers(
          teachers.map((t) =>
            t.id === selectedTeacher.id
              ? { ...t, ...data, subjects }
              : t
          )
        )
        toast.success(`${data.name} has been updated (Demo Mode)`)
      }
    } else {
      try {
        const response = await teachersApi.create({
          firstName,
          lastName,
          email: data.email,
          phone: data.phone,
          subjects,
          status: data.status.toUpperCase(),
        })
        if (response.success && response.data) {
          const newTeacher: Teacher = {
            id: response.data.id,
            ...data,
            subjects,
            joinedAt: new Date().toISOString().split("T")[0],
          }
          setTeachers([...teachers, newTeacher])
          toast.success(`${data.name} has been added`)
        }
      } catch (error) {
        const newTeacher: Teacher = {
          id: String(Date.now()),
          ...data,
          subjects,
          joinedAt: new Date().toISOString().split("T")[0],
        }
        setTeachers([...teachers, newTeacher])
        toast.success(`${data.name} has been added (Demo Mode)`)
      }
    }
    setIsSheetOpen(false)
    setSelectedTeacher(null)
  }

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
              <DropdownMenuItem onClick={() => handleEdit(teacher)}>
                Edit details
              </DropdownMenuItem>
              <DropdownMenuItem>View schedule</DropdownMenuItem>
              <DropdownMenuItem>Assign classes</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(teacher)}
              >
                Remove teacher
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const activeTeachers = teachers.filter((t) => t.status === "active").length
  const onLeaveTeachers = teachers.filter((t) => t.status === "on_leave").length

  if (loading) {
    return (
      <PageLayout title="Teachers" breadcrumbs={[{ label: "Teachers" }]}>
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    )
  }

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
              <div className="text-2xl font-bold">{teachers.length}</div>
              <p className="text-xs text-muted-foreground">+1 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTeachers}</div>
              <p className="text-xs text-muted-foreground">
                {teachers.length > 0 ? Math.round((activeTeachers / teachers.length) * 100) : 0}% active rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onLeaveTeachers}</div>
              <p className="text-xs text-muted-foreground">
                {onLeaveTeachers > 0 ? teachers.find((t) => t.status === "on_leave")?.name : "None"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg per School</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(teachers.length / schools.length).toFixed(1)}</div>
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
              onAdd={handleAdd}
              addButtonLabel="Add Teacher"
            />
          </CardContent>
        </Card>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedTeacher ? "Edit Teacher" : "Add Teacher"}</SheetTitle>
            <SheetDescription>
              {selectedTeacher
                ? "Update the teacher details below."
                : "Fill in the details to add a new teacher."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <TeacherForm
              teacher={selectedTeacher}
              schools={schools}
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
              This will permanently remove {teacherToDelete?.name}. This action cannot be undone.
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
