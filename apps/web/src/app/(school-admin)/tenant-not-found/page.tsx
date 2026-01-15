import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@school-crm/ui';

export default function TenantNotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tenant Not Found</CardTitle>
          <CardDescription>
            We couldn't find a configuration for this domain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This could happen if:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>The domain hasn't been configured yet</li>
            <li>The tenant has been deactivated</li>
            <li>There's a DNS configuration issue</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            Please contact your administrator for assistance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
