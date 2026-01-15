export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
}
