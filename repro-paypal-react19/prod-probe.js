// Loads the PRODUCTION build's /donate as a signed-out user and captures the
// uncaught error + resulting DOM state.
const { chromium } = require('/Users/home/Desktop/freeCodeCamp/.claude/worktrees/paypal-react19-red-run/node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(); // no storageState => signed out
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.stack || e.message));

  await page.goto('http://127.0.0.1:8000/donate', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await page.waitForTimeout(12000);

  console.log('=== uncaught pageerrors: ' + errors.length + ' ===');
  errors.forEach(s => console.log('---\n' + s.split('\n').slice(0, 8).join('\n')));

  console.log('\n=== #paypal-sdk script ===');
  console.log(
    await page.evaluate(() => {
      const s = document.getElementById('paypal-sdk');
      return s ? s.src.slice(0, 130) : 'NONE';
    })
  );

  console.log('\n=== window.paypal.Buttons.driver present? ===');
  console.log(
    await page.evaluate(
      () =>
        typeof window.paypal +
        ' / driver=' +
        (window.paypal && window.paypal.Buttons
          ? typeof window.paypal.Buttons.driver
          : 'n/a')
    )
  );

  const bodyText = await page.innerText('body');
  console.log('\n=== body text length: ' + bodyText.length + ' ===');
  console.log(JSON.stringify(bodyText.slice(0, 200)));

  console.log('\n=== #gatsby-focus-wrapper child count ===');
  console.log(
    await page.evaluate(() => {
      const r = document.querySelector('#gatsby-focus-wrapper');
      return r ? r.children.length : 'no wrapper';
    })
  );

  const btns = await page.getByRole('button').allInnerTexts();
  console.log('\n=== buttons (' + btns.length + ') ===');
  console.log(JSON.stringify(btns.slice(0, 15)));

  await page.screenshot({
    path: '/Users/home/.claude/jobs/16d7f188/tmp/donate-react19.png',
    fullPage: false
  });
  await browser.close();
})();
