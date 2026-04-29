/**
 * IndexedDB wrapper for offline POS functionality
 * Stores products, categories, and pending sales when offline
 */

const DB_NAME = 'POSOfflineDB'
const DB_VERSION = 1

let db = null

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result
      
      // Products store
      if (!database.objectStoreNames.contains('products')) {
        const productStore = database.createObjectStore('products', { keyPath: 'id' })
        productStore.createIndex('categoria_id', 'categoria_id', { unique: false })
        productStore.createIndex('codigo_barras', 'codigo_barras', { unique: false })
      }
      
      // Categories store
      if (!database.objectStoreNames.contains('categories')) {
        database.createObjectStore('categories', { keyPath: 'id' })
      }
      
      // Pending sales (to sync when back online)
      if (!database.objectStoreNames.contains('pendingSales')) {
        database.createObjectStore('pendingSales', { keyPath: 'id', autoIncrement: true })
      }
      
      // Settings cache
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' })
      }
    }
    
    request.onsuccess = (event) => {
      db = event.target.result
      console.log('IndexedDB initialized')
      resolve(db)
    }
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error)
      reject(event.target.error)
    }
  })
}

export const getFromStore = (storeName, key = null) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('DB not initialized'))
      return
    }
    
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    
    if (key) {
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    } else {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    }
  })
}

export const putToStore = (storeName, data) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('DB not initialized'))
      return
    }
    
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put(data)
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const deleteFromStore = (storeName, key) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('DB not initialized'))
      return
    }
    
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(key)
    
    request.onsuccess = () => resolve(true)
    request.onerror = () => reject(request.error)
  })
}

export const clearStore = (storeName) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('DB not initialized'))
      return
    }
    
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.clear()
    
    request.onsuccess = () => resolve(true)
    request.onerror = () => reject(request.error)
  })
}

// Product specific helpers
export const cacheProducts = async (products) => {
  const transaction = db.transaction('products', 'readwrite')
  const store = transaction.objectStore('products')
  
  products.forEach(product => {
    store.put(product)
  })
  
  return new Promise((resolve) => {
    transaction.oncomplete = () => {
      console.log(`Cached ${products.length} products offline`)
      resolve()
    }
  })
}

export const getCachedProducts = async () => {
  return await getFromStore('products')
}

export const findProductByBarcode = async (barcode) => {
  const products = await getCachedProducts()
  return products.find(p => p.codigo_barras === barcode)
}

// Category helpers
export const cacheCategories = async (categories) => {
  const transaction = db.transaction('categories', 'readwrite')
  const store = transaction.objectStore('categories')
  
  categories.forEach(cat => {
    store.put(cat)
  })
  
  return new Promise((resolve) => {
    transaction.oncomplete = () => resolve()
  })
}

export const getCachedCategories = async () => {
  return await getFromStore('categories')
}

// Pending sales (offline sales to sync later)
export const addPendingSale = async (saleData) => {
  const transaction = db.transaction('pendingSales', 'readwrite')
  const store = transaction.objectStore('pendingSales')
  const request = store.add({
    ...saleData,
    timestamp: Date.now(),
    synced: false
  })
  
  return new Promise((resolve) => {
    transaction.oncomplete = () => resolve(request.result)
  })
}

export const getPendingSales = async () => {
  return await getFromStore('pendingSales')
}

export const markSaleSynced = async (id) => {
  const sale = await getFromStore('pendingSales', id)
  if (sale) {
    sale.synced = true
    await putToStore('pendingSales', sale)
  }
}

export const removeSyncedSales = async () => {
  const pending = await getPendingSales()
  const transaction = db.transaction('pendingSales', 'readwrite')
  const store = transaction.objectStore('pendingSales')
  
  pending.forEach(sale => {
    if (sale.synced) {
      store.delete(sale.id)
    }
  })
}

// Settings cache
export const cacheSetting = async (key, value) => {
  return await putToStore('settings', { key, value })
}

export const getCachedSetting = async (key) => {
  const result = await getFromStore('settings', key)
  return result?.value
}

// Check if online
export const isOnline = () => {
  return navigator.onLine
}

// Sync pending sales when back online
export const syncPendingSales = async (apiCallback) => {
  const pending = await getPendingSales()
  const unsynced = pending.filter(s => !s.synced)
  
  console.log(`Found ${unsynced.length} pending sales to sync`)
  
  for (const sale of unsynced) {
    try {
      await apiCallback(sale)
      await markSaleSynced(sale.id)
    } catch (error) {
      console.error('Error syncing sale:', error)
    }
  }
  
  await removeSyncedSales()
}

export default {
  initDB,
  getFromStore,
  putToStore,
  deleteFromStore,
  clearStore,
  cacheProducts,
  getCachedProducts,
  findProductByBarcode,
  cacheCategories,
  getCachedCategories,
  addPendingSale,
  getPendingSales,
  syncPendingSales,
  cacheSetting,
  getCachedSetting,
  isOnline
}
