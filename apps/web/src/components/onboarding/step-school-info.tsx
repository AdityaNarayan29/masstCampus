"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BOARDS = ["CBSE", "ICSE", "State Board", "Other"];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Chandigarh", "Puducherry",
];

export interface SchoolInfoData {
  schoolName: string;
  board: string;
  city: string;
  state: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  password: string;
}

interface StepSchoolInfoProps {
  data: SchoolInfoData;
  onChange: (data: SchoolInfoData) => void;
  errors: Record<string, string>;
}

export function StepSchoolInfo({ data, onChange, errors }: StepSchoolInfoProps) {
  const update = (field: keyof SchoolInfoData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">School Information</CardTitle>
        <CardDescription>
          Tell us about your school and create the admin account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="schoolName">School Name *</Label>
            <Input
              id="schoolName"
              value={data.schoolName}
              onChange={(e) => update("schoolName", e.target.value)}
              placeholder="e.g., Sunrise Public School"
            />
            {errors.schoolName && (
              <p className="text-sm text-destructive">{errors.schoolName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="board">Board *</Label>
            <Select value={data.board} onValueChange={(v) => update("board", v)}>
              <SelectTrigger id="board">
                <SelectValue placeholder="Select board" />
              </SelectTrigger>
              <SelectContent>
                {BOARDS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.board && (
              <p className="text-sm text-destructive">{errors.board}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="e.g., Mumbai"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select value={data.state} onValueChange={(v) => update("state", v)}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">
            Admin Account
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="adminName">Full Name *</Label>
              <Input
                id="adminName"
                value={data.adminName}
                onChange={(e) => update("adminName", e.target.value)}
                placeholder="e.g., Rajesh Kumar"
              />
              {errors.adminName && (
                <p className="text-sm text-destructive">{errors.adminName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email *</Label>
              <Input
                id="adminEmail"
                type="email"
                value={data.adminEmail}
                onChange={(e) => update("adminEmail", e.target.value)}
                placeholder="admin@school.com"
              />
              {errors.adminEmail && (
                <p className="text-sm text-destructive">{errors.adminEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPhone">Phone *</Label>
              <Input
                id="adminPhone"
                type="tel"
                value={data.adminPhone}
                onChange={(e) => update("adminPhone", e.target.value)}
                placeholder="+91 98765 43210"
              />
              {errors.adminPhone && (
                <p className="text-sm text-destructive">{errors.adminPhone}</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Minimum 6 characters"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
