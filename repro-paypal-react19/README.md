# Reproduction: PayPal donate-page outage under React 19

Investigation harness for the 2026-08-10 donate-page outage. **Not intended to
be merged** — this is evidence for the React 19 re-land and for reviewing
[#69477](https://github.com/freeCodeCamp/freeCodeCamp/pull/69477).

## Root cause

`client/src/components/Donation/paypal-button-script-loader.tsx:171` hands React
internals to PayPal's legacy zoid adapter:

```ts
window.paypal.Buttons.driver('react', { React, ReactDOM })
```

PayPal's live SDK bundle destructures that object and calls `findDOMNode` during
mount. Verbatim from `https://www.paypal.com/sdk/js?client-id=sb&...`:

```js
function(n,e,t,r){ var o=r.React, i=r.ReactDOM;
  return function(n){ ...
    r.componentDidMount = function(){
      var n = i.findDOMNode(this),      // <-- removed in React 19
          e = t(Zn({}, this.props));
      e.render(n, Jo.IFRAME);
      this.setState({ parent: e })
    };
  }(o.Component)
}
```

React 19 removed `ReactDOM.findDOMNode` (facebook/react#28926):

| | `typeof ReactDOM.findDOMNode` |
| --- | --- |
| react-dom 18.3.1 | `function` |
| react-dom 19.2.8 | `undefined` |

The throw happens during commit, and nothing above it is an error boundary, so
React 19 unmounts the entire root — hence a white screen rather than a broken
button. Existing donors were unaffected because `client/src/pages/donate.tsx:84`
only mounts the form when `!isDonating`.

## Measured behaviour

Production build (`pnpm run build`), `/donate`, signed out:

| | React 19 (`41874d4bba0c`) | React 18 (`b6c23a11a3`) |
| --- | --- | --- |
| `body` text length | `0` | `3744` |
| `#gatsby-focus-wrapper` | **absent** | 1 child |
| buttons found | `0` | `20` (incl. `Donate`) |
| `#paypal-sdk` script tag | none | present |
| uncaught error | `i.findDOMNode is not a function` | none |

The console error matches the original report character for character,
including the minified identifiers:

```
Uncaught error: TypeError: i.findDOMNode is not a function
    at r.componentDidMount (https://www.paypal.com/sdk/js?client-id=sb&...&intent=subscription:3:120143)
```

## Does #69477 catch it?

The two commits differ only by the React revert, so any pass/fail delta is
attributable to React 19.

| Test | React 18 | React 19 | Catches it? |
| --- | --- | --- | --- |
| Unauthenticated › renders the real PayPal button | pass | **fail** | **yes** |
| Authenticated › renders the real PayPal button | pass | **fail** | **yes** |
| Unauthenticated › completes the donation flow | pass | pass | **no — blind** |
| Authenticated › completes the donation flow | fail | fail | env artifact, see below |

Two caveats worth raising on the PR:

1. **The completion-flow tests are blind to this class of bug.** They stub the
   SDK via `page.route`, and the fake implements `Buttons.driver`, so they pass
   on React 19. Coverage rests entirely on the two `renders the real PayPal
   button` tests.
2. **The failure is an opaque 15s timeout**, reported as `waiting for
   getByRole('button', { name: 'Donate' })` — because the page is blank, the
   Donate button is gone too. Nothing in the output names `findDOMNode`. A
   `page.on('pageerror')` assertion would surface the real cause and would catch
   any white-screen regression, not just this one.

Relatedly, `client/src/utils/script-loaders.ts` sets `onload` but never
`onerror`, so a failed SDK load is silent — which is why CI stayed green with
the placeholder `PAYPAL_CLIENT_ID=id_from_paypal_dashboard`: the SDK 400s,
`isSdkLoaded` stays false, `render()` returns `null`, and the crashing line is
never reached.

## Reproducing

```sh
git checkout 41874d4bba0c          # main immediately before the revert (React 19.2.8)
                                   # use b6c23a11a3 for the React 18 control
cp <this dir>/../e2e/paypal-donation.spec.ts e2e/   # from PR #69477

sed -e 's|^PAYPAL_CLIENT_ID=.*|PAYPAL_CLIENT_ID=sb|' sample.env > .env
pnpm install && pnpm run preseed && pnpm run build
pnpm run develop:api &
pnpm run serve:client-ci &
pnpm playwright:run paypal-donation.spec.ts --project=chromium
```

`PAYPAL_CLIENT_ID=sb` is the critical part — with `sample.env`'s placeholder the
SDK never loads and the bug is unreachable. `sb` serves the real bundle
including under `vault=true&intent=subscription`.

## Environment notes (macOS)

Two local-only snags, neither related to the bug:

- **`pnpm develop` is unusable on React 19.** Gatsby's dev overlay throws
  `Cannot use 'in' operator to search for '__self' in false` from
  `React.createElement`, blanking the page before PayPal loads. Dev-only —
  production doesn't run that guard — so CI would not catch it either, but
  anyone re-landing React 19 hits it on day one. **Use a production build.**
- **IPv4/IPv6 split.** The API binds `0.0.0.0` (IPv4) while Gatsby dev binds
  `::1`, so Playwright's `localhost:3000` requests are refused.
  `ipv6-proxy.js` bridges `[::1]:3000 -> 127.0.0.1:3000`.

Serving the build from `127.0.0.1` while auth cookies are scoped to `localhost`
leaves the session unauthenticated — that is what makes `Authenticated ›
completes the donation flow` fail on **both** React versions here. It passes in
CI. Serve on the same host as `HOME_LOCATION` to avoid it.

## Scripts

| | |
| --- | --- |
| `static-server.js` | serves `client/public` on `127.0.0.1:8000`, no deps |
| `ipv6-proxy.js` | bridges `[::1]:3000` to the IPv4 API |
| `prod-probe.js` | dumps `/donate` DOM state + whether the tree mounted |
| `console-probe.js` | captures the console error that unmounts the tree |
