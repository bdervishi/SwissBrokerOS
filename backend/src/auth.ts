import { createClient } from '@supabase/supabase-js';
import type { Request, Response, NextFunction } from 'express';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

export interface Caller { userId: string; tenantId: string; role: string; }

/** Validate a Supabase access token and resolve the caller's tenant + role. */
export async function getCallerTenant(token: string): Promise<Caller | null> {
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', data.user.id)
    .maybeSingle();
  if (!profile) return null;
  return { userId: data.user.id, tenantId: profile.tenant_id, role: profile.role };
}

/**
 * Express middleware: requires a valid bearer token whose tenant matches the
 * tenant the request is acting on. SaaS staff may act across tenants.
 */
export function requireTenant(getRequestedTenant: (req: Request) => string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const caller = await getCallerTenant(token);
    if (!caller) return res.status(401).json({ error: 'Unauthorized' });
    const requested = getRequestedTenant(req);
    const isSaas = (caller.role || '').startsWith('SAAS_');
    if (requested && requested !== caller.tenantId && !isSaas) {
      return res.status(403).json({ error: 'Forbidden (tenant mismatch)' });
    }
    (req as any).caller = caller;
    next();
  };
}

export const tenantFromQuery = (req: Request) => String(req.query.tenantId || '');
export const tenantFromBody = (req: Request) => String((req.body && req.body.tenantId) || req.query.tenantId || '');
