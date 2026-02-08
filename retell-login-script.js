#!/usr/bin/env node
/**
 * Retell Dashboard Login & Webhook Configuration Script
 */

const { chromium } = require('playwright');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.log('🚀 Starting Retell Dashboard Automation...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to Retell Dashboard
    console.log('📍 Step 1: Navigating to Retell Dashboard...');
    await page.goto('https://dashboard.retellai.com');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'retell-01-initial.png' });
    console.log('✅ Loaded Retell dashboard\n');
    
    // Step 2: Wait for and fill email
    console.log('📍 Step 2: Filling in email...');
    await page.waitForSelector('input[name="username"], input[type="email"]', { timeout: 10000 });
    
    const emailInput = await page.locator('input[name="username"], input[type="email"]').first();
    await emailInput.fill('omarkebrahim@gmail.com');
    console.log('✅ Entered email: omarkebrahim@gmail.com');
    
    await page.screenshot({ path: 'retell-02-email-filled.png' });
    
    // Step 3: Press Enter or click Continue
    console.log('📍 Step 3: Submitting email...');
    await emailInput.press('Enter');
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'retell-03-after-email.png' });
    
    // Step 4: Check what happened
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    const pageContent = await page.content();
    
    // Check if password field appeared
    const hasPassword = await page.locator('input[type="password"]').isVisible().catch(() => false);
    
    if (hasPassword) {
      console.log('\n🔑 Password field detected!');
      console.log('   Do you have a password for Retell? (not Google)\n');
      
      const hasPwd = await ask('Do you have a Retell-specific password? (yes/no): ');
      
      if (hasPwd.toLowerCase() === 'yes') {
        const pwd = await ask('Enter password: ');
        
        const pwdInput = await page.locator('input[type="password"]').first();
        await pwdInput.fill(pwd);
        await pwdInput.press('Enter');
        
        await page.waitForTimeout(3000);
      } else {
        console.log('\n⚠️ No password - this account uses Google OAuth.');
        console.log('   Let me check if there\'s a "Continue with Google" option on this page...\n');
      }
    }
    
    // Check for magic link / code
    if (pageContent.includes('code') || pageContent.includes('verify') || pageContent.includes('sent')) {
      console.log('\n📧 Verification code or magic link sent!');
      console.log('   Please check your email: omarkebrahim@gmail.com\n');
      
      const code = await ask('Enter the verification code or paste the magic link: ');
      
      if (code.includes('http')) {
        console.log('Navigating to magic link...');
        await page.goto(code);
      } else {
        const codeInput = await page.locator('input[type="text"], input[type="number"]').first();
        if (await codeInput.isVisible().catch(() => false)) {
          await codeInput.fill(code);
          await codeInput.press('Enter');
        }
      }
      
      await page.waitForTimeout(3000);
    }
    
    await page.screenshot({ path: 'retell-04-login-result.png' });
    
    // Check if logged in
    const finalUrl = page.url();
    console.log(`\nFinal URL: ${finalUrl}`);
    
    if (finalUrl.includes('dashboard.retellai.com') && !finalUrl.includes('login') && !finalUrl.includes('auth')) {
      console.log('✅ Successfully logged in!\n');
      
      // Navigate to webhooks
      console.log('📍 Navigating to Webhooks settings...');
      await page.goto('https://dashboard.retellai.com/settings/webhooks');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'retell-05-webhooks.png' });
      console.log('✅ Screenshot saved: retell-05-webhooks.png\n');
      
      // Analyze webhooks
      const content = await page.content();
      if (content.includes('probatedesk')) {
        console.log('✅ Webhook already configured for probatedesk');
      } else {
        console.log('⚠️ No webhooks configured for probatedesk');
      }
      
    } else if (finalUrl.includes('google.com') || pageContent.includes('This browser or app may not be secure')) {
      console.log('\n❌ Google OAuth is blocking automated login');
      console.log('   The browser automation is being detected by Google\n');
      
      console.log('💡 ALTERNATIVE: Manual configuration steps:\n');
      console.log('1. Open https://dashboard.retellai.com in your browser');
      console.log('2. Sign in with Google (omarkebrahim@gmail.com)');
      console.log('3. Go to Settings → Webhooks');
      console.log('4. Click "Add Webhook"');
      console.log('5. Enter URL: https://probatedesk.ca/api/retell/webhook');
      console.log('6. Select events: call_started, call_ended, function_call, transcript_update');
      console.log('7. Save and copy the webhook secret (starts with whsec_)');
      console.log('8. Add to your .env: RETELL_WEBHOOK_SECRET=whsec_xxxxxxxxxxx\n');
      
    } else {
      console.log('\n⚠️ Login status unclear. Check screenshot: retell-04-login-result.png');
    }
    
    console.log('✅ Automation complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'retell-error.png' });
    console.log('📝 Error screenshot saved: retell-error.png');
  } finally {
    await browser.close();
    rl.close();
    console.log('👋 Browser closed.');
  }
}

main().catch(console.error);
