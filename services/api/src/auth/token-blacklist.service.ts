import { Injectable, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService implements OnModuleDestroy {
  private blacklisted = new Map<string, number>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  blacklist(jti: string, expiresAt: number) {
    this.blacklisted.set(jti, expiresAt);
  }

  isBlacklisted(jti: string): boolean {
    return this.blacklisted.has(jti);
  }

  private cleanup() {
    const now = Math.floor(Date.now() / 1000);
    for (const [jti, exp] of this.blacklisted) {
      if (exp < now) this.blacklisted.delete(jti);
    }
  }

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
  }
}
