export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  primaryDomain?: string;
  theme: TenantTheme;
  config: Record<string, any>;
  isActive: boolean;
  board?: string;
  city?: string;
  state?: string;
}

export interface TenantTheme {
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
  };
  fonts?: {
    heading: string;
    body: string;
  };
}
