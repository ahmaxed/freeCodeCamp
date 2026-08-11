// Captures every console message + uncaught error while /donate loads
// signed-out on the production build, to identify what unmounts the tree.
const { chromium } = require('/Users/home/Desktop/freeCodeCamp/.claude/worktrees/paypal-react19-red-run/node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const msgs = [];
  page.on('console', m => msgs.push('[' + m.type() + '] ' + m.text()));
  page.on('pageerror', e => msgs.push('[pageerror] ' + (e.stack || e.message)));

  // Surface anything React reports via reportError / window.onerror too.
  await page.addInitScript(() => {
    window.addEventListener('error', ev => {
      console.log(
        'WINDOW_ERROR: ' +
          (ev.error && ev.error.stack ? ev.error.stack : ev.message)
      );
    });
    window.addEventListener('unhandledrejection', ev => {
      console.log('UNHANDLED_REJECTION: ' + String(ev.reason && ev.reason.stack));
    });
  });

  await page.goto('http://127.0.0.1:8000/donate', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await page.waitForTimeout(12000);

  console.log('=== captured messages: ' + msgs.length + ' ===');
  msgs.forEach(m => console.log('\n--- ' + m.slice(0, 900)));

  await browser.close();
})();
