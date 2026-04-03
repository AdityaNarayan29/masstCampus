"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UsersIcon,
  GraduationCapIcon,
  BookOpenIcon,
  BanknoteIcon,
  UserCheckIcon,
  Loader2Icon,
  RocketIcon,
} from "lucide-react";
import { onboardingApi } from "@/lib/api";

interface SummaryData {
  students: number;
  teachers: number;
  classes: number;
  feeRecords: number;
  parents: number;
}

interface StepReviewProps {
  tenantId: string;
  onGoLive: () => void;
  isLoading: boolean;
}

export function StepReview({ tenantId, onGoLive, isLoading }: StepReviewProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!tenantId) {
      setFetching(false);
      return;
    }
    setFetching(true);
    onboardingApi
      .getSummary(tenantId)
      .then((res) => {
        setSummary(res.data || res);
      })
      .catch(() => {
        // If summary endpoint not ready, show zeros
        setSummary({
          students: 0,
          teachers: 0,
          classes: 0,
          feeRecords: 0,
          parents: 0,
        });
      })
      .finally(() => setFetching(false));
  }, [tenantId]);

  const statCards = [
    {
      label: "Students",
      value: summary?.students ?? 0,
      icon: UsersIcon,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Teachers",
      value: summary?.teachers ?? 0,
      icon: GraduationCapIcon,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Classes",
      value: summary?.classes ?? 0,
      icon: BookOpenIcon,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Fee Records",
      value: summary?.feeRecords ?? 0,
      icon: BanknoteIcon,
      color: "text-amber-600 bg-amber-100",
    },
    {
      label: "Parents",
      value: summary?.parents ?? 0,
      icon: UserCheckIcon,
      color: "text-rose-600 bg-rose-100",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Review & Go Live</CardTitle>
        <CardDescription>
          Review the summary of everything you have set up. When you are ready,
          go live to start using MasstCampus.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading summary...
            </span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center rounded-lg border p-4 text-center"
                >
                  <div
                    className={`mb-2 rounded-full p-2 ${stat.color}`}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {!confirmOpen ? (
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={() => setConfirmOpen(true)}
                  className="gap-2"
                >
                  <RocketIcon className="h-4 w-4" />
                  Go Live
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
                <p className="mb-3 text-sm font-medium text-amber-800">
                  Are you sure you want to go live? This will activate your
                  school on MasstCampus.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button onClick={onGoLive} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      "Yes, Go Live"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
