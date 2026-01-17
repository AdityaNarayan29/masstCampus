"use client"

import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon, ArrowUpDownIcon, IndianRupeeIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { PageLayout } from "@/components/page-layout"
import { EntityTable } from "@/components/entity-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { feesApi } from "@/lib/api"

type Fee = {
  id: string
  studentId: string
  type: string
  amount: number
  dueDate: string
  status: "PENDING" | "PAID" | "OVERDUE" | "WAIVED"
  description?: string
  academicYear: string
  student?: { id: string; firstName: string; lastName: string; enrollmentNumber: string }
  payments?: Payment[]
}

type Payment = {
  id: string
  feeId: string
  amount: number
  paymentMethod: string
  transactionId?: string
  status: string
  paidAt: string
}

// Demo data
const demoFees: Fee[] = [
  {
    id: "1",
    studentId: "1",
    type: "TUITION",
    amount: 25000,
    dueDate: "2024-01-15",
    status: "PAID",
    academicYear: "2024-25",
    student: { id: "1", firstName: "Rahul", lastName: "Sharma", enrollmentNumber: "STU001" },
  },
  {
    id: "2",
    studentId: "2",
    type: "TUITION",
    amount: 25000,
    dueDate: "2024-01-15",
    status: "PENDING",
    academicYear: "2024-25",
    student: { id: "2", firstName: "Priya", lastName: "Patel", enrollmentNumber: "STU002" },
  },
  {
    id: "3",
    studentId: "3",
    type: "EXAM",
    amount: 5000,
    dueDate: "2024-02-01",
    status: "OVERDUE",
    academicYear: "2024-25",
    student: { id: "3", firstName: "Amit", lastName: "Kumar", enrollmentNumber: "STU003" },
  },
  {
    id: "4",
    studentId: "4",
    type: "ADMISSION",
    amount: 10000,
    dueDate: "2024-03-01",
    status: "PENDING",
    academicYear: "2024-25",
    student: { id: "4", firstName: "Sneha", lastName: "Gupta", enrollmentNumber: "STU004" },
  },
  {
    id: "5",
    studentId: "5",
    type: "TUITION",
    amount: 25000,
    dueDate: "2024-01-15",
    status: "WAIVED",
    description: "Scholarship recipient",
    academicYear: "2024-25",
    student: { id: "5", firstName: "Vikram", lastName: "Singh", enrollmentNumber: "STU005" },
  },
]

