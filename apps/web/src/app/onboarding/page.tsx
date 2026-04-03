"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  Loader2Icon,
} from "lucide-react";

import {
  StepSchoolInfo,
  type SchoolInfoData,
} from "@/components/onboarding/step-school-info";
import {
  StepClassStructure,
  type ClassStructureData,
} from "@/components/onboarding/step-class-structure";
import {
  StepStudentImport,
  type StudentImportData,
} from "@/components/onboarding/step-student-import";
import {
  StepTeacherSetup,
  type TeacherSetupData,
} from "@/components/onboarding/step-teacher-setup";
import {
  StepFeeStructure,
  type FeeStructureData,
} from "@/components/onboarding/step-fee-structure";
import { StepReview } from "@/components/onboarding/step-review";

import { onboardingApi } from "@/lib/api";

const STEPS = [
  { label: "School Info", shortLabel: "School" },
  { label: "Classes", shortLabel: "Classes" },
  { label: "Students", shortLabel: "Students" },
  { label: "Teachers", shortLabel: "Teachers" },
  { label: "Fees", shortLabel: "Fees" },
  { label: "Review", shortLabel: "Review" },
];

const ALL_GRADES = [
  "Nursery", "LKG", "UKG",
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
];
const SECTION_LABELS = ["A", "B", "C", "D", "E"];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [tenantId, setTenantId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step data
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfoData>({
    schoolName: "",
    board: "",
    city: "",
    state: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    password: "",
  });

  const [classStructure, setClassStructure] = useState<ClassStructureData>({
    grades: {},
  });

  const [studentImport, setStudentImport] = useState<StudentImportData>({
    students: [],
    fileName: "",
  });

  const [teacherSetup, setTeacherSetup] = useState<TeacherSetupData>({
    teachers: [],
  });

  const [feeStructure, setFeeStructure] = useState<FeeStructureData>({
    academicYear: "",
    fees: [],
  });

  // Derived values
  const selectedGrades = useMemo(() => {
    return ALL_GRADES.filter((g) => classStructure.grades[g] !== undefined);
  }, [classStructure.grades]);

  const availableClasses = useMemo(() => {
    const classes: string[] = [];
    for (const grade of ALL_GRADES) {
      const count = classStructure.grades[grade];
      if (count === undefined) continue;
      for (let i = 0; i < count; i++) {
        const section = SECTION_LABELS[i];
        const label = ["Nursery", "LKG", "UKG"].includes(grade)
          ? `${grade}-${section}`
          : `Class ${grade}-${section}`;
        classes.push(label);
      }
    }
    return classes;
  }, [classStructure.grades]);

  const progressValue = ((currentStep + 1) / STEPS.length) * 100;

  // Validation
  const validateSchoolInfo = (): boolean => {
    const errs: Record<string, string> = {};
    if (!schoolInfo.schoolName.trim()) errs.schoolName = "School name is required";
    if (!schoolInfo.board) errs.board = "Board is required";
    if (!schoolInfo.adminName.trim()) errs.adminName = "Admin name is required";
    if (!schoolInfo.adminEmail.trim()) errs.adminEmail = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolInfo.adminEmail))
      errs.adminEmail = "Invalid email format";
    if (!schoolInfo.adminPhone.trim()) errs.adminPhone = "Phone is required";
    if (!schoolInfo.password) errs.password = "Password is required";
    else if (schoolInfo.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateClassStructure = (): boolean => {
    if (Object.keys(classStructure.grades).length === 0) {
      toast.error("Please select at least one grade");
      return false;
    }
    return true;
  };

  const validateStudentImport = (): boolean => {
    // Students step is optional - can skip
    if (studentImport.students.length > 0) {
      const errorRows = studentImport.students.filter(
        (s) => s._errors.length > 0
      );
      if (errorRows.length > 0) {
        toast.error(
          `Please fix ${errorRows.length} row(s) with errors before continuing`
        );
        return false;
      }
    }
    return true;
  };

  const validateTeacherSetup = (): boolean => {
    const errs: Record<string, string> = {};
    teacherSetup.teachers.forEach((t, idx) => {
      if (!t.firstName.trim())
        errs[`teacher_${idx}_firstName`] = "First name is required";
      if (!t.email.trim()) errs[`teacher_${idx}_email`] = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.email))
        errs[`teacher_${idx}_email`] = "Invalid email format";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateFeeStructure = (): boolean => {
    const errs: Record<string, string> = {};
    if (feeStructure.fees.length > 0 && !feeStructure.academicYear.trim()) {
      errs.academicYear = "Academic year is required when fees are defined";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step submission handlers
  const handleNext = async () => {
    setLoading(true);
    try {
      switch (currentStep) {
        case 0: {
          if (!validateSchoolInfo()) return;
          const res = await onboardingApi.createSchool({
            schoolName: schoolInfo.schoolName,
            board: schoolInfo.board,
            city: schoolInfo.city,
            state: schoolInfo.state,
            adminName: schoolInfo.adminName,
            adminEmail: schoolInfo.adminEmail,
            adminPhone: schoolInfo.adminPhone,
            password: schoolInfo.password,
          });
          const id = res.data?.tenantId || res.data?.id || res.tenantId;
          if (id) setTenantId(id);
          if (res.data?.accessToken) {
            localStorage.setItem("auth_token", res.data.accessToken);
          }
          toast.success("School created successfully!");
          break;
        }
        case 1: {
          if (!validateClassStructure()) return;
          await onboardingApi.createClasses(tenantId, {
            grades: classStructure.grades,
          });
          toast.success("Classes created successfully!");
          break;
        }
        case 2: {
          if (!validateStudentImport()) return;
          if (studentImport.students.length > 0) {
            const cleanStudents = studentImport.students.map(
              ({ _errors, _rowIndex, ...rest }) => rest
            );
            await onboardingApi.importStudents(tenantId, {
              students: cleanStudents,
            });
            toast.success(
              `${cleanStudents.length} students imported successfully!`
            );
          }
          break;
        }
        case 3: {
          if (!validateTeacherSetup()) return;
          if (teacherSetup.teachers.length > 0) {
            await onboardingApi.createTeachers(tenantId, {
              teachers: teacherSetup.teachers,
            });
            toast.success("Teachers created successfully!");
          }
          break;
        }
        case 4: {
          if (!validateFeeStructure()) return;
          if (feeStructure.fees.length > 0) {
            await onboardingApi.createFeeStructure(tenantId, {
              academicYear: feeStructure.academicYear,
              fees: feeStructure.fees,
            });
            toast.success("Fee structure saved successfully!");
          }
          break;
        }
        default:
          break;
      }
      setErrors({});
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const handleGoLive = async () => {
    setLoading(true);
    try {
      await onboardingApi.goLive(tenantId);
      toast.success("Your school is now live! Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Check if current step can skip (optional steps)
  const isOptionalStep = currentStep >= 2 && currentStep <= 4;

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-muted-foreground">
            {STEPS[currentStep].label}
          </span>
        </div>
        <Progress value={progressValue} className="h-2" />

        {/* Step indicator */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div
                key={step.label}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "border-2 border-primary text-primary"
                      : "border border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`hidden text-xs sm:block ${
                    isCurrent
                      ? "font-medium text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.shortLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div>
        {currentStep === 0 && (
          <StepSchoolInfo
            data={schoolInfo}
            onChange={setSchoolInfo}
            errors={errors}
          />
        )}
        {currentStep === 1 && (
          <StepClassStructure
            data={classStructure}
            onChange={setClassStructure}
          />
        )}
        {currentStep === 2 && (
          <StepStudentImport
            data={studentImport}
            onChange={setStudentImport}
          />
        )}
        {currentStep === 3 && (
          <StepTeacherSetup
            data={teacherSetup}
            onChange={setTeacherSetup}
            availableClasses={availableClasses}
            errors={errors}
          />
        )}
        {currentStep === 4 && (
          <StepFeeStructure
            data={feeStructure}
            onChange={setFeeStructure}
            selectedGrades={selectedGrades}
            errors={errors}
          />
        )}
        {currentStep === 5 && (
          <StepReview
            tenantId={tenantId}
            onGoLive={handleGoLive}
            isLoading={loading}
          />
        )}
      </div>

      {/* Navigation buttons */}
      {currentStep < 5 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || loading}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {isOptionalStep && (
              <Button
                variant="ghost"
                onClick={() => {
                  setErrors({});
                  setCurrentStep((s) => s + 1);
                }}
                disabled={loading}
              >
                Skip
              </Button>
            )}
            <Button onClick={handleNext} disabled={loading}>
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Next
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
