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
import { StudentForm } from "@/components/forms/student-form"
import { type StudentFormData } from "@/lib/schemas"
import { studentsApi } from "@/lib/api"

type Student = {
  id: string
  name: string
  email: string
  phone: string
  school: string
  grade: string
  status: "active" | "inactive" | "graduated"
  enrolledAt: string
  avatar?: string
}

const schools = ["Vidyamandir Classes", "Delhi Public School", "Sunrise Global Academy"]

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await studentsApi.getAll()
      if (response.success && response.data) {
        const studentsArr = Array.isArray(response.data) ? response.data : response.data.students || []
        const formattedStudents = studentsArr.map((s: any) => ({
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          email: s.email,
          phone: s.phone || "N/A",
          school: s.tenant?.name || "Unknown",
          grade: s.gradeLevel || "N/A",
          status: s.isActive === false ? "inactive" : "active",
          enrolledAt: s.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
        }))
        setStudents(formattedStudents)
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
      toast.error("Failed to load students")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedStudent(null)
    setIsSheetOpen(true)
  }

  const handleEdit = (student: Student) => {
    setSelectedStudent(student)
    setIsSheetOpen(true)
  }

  const handleDelete = (student: Student) => {
    setStudentToDelete(student)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (studentToDelete) {
      try {
        await studentsApi.delete(studentToDelete.id)
        setStudents(students.filter((s) => s.id !== studentToDelete.id))
        toast.success(`${studentToDelete.name} has been removed`)
      } catch (error) {
        // Demo mode fallback
        setStudents(students.filter((s) => s.id !== studentToDelete.id))
        toast.success(`${studentToDelete.name} has been removed (Demo Mode)`)
      }
      setDeleteDialogOpen(false)
      setStudentToDelete(null)
    }
  }

  const handleFormSubmit = async (data: StudentFormData) => {
    const nameParts = data.name.split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(" ") || ""

    if (selectedStudent) {
      try {
        await studentsApi.update(selectedStudent.id, {
          firstName,
          lastName,
          email: data.email,
          phone: data.phone,
          gradeLevel: data.grade,
          status: data.status.toUpperCase(),
        })
        setStudents(
          students.map((s) =>
            s.id === selectedStudent.id ? { ...s, ...data } : s
          )
        )
        toast.success(`${data.name} has been updated`)
      } catch (error) {
        // Demo mode fallback
        setStudents(
          students.map((s) =>
            s.id === selectedStudent.id ? { ...s, ...data } : s
          )
        )
        toast.success(`${data.name} has been updated (Demo Mode)`)
      }
    } else {
      try {
        const response = await studentsApi.create({
          firstName,
          lastName,
          email: data.email,
          phone: data.phone,
          gradeLevel: data.grade,
          status: data.status.toUpperCase(),
        })
        if (response.success && response.data) {
          const newStudent: Student = {
            id: response.data.id,
            ...data,
            enrolledAt: new Date().toISOString().split("T")[0],
          }
          setStudents([...students, newStudent])
          toast.success(`${data.name} has been added`)
        }
      } catch (error) {
        // Demo mode fallback
        const newStudent: Student = {
          id: String(Date.now()),
          ...data,
          enrolledAt: new Date().toISOString().split("T")[0],
        }
        setStudents([...students, newStudent])
        toast.success(`${data.name} has been added (Demo Mode)`)
      }
    }
    setIsSheetOpen(false)
    setSelectedStudent(null)
  }

  const columns: ColumnDef<Student>[] = [
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
            Student
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const student = row.original
        const initials = student.name.split(" ").map(n => n[0]).join("")
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{student.name}</div>
              <div className="text-sm text-muted-foreground">{student.email}</div>
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
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("grade")}</Badge>
      ),
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
                : status === "graduated"
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
      accessorKey: "enrolledAt",
      header: "Enrolled",
      cell: ({ row }) => {
        const dateStr = row.getValue("enrolledAt") as string
        const [year, month, day] = dateStr.split("-")
        return <div>{`${day}/${month}/${year}`}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const student = row.original

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(student.id)}>
                Copy student ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(student)}>
                View / Edit profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/attendance'}>
                View attendance
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(student)}
              >
                Remove student
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const activeStudents = students.filter((s) => s.status === "active").length

  if (loading) {
    return (
      <PageLayout title="Students" breadcrumbs={[{ label: "Students" }]}>
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Students" breadcrumbs={[{ label: "Students" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage all students across all schools
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">Across all schools</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStudents}</div>
              <p className="text-xs text-muted-foreground">
                {students.length > 0 ? Math.round((activeStudents / students.length) * 100) : 0}% active rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(students.map(s => s.grade)).size}</div>
              <p className="text-xs text-muted-foreground">Grade levels</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg per School</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(students.length / schools.length).toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">students per school</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <CardDescription>
              A list of all students enrolled across all schools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EntityTable
              columns={columns}
              data={students}
              searchKey="name"
              searchPlaceholder="Search students..."
              onAdd={handleAdd}
              addButtonLabel="Add Student"
            />
          </CardContent>
        </Card>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedStudent ? "Edit Student" : "Add Student"}</SheetTitle>
            <SheetDescription>
              {selectedStudent
                ? "Update the student details below."
                : "Fill in the details to add a new student."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <StudentForm
              student={selectedStudent}
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
              This will permanently remove {studentToDelete?.name}. This action cannot be undone.
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
