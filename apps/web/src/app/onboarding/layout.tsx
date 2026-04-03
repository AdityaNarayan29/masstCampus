import { GraduationCapIcon } from "lucide-react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-center gap-2">
          <GraduationCapIcon className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">MasstCampus</span>
        </div>
        {children}
      </div>
    </div>
  );
}
