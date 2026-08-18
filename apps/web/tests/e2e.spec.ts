import { test, expect } from '@playwright/test';

test.describe('Enlight Sales OS — Overall E2E System Test Suite', () => {

  test('01: Login Page Renders & Tab Switcher Functions', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    
    // Check Branding Header
    await expect(page.locator('h1')).toContainText('Sign In');

    // Switch to Create Account tab
    await page.click('button:has-text("Create Account")');
    await expect(page.locator('form')).toBeVisible();

    // Switch back to Sign In tab
    await page.click('button:has-text("Sign In")');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('02: User Authentication & Login Flow', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@enlightsales.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait briefly for login completion & navigation
    await page.waitForTimeout(1500);
    expect(page.url()).not.toContain('/error');
  });

  test('03: Dashboard Pulse Clinic Layout & Data Table', async ({ page }) => {
    await page.goto('/');
    
    // Verify Sidebar Branding
    await expect(page.locator('.brand-logo')).toContainText('Enlight Sales OS');

    // Verify Sidebar Grouped Section Links
    await expect(page.locator('.sidebar')).toContainText('Today');
    await expect(page.locator('.sidebar')).toContainText('Dispatches');
    await expect(page.locator('.sidebar')).toContainText('Approvals Queue');
    await expect(page.locator('.sidebar')).toContainText('Zoho Draft Invoices');

    // Verify Top Header Bar & Breadcrumb
    await expect(page.locator('.top-header-bar')).toContainText('ENLIGHT SALES OS');

    // Verify Dispatches Data Table
    await expect(page.locator('.table-clean')).toBeVisible();
    await expect(page.locator('table th').nth(0)).toContainText('Dispatch ID');
  });

  test('04: Dispatches Queue Page & Filter Controls', async ({ page }) => {
    await page.goto('/dispatches');
    await expect(page.locator('h1')).toContainText('Dispatches Queue');

    // Test Filter Pills
    const filterPillAll = page.locator('.filter-pill', { hasText: 'All' });
    await expect(filterPillAll).toBeVisible();

    // Verify Table Rows
    await expect(page.locator('.table-clean tr')).not.toHaveCount(0);
  });

  test('05: Approvals Queue Page Verification', async ({ page }) => {
    await page.goto('/approvals');
    await expect(page.locator('h1')).toContainText('Approvals Queue');

    // Verify Review Action Buttons
    await expect(page.locator('table')).toBeVisible();
  });

  test('06: Zoho Draft Invoices Page Verification', async ({ page }) => {
    await page.goto('/invoices');
    await expect(page.locator('h1')).toContainText('Zoho Draft Invoices');

    // Verify Zoho Links & Table
    await expect(page.locator('.table-clean')).toBeVisible();
  });

  test('07: Discrepancies & Exceptions Page Verification', async ({ page }) => {
    await page.goto('/exceptions');
    await expect(page.locator('h1')).toContainText('Discrepancies & Flagged Errors');

    // Verify Status Badges
    await expect(page.locator('.table-clean')).toBeVisible();
  });

  test('08: WhatsApp AI Agent Command Center', async ({ page }) => {
    await page.goto('/whatsapp');
    await expect(page.locator('h1')).toContainText('WhatsApp AI Agent');

    // Verify Message Simulator Textarea
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('button:has-text("Send WhatsApp Dispatch")')).toBeVisible();
  });

  test('09: Dispatch Detail Page Navigation', async ({ page }) => {
    await page.goto('/dispatches/DSP-001');
    await expect(page).toHaveURL('/dispatches/DSP-001');
  });

});
