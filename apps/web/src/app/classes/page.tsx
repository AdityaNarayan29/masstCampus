"use client"

import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon, ArrowUpDownIcon, UsersIcon, Loader2Icon } from "lucide-react"
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
import { ClassForm } from "@/components/forms/class-form"
import { type ClassFormData } from "@/lib/schemas"
import { classesApi } from "@/lib/api"

type Class = {
  id: string
  name: string
  school: string
  grade: string
  section: string
  students: number
  teacher: string
  status: "active" | "inactive"
  createdAt: string
}

const schools = ["Vidyamandir Classes", "Demo School", "Development Tenant"]

const demoClasses: Class[] = [
  {
    id: "1",
    name: "Class 12-A",
    school: "Vidyamandir Classes",
    grade: "12th",
    section: "A",
    students: 45,
    teacher: "Dr. Rajesh Kumar",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Class 12-B",
    school: "Vidyamandir Classes",
    grade: "12th",
    section: "B",
    students: 42,
    teacher: "Mrs. Priya Sharma",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    name: "Class 11-A",
    school: "Vidyamandir Classes",
    grade: "11th",
    section: "A",
    students: 48,
    teacher: "Mr. Amit Verma",
    status: "active",
    createdAt: "2024-01-20",
  },
]

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [classToDelete, setClassToDelete] = useState<Class | null>(null)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await classesApi.getAll()
      if (response.success && response.data) {
        const formattedClasses = response.data.classes.map((c: any) => ({
          id: c.id,
          name: c.name,
          school: c.tenant?.name || "Unknown",
          grade: c.gradeLevel || "N/A",
          section: c.section || "A",
          students: c._count?.students || 0,
          teacher: c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : "Unassigned",
          status: c.status?.toLowerCase() || "active",
          createdAt: c.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
        }))
        setClasses(formattedClasses)
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error)
      setClasses(demoClasses)
      toast.info("Using demo data (API unavailable)")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedClass(null)
    setIsSheetOpen(true)
  }

  const handleEdit = (classItem: Class) => {
    setSelectedClass(classItem)
    setIsSheetOpen(true)
  }

  const handleDelete = (classItem: Class) => {
    setClassToDelete(classItem)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (classToDelete) {
      try {
        await classesApi.delete(classToDelete.id)
        setClasses(classes.filter((c) => c.id !== classToDelete.id))
        toast.success(`${classToDelete.name} has been removed`)
      } catch (error) {
        setClasses(classes.filter((c) => c.id !== classToDelete.id))
        toast.success(`${classToDelete.name} has been removed (Demo Mode)`)
      }
      setDeleteDialogOpen(false)
      setClassToDelete(null)
    }
  }

  const handleFormSubmit = async (data: ClassFormData) => {
    if (selectedClass) {
      try {
        await classesApi.update(selectedClass.id, {
          name: data.name,
          gradeLevel: data.grade,
          section: data.section,
          status: data.status.toUpperCase(),
        })
        setClasses(
          classes.map((c) =>
            c.id === selectedClass.id
              ? { ...c, ...data, students: selectedClass.students }
              : c
          )
        )
        toast.success(`${data.name} has been updated`)
      } catch (error) {
        setClasses(
          classes.map((c) =>
            c.id === selectedClass.id
              ? { ...c, ...data, students: selectedClass.students }
              : c
          )
        )
        toast.success(`${data.name} has been updated (Demo Mode)`)
      }
    } else {
      try {
        const response = await classesApi.create({
          name: data.name,
          gradeLevel: data.grade,
          section: data.section,
          status: data.status.toUpperCase(),
        })
        if (response.success && response.data) {
          const newClass: Class = {
            id: response.data.id,
            ...data,
            students: 0,
            createdAt: new Date().toISOString().split("T")[0],
          }
          setClasses([...classes, newClass])
          toast.success(`${data.name} has been added`)
        }
      } catch (error) {
        const newClass: Class = {
          id: String(Date.now()),
          ...data,
          students: 0,
          createdAt: new Date().toISOString().split("T")[0],
        }
        setClasses([...classes, newClass])
        toast.success(`${data.name} has been added (Demo Mode)`)
      }
    }
    setIsSheetOpen(false)
    setSelectedClass(null)
  }

  const columns: ColumnDef<Class>[] = [
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
            Class Name
            <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
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
      accessorKey: "section",
      header: "Section",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("section")}</Badge>
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
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue("students")}</span>
        </div>
      ),
    },
    {
      accessorKey: "teacher",
      header: "Class Teacher",
      cell: ({ row }) => <div>{row.getValue("teacher")}</div>,
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
        const classItem = row.original

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(classItem.id)}>
                Copy class ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View students</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(classItem)}>
                Edit class
              </DropdownMenuItem>
              <DropdownMenuItem>Assign teacher</DropdownMenuItem>
              <DropdownMenuItem>View schedule</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(classItem)}
              >
                Deactivate class
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const activeClasses = classes.filter((c) => c.status === "active").length
  const totalStudents = classes.reduce((sum, c) => sum + c.students, 0)
  const avgClassSize = classes.length > 0 ? Math.round(totalStudents / classes.length) : 0

  if (loading) {
    return (
      <PageLayout title="Classes" breadcrumbs={[{ label: "Classes" }]}>
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Classes" breadcrumbs={[{ label: "Classes" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">
            Manage all classes across all schools
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
              <p className="text-xs text-muted-foreground">Across all schools</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeClasses}</div>
              <p className="text-xs text-muted-foreground">
                {classes.length > 0 ? Math.round((activeClasses / classes.length) * 100) : 0}% active rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Enrolled in classes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Class Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgClassSize}</div>
              <p className="text-xs text-muted-foreground">students per class</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Classes</CardTitle>
            <CardDescription>
              A list of all classes across all schools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EntityTable
              columns={columns}
              data={classes}
              searchKey="name"
              searchPlaceholder="Search classes..."
              onAdd={handleAdd}
              addButtonLabel="Add Class"
            />
          </CardContent>
        </Card>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedClass ? "Edit Class" : "Add Class"}</SheetTitle>
            <SheetDescription>
              {selectedClass
                ? "Update the class details below."
                : "Fill in the details to add a new class."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <ClassForm
              classItem={selectedClass}
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
              This will deactivate {classToDelete?.name}. Students in this class will need to be reassigned.
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
