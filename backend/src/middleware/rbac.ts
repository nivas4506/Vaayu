import { Request, Response, NextFunction } from 'express';

export type UserRole = 'PATIENT' | 'ASHA' | 'FACILITY_STAFF' | 'ADMIN';

export interface AuthenticatedRequest extends Request {
  userRole?: UserRole;
  userId?: string;
}

export function rbac(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let rawRole = ((req.headers['x-user-role'] as string) || '').toUpperCase().trim();
    
    // Normalize role synonyms
    if (rawRole === 'STAFF') rawRole = 'FACILITY_STAFF';
    if (rawRole === 'DISTRICT_ADMIN') rawRole = 'ADMIN';

    const userRole: UserRole = (['PATIENT', 'ASHA', 'FACILITY_STAFF', 'ADMIN'].includes(rawRole)
      ? rawRole
      : 'PATIENT') as UserRole;

    req.userRole = userRole;
    req.userId = (req.headers['x-user-id'] as string) || `anon_${userRole.toLowerCase()}`;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        data: null,
        meta: { timestamp: new Date().toISOString() },
        error: {
          code: 'FORBIDDEN',
          message: `Role ${userRole} is not authorized to access this resource`
        }
      });
    }

    next();
  };
}
