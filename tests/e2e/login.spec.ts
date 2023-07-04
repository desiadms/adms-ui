import { test, expect } from '@playwright/test'

test('Login Page opens', async ({ page }) => {
  await page.goto('http://localhost:5173')

  const signInMessage = await page.getByRole('heading', { name: 'Sign in to your account' })
  const userIdField = await page.locator('input[name="id"]')
  const passwordField = await page.locator('input[name="password"]')
  const signInButton = await page.getByRole('button', { name: 'Sign in' })

  await expect(signInMessage).toBeVisible()
  await expect(userIdField).toBeVisible()
  await expect(passwordField).toBeVisible()
  await expect(signInButton).toBeVisible()
})

test('Test user can login', async ({ page }) => {
  await page.goto('http://localhost:5173')

  const userIdField = await page.locator('input[name="id"]')
  const passwordField = await page.locator('input[name="password"]')
  const signInButton = await page.getByRole('button', { name: 'Sign in' })

  await userIdField.fill(process.env.TEST_USER_ID!)
  await passwordField.fill(process.env.TEST_USER_PASSWORD!)
  await signInButton.click()

  await page.waitForURL('http://localhost:5173/projects')

  await expect(page.getByText('Projects')).toBeVisible()
})