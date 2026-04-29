import { createClient } from 'redis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

let redisClient = null

export const initRedis = async () => {
  try {
    redisClient = createClient({ url: REDIS_URL })
    
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })
    
    redisClient.on('connect', () => {
      console.log('Redis connected')
    })
    
    redisClient.on('ready', () => {
      console.log('Redis ready')
    })
    
    redisClient.on('end', () => {
      console.log('Redis disconnected')
    })
    
    await redisClient.connect()
    return redisClient
  } catch (error) {
    console.error('Failed to initialize Redis:', error)
    // Continue without Redis in development
    return null
  }
}

export const getRedisClient = () => {
  return redisClient
}

// Cache helper functions
export const getCache = async (key) => {
  try {
    if (!redisClient || !redisClient.isReady) return null
    const data = await redisClient.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

export const setCache = async (key, data, ttlSeconds = 300) => {
  try {
    if (!redisClient || !redisClient.isReady) return
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(data))
  } catch (error) {
    console.error('Redis set error:', error)
  }
}

export const deleteCache = async (key) => {
  try {
    if (!redisClient || !redisClient.isReady) return
    await redisClient.del(key)
  } catch (error) {
    console.error('Redis delete error:', error)
  }
}

// Invalidate cache by pattern (for product/category updates)
export const invalidateCache = async (pattern) => {
  try {
    if (!redisClient || !redisClient.isReady) return
    const keys = await redisClient.keys(pattern)
    if (keys.length > 0) {
      await redisClient.del(keys)
      console.log(`Invalidated ${keys.length} cache keys matching: ${pattern}`)
    }
  } catch (error) {
    console.error('Redis invalidate error:', error)
  }
}

// Middleware for caching API responses
export const cacheMiddleware = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next()
    }
    
    const cacheKey = `api:${req.originalUrl}`
    
    try {
      const cached = await getCache(cacheKey)
      if (cached) {
        console.log(`Cache hit: ${cacheKey}`)
        return res.json(cached)
      }
      
      // Override res.json to cache the response
      const originalJson = res.json.bind(res)
      res.json = (data) => {
        // Only cache successful responses
        if (res.statusCode < 400) {
          setCache(cacheKey, data, ttlSeconds).catch(err => {
            console.error('Failed to cache response:', err)
          })
        }
        return originalJson(data)
      }
      
      next()
    } catch (error) {
      console.error('Cache middleware error:', error)
      next()
    }
  }
}

export default {
  initRedis,
  getRedisClient,
  getCache,
  setCache,
  deleteCache,
  invalidateCache,
  cacheMiddleware
}
