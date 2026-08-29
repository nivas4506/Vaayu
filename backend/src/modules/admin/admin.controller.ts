import { Request, Response, NextFunction } from 'express';
import { getAdminMetrics, getAdminIssues } from './admin.service.js';

export function getAdminMetricsController(req: Request, res: Response, next: NextFunction) {
  try {
    const metrics = getAdminMetrics();
    return res.json({
      data: metrics,
      meta: { timestamp: new Date().toISOString() },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export function getAdminIssuesController(req: Request, res: Response, next: NextFunction) {
  try {
    const issues = getAdminIssues();
    return res.json({
      data: issues,
      meta: { timestamp: new Date().toISOString() },
      error: null
    });
  } catch (err) {
    next(err);
  }
}