const feeTypes = ["TUITION", "ADMISSION", "EXAM", "TRANSPORT", "LIBRARY", "LAB", "SPORTS", "OTHER"]

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>(demoFees)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false)
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [feeToDelete, setFeeToDelete] = useState<Fee | null>(null)
  const [loading, setLoading] = useState(false)

  // Form state for new fee
  const [formData, setFormData] = useState({
    studentId: "",
    type: "TUITION",
    amount: "",
    dueDate: "",
    description: "",
    academicYear: "2024-25",
  })

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "CASH",
    transactionId: "",
  })

  // Stats
  const stats = {
    totalAmount: fees.reduce((sum, f) => sum + f.amount, 0),
    paidAmount: fees.filter((f) => f.status === "PAID").reduce((sum, f) => sum + f.amount, 0),
    pendingAmount: fees.filter((f) => f.status === "PENDING").reduce((sum, f) => sum + f.amount, 0),
    overdueAmount: fees.filter((f) => f.status === "OVERDUE").reduce((sum, f) => sum + f.amount, 0),
    collectionRate: fees.length > 0
      ? Math.round((fees.filter((f) => f.status === "PAID").length / fees.length) * 100)
      : 0,
  }

  // Load fees on mount
  useEffect(() => {
    const loadFees = async () => {
      try {
        const res = await feesApi.getAll()
        if (res.success && res.data.length > 0) {
          setFees(res.data)
        }
      } catch (error) {
        console.log("Using demo data - API not available")
      }
    }
    loadFees()
  }, [])

  const handleAdd = () => {
    setSelectedFee(null)
    setFormData({
      studentId: "",
      type: "TUITION",
      amount: "",
      dueDate: "",
      description: "",
      academicYear: "2024-25",
    })
    setIsSheetOpen(true)
  }

  const handleEdit = (fee: Fee) => {
    setSelectedFee(fee)
    setFormData({
      studentId: fee.studentId,
      type: fee.type,
      amount: String(fee.amount),
      dueDate: fee.dueDate.split("T")[0],
      description: fee.description || "",
      academicYear: fee.academicYear,
    })
    setIsSheetOpen(true)
  }

  const handleDelete = (fee: Fee) => {
    setFeeToDelete(fee)
    setDeleteDialogOpen(true)
  }

  const handleRecordPayment = (fee: Fee) => {
    setSelectedFee(fee)
    setPaymentData({
      amount: String(fee.amount),
      paymentMethod: "CASH",
      transactionId: "",
    })
    setIsPaymentSheetOpen(true)
  }

  const confirmDelete = async () => {
    if (feeToDelete) {
      try {
        await feesApi.delete(feeToDelete.id)
        setFees(fees.filter((f) => f.id !== feeToDelete.id))
        toast.success("Fee deleted successfully")
      } catch (error) {
        setFees(fees.filter((f) => f.id !== feeToDelete.id))
        toast.success("Fee deleted successfully (Demo Mode)")
      }
      setDeleteDialogOpen(false)
      setFeeToDelete(null)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
    }

    try {
      if (selectedFee) {
        const res = await feesApi.update(selectedFee.id, data)
        if (res.success) {
          setFees(fees.map((f) => (f.id === selectedFee.id ? { ...f, ...data } : f)))
          toast.success("Fee updated successfully")
        }
      } else {
        const res = await feesApi.create(data)
        if (res.success) {
          setFees([...fees, res.data])
          toast.success("Fee created successfully")
        }
      }
    } catch (error) {
      // Demo mode
      if (selectedFee) {
        setFees(fees.map((f) => (f.id === selectedFee.id ? { ...f, ...data } : f)))
        toast.success("Fee updated successfully (Demo Mode)")
      } else {
        const newFee: Fee = {
          id: String(Date.now()),
          ...data,
          status: "PENDING",
          student: { id: data.studentId, firstName: "New", lastName: "Student", enrollmentNumber: "NEW001" },
        }
        setFees([...fees, newFee])
        toast.success("Fee created successfully (Demo Mode)")
      }
    }

    setIsSheetOpen(false)
    setLoading(false)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFee) return

    setLoading(true)

    try {
      const res = await feesApi.recordPayment({
        feeId: selectedFee.id,
        studentId: selectedFee.studentId,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId || undefined,
      })
      if (res.success) {
        setFees(fees.map((f) => (f.id === selectedFee.id ? { ...f, status: "PAID" } : f)))
        toast.success("Payment recorded successfully")
      }
    } catch (error) {
      // Demo mode
      setFees(fees.map((f) => (f.id === selectedFee.id ? { ...f, status: "PAID" as const } : f)))
      toast.success("Payment recorded successfully (Demo Mode)")
    }

    setIsPaymentSheetOpen(false)
    setLoading(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const columns: ColumnDef<Fee>[] = [
    {
      accessorKey: "student",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const student = row.original.student
        return (
          <div>
            <div className="font-medium">
              {student?.firstName} {student?.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              {student?.enrollmentNumber}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("type")}</Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{formatCurrency(row.getValue("amount"))}</div>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("dueDate"))
        return <div>{format(date, "dd/MM/yyyy")}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const variants: Record<string, { variant: "default" | "destructive" | "secondary" | "outline"; icon: any }> = {
          PAID: { variant: "default", icon: CheckCircleIcon },
          PENDING: { variant: "secondary", icon: ClockIcon },
          OVERDUE: { variant: "destructive", icon: AlertCircleIcon },
          WAIVED: { variant: "outline", icon: CheckCircleIcon },
        }
        const config = variants[status] || variants.PENDING
        const Icon = config.icon
        return (
          <Badge variant={config.variant} className="flex w-fit items-center gap-1">
            <Icon className="h-3 w-3" />
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "academicYear",
      header: "Year",
      cell: ({ row }) => <div>{row.getValue("academicYear")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const fee = row.original

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(fee.id)}>
                Copy fee ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(fee)}>
                Edit fee
              </DropdownMenuItem>
              {fee.status !== "PAID" && fee.status !== "WAIVED" && (
                <DropdownMenuItem onClick={() => handleRecordPayment(fee)}>
                  Record payment
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>View student</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(fee)}
              >
                Delete fee
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <PageLayout title="Fees" breadcrumbs={[{ label: "Fees" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-muted-foreground">
            Manage student fees and track payments
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
              <IndianRupeeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">{fees.length} fees created</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</div>
              <p className="text-xs text-muted-foreground">{stats.collectionRate}% collection rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.collectionRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Fees Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Fees</CardTitle>
            <CardDescription>A list of all fees across all students</CardDescription>
          </CardHeader>
          <CardContent>
            <EntityTable
              columns={columns}
              data={fees}
              searchKey="student"
              searchPlaceholder="Search fees..."
              onAdd={handleAdd}
              addButtonLabel="Add Fee"
            />
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Fee Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedFee ? "Edit Fee" : "Add Fee"}</SheetTitle>
            <SheetDescription>
              {selectedFee ? "Update fee details" : "Create a new fee for a student"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Student ID</Label>
              <Input
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="Enter student ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Fee Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {feeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Input
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="2024-25"
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {selectedFee ? "Update Fee" : "Create Fee"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Record Payment Sheet */}
      <Sheet open={isPaymentSheetOpen} onOpenChange={setIsPaymentSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Record Payment</SheetTitle>
            <SheetDescription>
              {selectedFee && (
                <>
                  {selectedFee.student?.firstName} {selectedFee.student?.lastName} - {selectedFee.type} ({formatCurrency(selectedFee.amount)})
                </>
              )}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handlePaymentSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={paymentData.paymentMethod}
                onValueChange={(value) => setPaymentData({ ...paymentData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transaction ID (Optional)</Label>
              <Input
                value={paymentData.transactionId}
                onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                placeholder="Enter transaction ID"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                Record Payment
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsPaymentSheetOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this fee record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  )
}
