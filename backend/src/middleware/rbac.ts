import { Request, Response, NextFunction } from 'express';

export type UserRole = 'PATIENT' | 'ASHA' | 'FACILITY_STAFF' | 'ADMIN';

export interface AuthenticatedRequest extends Request {
  userRole?: UserRole;
  userId?: string;
}

export function rbac(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const roleHeader = (req.headers['x-user-role'] as string)?.toUpperCase();
    const userRole: UserRole = (['PATIENT', 'ASHA', 'FACILITY_STAFF', 'ADMIN'].includes(roleHeader)
      ? roleHeader
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
