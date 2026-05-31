import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const packageJson = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'))

const normalizeVersion = (value) => {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
}

const getAppVersion = (mode) => {
  const env = loadEnv(mode, projectRoot, '')
  return normalizeVersion(env.VITE_APP_VERSION || env.APP_VERSION || packageJson.version || 'dev')
}

const appendVersion = (url, appVersion) => {
  if (!url || /(^|[?&])v=/.test(url)) return url

  const [pathPart, hashPart] = url.split('#')
  const separator = pathPart.includes('?') ? '&' : '?'
  return `${pathPart}${separator}v=${encodeURIComponent(appVersion)}${hashPart ? `#${hashPart}` : ''}`
}

const isVersionableAsset = (url) => {
  if (!url || url.startsWith('data:') || /^https?:\/\//i.test(url)) return false

  return /\.(css|js|png|jpe?g|webp|svg|ico|webmanifest|woff2?|ttf|otf)([?#].*)?$/i.test(url)
}

const versionHtmlAssets = (html, appVersion) => {
  return html
    .replaceAll('%APP_VERSION%', appVersion)
    .replace(/\b(href|src)="([^"]+)"/g, (match, attr, url) => {
      if (!isVersionableAsset(url)) return match
      return `${attr}="${appendVersion(url, appVersion)}"`
    })
}

const removeDuplicateManifestLinks = (html) => {
  let foundManifest = false

  return html.replace(/\s*<link rel="manifest" href="[^"]+">/g, (match) => {
    if (foundManifest) return ''

    foundManifest = true
    return match
  })
}

const assetVersionPlugin = (appVersion) => {
  let outDir = ''

  return {
    name: 'vendi-pro-asset-version',
    enforce: 'post',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    transformIndexHtml(html) {
      return versionHtmlAssets(html, appVersion)
    },
    generateBundle(_options, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type === 'asset' && asset.fileName.endsWith('.html')) {
          asset.source = removeDuplicateManifestLinks(versionHtmlAssets(String(asset.source), appVersion))
        }
      }
    },
    closeBundle() {
      const indexPath = path.join(outDir, 'index.html')
      if (!existsSync(indexPath)) return

      const html = readFileSync(indexPath, 'utf8')
      writeFileSync(indexPath, removeDuplicateManifestLinks(versionHtmlAssets(html, appVersion)))
    }
  }
}

export default defineConfig(({ mode }) => {
  const appVersion = getAppVersion(mode)
  const versioned = (url) => appendVersion(url, appVersion)

  return {
  define: {
    __APP_VERSION__: JSON.stringify(appVersion)
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icon-192.png', 'icon-512.png', 'robots.txt'],
      manifest: {
        name: 'Vendi Pro',
        short_name: 'Vendi Pro',
        description: 'Ventas, inventario y análisis en una operación clara y rápida',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: versioned('/'),
        icons: [
          {
            src: versioned('/icon-192.png'),
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: versioned('/icon-512.png'),
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: versioned('/icon-512.png'),
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        cacheId: `vendi-pro-${appVersion}`,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        ignoreURLParametersMatching: [/^v$/, /^utm_/, /^fbclid$/],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        // Cache all API requests for offline use
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // API caching - NetworkFirst with offline fallback
          {
            urlPattern: /\/api\/productos.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-products-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7  // 7 days
              },
              networkTimeoutSeconds: 5,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/api\/categorias.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-categories-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7
              },
              networkTimeoutSeconds: 5
            }
          },
          {
            urlPattern: /\/api\/ventas(?!\/ticket).*/i,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'api-sales-cache'
            }
          },
          {
            urlPattern: /\/uploads\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'uploads-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      },
      // Inject custom service worker for offline sync
      injectRegisterOptions: {
        // Custom strategies can be added here
      }
    }),
    assetVersionPlugin(appVersion)
  ],
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true
      },
      '/uploads': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
  }
})
