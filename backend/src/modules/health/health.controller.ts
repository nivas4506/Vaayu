import { Request, Response } from 'express';
import { getSystemHealth, pingServiceProbe } from './health.service.js';

export async function getHealthController(req: Request, res: Response) {
  try {
    const health = await getSystemHealth();
    const httpStatus = health.overallStatus === 'UNHEALTHY' ? 503 : 200;
    res.status(httpStatus).json({
      data: health,
      meta: { timestamp: new Date().toISOString() },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      data: null,
      meta: { timestamp: new Date().toISOString() },
      error: { code: 'HEALTH_CHECK_FAILED', message: err.message || 'Health check error' },
    });
  }
}

export async function pingServiceController(req: Request, res: Response) {
  const { service } = req.params;
  try {
    const probe = await pingServiceProbe(service);
    res.json({
      data: probe,
      meta: { timestamp: new Date().toISOString() },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      data: null,
      meta: { timestamp: new Date().toISOString() },
      error: { code: 'PING_PROBE_FAILED', message: err.message || 'Service ping error' },
    });
  }
}
