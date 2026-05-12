/**
 * Post-build script to generate SPA fallback HTML files for GitHub Pages.
 * 
 * This copies the index.html to key routes so that F5/refresh works correctly
 * on GitHub Pages (which doesn't support SPA history fallback natively).
 * 
 * Usage: node scripts/generate-spa-fallbacks.js [build-output-dir]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const buildDir = process.argv[2] || path.join(__dirname, '..', 'dist')

// Routes that need SPA fallback HTML
// Note: Product detail pages (/produtos/slug) are handled by the 404.html redirect
const ROUTES = [
  '/',
  '/produtos',
  '/carrinho',
  '/checkout',
  '/login',
  '/minhas-compras',
  '/perfil',
  '/admin',
  '/sobre-nos',
  '/contato',
  '/faq',
  '/privacidade',
  '/termos',
  '/trocas',
  '/envio'
]

function generateSpaFallbacks() {
  const indexHtmlPath = path.join(buildDir, 'index.html')
  
  if (!fs.existsSync(indexHtmlPath)) {
    console.error(`[spa-fallbacks] index.html not found at ${indexHtmlPath}`)
    process.exit(1)
  }
  
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8')
  let created = 0
  
  for (const route of ROUTES) {
    // Skip root as index.html already exists
    if (route === '/') continue
    
    // Create directory structure: /produtos -> dist/produtos/index.html
    const routeDir = path.join(buildDir, route.slice(1))
    const outputFile = path.join(routeDir, 'index.html')
    
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true })
    }
    
    fs.writeFileSync(outputFile, indexHtml)
    created++
    console.log(`[spa-fallbacks] Created ${outputFile}`)
  }
  
  console.log(`\n[spa-fallbacks] Done! Created ${created} fallback HTML files.`)
  console.log('[spa-fallbacks] Product detail pages (/produtos/:slug) use the 404.html redirect fallback.')
  
  // Copy .nojekyll if it exists in project root
  const nojekyllSrc = path.join(__dirname, '..', '.nojekyll')
  const nojekyllDest = path.join(buildDir, '.nojekyll')
  if (fs.existsSync(nojekyllSrc)) {
    fs.copyFileSync(nojekyllSrc, nojekyllDest)
    console.log('[spa-fallbacks] Copied .nojekyll to dist/')
  }
}

generateSpaFallbacks()
