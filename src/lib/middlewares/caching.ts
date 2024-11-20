// src/lib/middlewares/caching.ts
import { NextApiRequest, NextApiResponse } from 'next';

const CACHE_DURATION = 60 * 1000; // 1 minute
const cache = new Map<string, { data: any; timestamp: number }>();

export function withCache(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return handler(req, res);
    }

    const cacheKey = req.url!;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.status(200).json(cached.data);
    }

    // Modify response to intercept the JSON data
    const originalJson = res.json;
    res.json = function(data: any) {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      return originalJson.call(this, data);
    };

    return handler(req, res);
  };
}