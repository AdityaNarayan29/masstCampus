"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon, TrashIcon } from "lucide-react";

const FEE_TYPES = [
  "Tuition",
  "Exam",
  "Transport",
  "Admission",
  "Library",
  "Lab",
  "Sports",
  "Other",
];

export interface FeeRow {
  typeName: string;
  amount: string;
  applicableGrades: string[];
  dueDate: string;
}

export interface FeeStructureData {
  academicYear: string;
  fees: FeeRow[];
}

interface StepFeeStructureProps {
  data: FeeStructureData;
  onChange: (data: FeeStructureData) => void;
  selectedGrades: string[];
  errors: Record<string, string>;
}

function emptyFee(): FeeRow {
  return {
    typeName: "",
    amount: "",
    applicableGrades: [],
    dueDate: "",
  };
}

export function StepFeeStructure({
  data,
  onChange,
  selectedGrades,
  errors,
}: StepFeeStructureProps) {
  const updateField = (field: "academicYear", value: string) => {
    onChange({ ...data, [field]: value });
  };

  const updateFee = (index: number, field: keyof FeeRow, value: any) => {
    const fees = [...data.fees];
    fees[index] = { ...fees[index], [field]: value };
    onChange({ ...data, fees });
  };

  const addFee = () => {
    onChange({ ...data, fees: [...data.fees, emptyFee()] });
  };

  const removeFee = (index: number) => {
    onChange({ ...data, fees: data.fees.filter((_, i) => i !== index) });
  };

  const toggleGrade = (feeIndex: number, grade: string) => {
    const fee = data.fees[feeIndex];
    const current = fee.applicableGrades;
    const next = current.includes(grade)
      ? current.filter((g) => g !== grade)
      : [...current, grade];
    updateFee(feeIndex, "applicableGrades", next);
  };

  // Calculate totals per grade
  const totalsPerGrade: Record<string, number> = {};
  for (const grade of selectedGrades) {
    let total = 0;
    for (const fee of data.fees) {
      if (fee.applicableGrades.includes(grade) && fee.amount) {
        total += Number(fee.amount) || 0;
      }
    }
    if (total > 0) {
      totalsPerGrade[grade] = total;
    }
  }

  const gradeLabel = (g: string) =>
    ["Nursery", "LKG", "UKG"].includes(g) ? g : `Class ${g}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Fee Structure</CardTitle>
        <CardDescription>
          Define the fee types and amounts for each grade.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Academic year */}
        <div className="max-w-xs space-y-2">
          <Label htmlFor="academicYear">Academic Year *</Label>
          <Input
            id="academicYear"
            value={data.academicYear}
            onChange={(e) => updateField("academicYear", e.target.value)}
            placeholder="e.g., 2025-2026"
          />
          {errors.academicYear && (
            <p className="text-sm text-destructive">{errors.academicYear}</p>
          )}
        </div>

        {/* Fee rows */}
        {data.fees.map((fee, idx) => (
          <div
            key={idx}
            className="space-y-4 rounded-lg border bg-background p-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Fee {idx + 1}</h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFee(idx)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Fee Type *</Label>
                <Select
                  value={fee.typeName}
                  onValueChange={(v) => updateFee(idx, "typeName", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (INR) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={fee.amount}
                  onChange={(e) => updateFee(idx, "amount", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={fee.dueDate}
                  onChange={(e) => updateFee(idx, "dueDate", e.target.value)}
                />
              </div>
            </div>

            {/* Applicable grades */}
            {selectedGrades.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Applicable Grades</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedGrades.map((grade) => {
                    const isSelected = fee.applicableGrades.includes(grade);
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => toggleGrade(idx, grade)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-muted text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {gradeLabel(grade)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        <Button variant="outline" onClick={addFee} className="w-full">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Fee Type
        </Button>

        {/* Preview totals per grade */}
        {Object.keys(totalsPerGrade).length > 0 && (
          <div>
            <Label className="mb-3 block text-sm font-medium">
              Total Fees per Student per Grade
            </Label>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Total (INR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(totalsPerGrade).map(([grade, total]) => (
                    <TableRow key={grade}>
                      <TableCell>{gradeLabel(grade)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {data.fees.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No fee types added yet. Click above to add a fee type.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
