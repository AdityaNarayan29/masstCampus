import * as React from 'react';
import { cn } from '../lib/utils';
import type { TenantTheme } from '@school-crm/types';

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  tenantTheme?: TenantTheme;
  logo?: string;
  tenantName?: string;
  children?: React.ReactNode;
}

export const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({ className, tenantTheme, logo, tenantName, children, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn('border-b bg-background px-6 py-4', className)}
        style={{
          ...(tenantTheme?.colors && {
            borderColor: tenantTheme.colors.border,
            backgroundColor: tenantTheme.colors.background,
          }),
        }}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {logo && (
              <img
                src={logo}
                alt={`${tenantName || 'School'} logo`}
                className="h-10 w-auto object-contain"
              />
            )}
            {tenantName && (
              <h1
                className="text-xl font-semibold"
                style={{
                  color: tenantTheme?.colors?.foreground,
                  fontFamily: tenantTheme?.fonts?.heading,
                }}
              >
                {tenantName}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-4">{children}</div>
        </div>
      </header>
    );
  }
);
Header.displayName = 'Header';
