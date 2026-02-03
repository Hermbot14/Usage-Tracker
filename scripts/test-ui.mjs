import { chromium } from 'playwright'

console.log('🚀 Starting UI Audit...\n')

const browser = await chromium.launch({ headless: false })
const context = await browser.newContext({
  viewport: { width: 500, height: 700 }
})
const page = await context.newPage()

// Listen for console messages
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log('❌ Console Error:', msg.text())
  }
})

// Listen for uncaught errors
page.on('pageerror', error => {
  console.log('❌ Page Error:', error.message)
})

try {
  console.log('📄 Loading page...')
  await page.goto('http://localhost:8080')

  // Wait for page to load
  await page.waitForTimeout(2000)

  // Take initial screenshot
  await page.screenshot({ path: 'screenshots/01-initial-light.png', fullPage: true })
  console.log('✓ Screenshot: 01-initial-light.png')

  // Check for elements
  console.log('\n🔍 Checking elements...')

  const header = await page.locator('header').isVisible()
  console.log(`  Header visible: ${header ? '✓' : '❌'}`)

  const settingsButton = await page.locator('button[title="Settings"]').isVisible()
  console.log(`  Settings button: ${settingsButton ? '✓' : '❌'}`)

  const darkModeButton = await page.locator('button[title*="mode"]').isVisible()
  console.log(`  Dark mode button: ${darkModeButton ? '✓' : '❌'}`)

  const usageDisplay = await page.locator('text=Token Usage').isVisible()
  console.log(`  Usage display: ${usageDisplay ? '✓' : '❌'}`)

  // Test dark mode toggle
  console.log('\n🌙 Testing dark mode...')
  await page.locator('button[title*="mode"]').click()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'screenshots/02-dark-mode.png', fullPage: true })
  console.log('✓ Screenshot: 02-dark-mode.png')

  // Test settings modal
  console.log('\n⚙️  Testing settings modal...')
  await page.locator('button[title="Settings"]').click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'screenshots/03-settings-modal.png', fullPage: true })
  console.log('✓ Screenshot: 03-settings-modal.png')

  const settingsModal = await page.locator('.fixed.inset-0 h2:has-text("Settings")').isVisible()
  console.log(`  Settings modal visible: ${settingsModal ? '✓' : '❌'}`)

  // Check for form elements
  const apiKeyInput = await page.locator('#apiKey').isVisible()
  console.log(`  API Key input: ${apiKeyInput ? '✓' : '❌'}`)

  const refreshSlider = await page.locator('#refreshInterval').isVisible()
  console.log(`  Refresh slider: ${refreshSlider ? '✓' : '❌'}`)

  // Close settings
  await page.locator('button:has-text("Cancel")').click()
  await page.waitForTimeout(500)

  // Test responsive sizes
  console.log('\n📱 Testing responsive sizes...')

  await page.setViewportSize({ width: 400, height: 600 })
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'screenshots/04-responsive-400x600.png', fullPage: true })
  console.log('✓ Screenshot: 04-responsive-400x600.png')

  await page.setViewportSize({ width: 300, height: 500 })
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'screenshots/05-responsive-300x500.png', fullPage: true })
  console.log('✓ Screenshot: 05-responsive-300x500.png')

  // Check for accessibility issues
  console.log('\n♿ Checking accessibility...')

  const buttons = await page.locator('button').all()
  console.log(`  Total buttons: ${buttons.length}`)

  const buttonsWithTitles = await page.locator('button[title]').all()
  console.log(`  Buttons with titles: ${buttonsWithTitles.length}`)

  // Check color contrast (basic)
  const bgColor = await page.locator('body').evaluate(el => {
    return getComputedStyle(el).backgroundColor
  })
  console.log(`  Background color: ${bgColor}`)

  console.log('\n✅ UI Audit complete! Check screenshots/ folder for results.')

} catch (error) {
  console.error('❌ Error during audit:', error.message)
} finally {
  await browser.close()
}
