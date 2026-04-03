"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";

const ALL_GRADES = [
  "Nursery", "LKG", "UKG",
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
];

const SECTION_LABELS = ["A", "B", "C", "D", "E"];

export interface ClassStructureData {
  grades: Record<string, number>; // grade -> section count
}

interface StepClassStructureProps {
  data: ClassStructureData;
  onChange: (data: ClassStructureData) => void;
}

export function StepClassStructure({ data, onChange }: StepClassStructureProps) {
  const selectedGrades = Object.keys(data.grades);

  const toggleGrade = (grade: string) => {
    const next = { ...data.grades };
    if (next[grade] !== undefined) {
      delete next[grade];
    } else {
      next[grade] = 1;
    }
    onChange({ grades: next });
  };

  const setSections = (grade: string, count: number) => {
    onChange({ grades: { ...data.grades, [grade]: count } });
  };

  // Build preview list
  const previewClasses: { grade: string; section: string; label: string }[] = [];
  for (const grade of ALL_GRADES) {
    const count = data.grades[grade];
    if (count === undefined) continue;
    for (let i = 0; i < count; i++) {
      const section = SECTION_LABELS[i];
      const gradeLabel = ["Nursery", "LKG", "UKG"].includes(grade)
        ? grade
        : `Class ${grade}`;
      previewClasses.push({
        grade,
        section,
        label: `${gradeLabel}-${section}`,
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Class Structure</CardTitle>
        <CardDescription>
          Select the grades your school offers and how many sections each grade has.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grade selection grid */}
        <div>
          <Label className="mb-3 block text-sm font-medium">Select Grades</Label>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
            {ALL_GRADES.map((grade) => {
              const isSelected = data.grades[grade] !== undefined;
              return (
                <button
                  key={grade}
                  type="button"
                  onClick={() => toggleGrade(grade)}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-background text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {["Nursery", "LKG", "UKG"].includes(grade) ? grade : grade}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section count per grade */}
        {selectedGrades.length > 0 && (
          <div>
            <Label className="mb-3 block text-sm font-medium">
              Sections per Grade
            </Label>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {ALL_GRADES.filter((g) => data.grades[g] !== undefined).map(
                (grade) => {
                  const gradeLabel = ["Nursery", "LKG", "UKG"].includes(grade)
                    ? grade
                    : `Class ${grade}`;
                  return (
                    <div
                      key={grade}
                      className="flex items-center justify-between rounded-lg border bg-background p-3"
                    >
                      <span className="text-sm font-medium">{gradeLabel}</span>
                      <Select
                        value={String(data.grades[grade])}
                        onValueChange={(v) => setSections(grade, Number(v))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} {n === 1 ? "section" : "sections"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* Preview table */}
        {previewClasses.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Label className="text-sm font-medium">Preview</Label>
              <Badge variant="secondary">
                {previewClasses.length} classes will be created
              </Badge>
            </div>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Class Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewClasses.map((c) => (
                    <TableRow key={c.label}>
                      <TableCell>
                        {["Nursery", "LKG", "UKG"].includes(c.grade)
                          ? c.grade
                          : `Class ${c.grade}`}
                      </TableCell>
                      <TableCell>{c.section}</TableCell>
                      <TableCell className="font-medium">{c.label}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {selectedGrades.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Select at least one grade to continue.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
