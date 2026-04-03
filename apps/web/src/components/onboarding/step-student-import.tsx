"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DownloadIcon, UploadIcon, FileIcon, XIcon } from "lucide-react";

const CSV_HEADERS = [
  "firstName",
  "lastName",
  "gradeLevel",
  "section",
  "enrollmentNumber",
  "parentName",
  "parentPhone",
  "parentEmail",
];

const REQUIRED_FIELDS = ["firstName", "gradeLevel", "section"];

export interface StudentRow {
  firstName: string;
  lastName: string;
  gradeLevel: string;
  section: string;
  enrollmentNumber: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  _errors: string[];
  _rowIndex: number;
}

export interface StudentImportData {
  students: StudentRow[];
  fileName: string;
}

interface StepStudentImportProps {
  data: StudentImportData;
  onChange: (data: StudentImportData) => void;
}

function validateRow(row: Record<string, string>, index: number): StudentRow {
  const errors: string[] = [];
  for (const field of REQUIRED_FIELDS) {
    if (!row[field] || row[field].trim() === "") {
      errors.push(`${field} is required`);
    }
  }
  if (row.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.parentEmail)) {
    errors.push("Invalid parent email");
  }
  return {
    firstName: row.firstName?.trim() || "",
    lastName: row.lastName?.trim() || "",
    gradeLevel: row.gradeLevel?.trim() || "",
    section: row.section?.trim() || "",
    enrollmentNumber: row.enrollmentNumber?.trim() || "",
    parentName: row.parentName?.trim() || "",
    parentPhone: row.parentPhone?.trim() || "",
    parentEmail: row.parentEmail?.trim() || "",
    _errors: errors,
    _rowIndex: index,
  };
}

function parseCsv(text: string): StudentRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: StudentRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] || "";
    });
    rows.push(validateRow(obj, i));
  }

  return rows;
}

export function StepStudentImport({ data, onChange }: StepStudentImportProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const validCount = data.students.filter((s) => s._errors.length === 0).length;
  const errorCount = data.students.filter((s) => s._errors.length > 0).length;

  const handleDownloadTemplate = () => {
    const csv = CSV_HEADERS.join(",") + "\nJohn,Doe,5,A,EN001,Jane Doe,9876543210,jane@example.com\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const students = parseCsv(text);
      onChange({ students, fileName: file.name });
    };
    reader.readAsText(file);
  };

  const clearFile = () => {
    onChange({ students: [], fileName: "" });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Import Students</CardTitle>
        <CardDescription>
          Upload a CSV file with student data. Download the template to see the expected format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download CSV Template
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
            >
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload CSV File
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* File info */}
        {data.fileName && (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3">
            <FileIcon className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">{data.fileName}</span>
            <div className="flex gap-2">
              {validCount > 0 && (
                <Badge variant="default">{validCount} valid</Badge>
              )}
              {errorCount > 0 && (
                <Badge variant="destructive">{errorCount} errors</Badge>
              )}
            </div>
            <button
              onClick={clearFile}
              className="ml-2 rounded p-1 text-muted-foreground hover:bg-muted"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Preview table */}
        {data.students.length > 0 && (
          <div className="rounded-lg border">
            <div className="max-h-80 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Enrollment #</TableHead>
                    <TableHead>Parent Name</TableHead>
                    <TableHead>Parent Phone</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.students.slice(0, 50).map((s, i) => (
                    <TableRow
                      key={i}
                      className={s._errors.length > 0 ? "bg-destructive/10" : ""}
                    >
                      <TableCell className="text-muted-foreground">
                        {s._rowIndex}
                      </TableCell>
                      <TableCell>{s.firstName || "-"}</TableCell>
                      <TableCell>{s.lastName || "-"}</TableCell>
                      <TableCell>{s.gradeLevel || "-"}</TableCell>
                      <TableCell>{s.section || "-"}</TableCell>
                      <TableCell>{s.enrollmentNumber || "-"}</TableCell>
                      <TableCell>{s.parentName || "-"}</TableCell>
                      <TableCell>{s.parentPhone || "-"}</TableCell>
                      <TableCell>
                        {s._errors.length > 0 ? (
                          <span className="text-xs text-destructive">
                            {s._errors.join(", ")}
                          </span>
                        ) : (
                          <Badge variant="secondary" className="text-xs">OK</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {data.students.length > 50 && (
              <p className="border-t p-3 text-center text-xs text-muted-foreground">
                Showing first 50 of {data.students.length} rows
              </p>
            )}
          </div>
        )}

        {!data.fileName && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-muted-foreground">
            <UploadIcon className="mb-3 h-8 w-8" />
            <p className="text-sm font-medium">No file selected</p>
            <p className="text-xs">Upload a CSV file or download the template first</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
