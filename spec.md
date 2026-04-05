# Adifundbroker Dashboard

## Current State
- TopNav has 5 nav tabs: DASHBOARD, TERMINAL, PORTFOLIO, ACTIVITY, WALLET (plus ADMIN for admins)
- TERMINAL, PORTFOLIO, ACTIVITY all render the same Dashboard component — they are functionally identical
- Footer has About, Terms, Support as plain unclickable text spans with no content
- FAQ exists in the backend (getFAQs) and is editable by admin but not visible to users anywhere
- Terms and Policy exist in the backend (getTerms, getPolicy) and are editable by admin but not surfaced to users
- No About or Support page content exists

## Requested Changes (Diff)

### Add
- InfoModal component: a full-screen overlay modal styled in Cyber-Degen dark mode that renders page content (About, Terms, Support, FAQ)
- AboutPage section: static content about Adifundbroker — what it is, educational disclaimer, Web3 asset simulation platform description
- SupportPage section: contact/support info with common help topics and a note directing users to the support email/channel
- FAQPage section: loads FAQ entries from backend (actor.getFAQs()) with accordion-style display
- TermsPage section: loads Terms text from backend (actor.getTerms()) — falls back to static placeholder if empty
- Footer About, Terms, Support, FAQ links now open the InfoModal with the relevant page
- FAQ link added to footer alongside About / Terms / Support

### Modify
- TopNav: remove TERMINAL, PORTFOLIO, ACTIVITY tabs — keep only DASHBOARD, WALLET (and ADMIN for admins)
- TopNav mobile drawer: same removal — only DASHBOARD, WALLET, ADMIN
- App.tsx: pass actor to footer area so InfoModal can load FAQ/Terms from backend
- Footer: convert span elements to buttons that open InfoModal; add FAQ button

### Remove
- TERMINAL, PORTFOLIO, ACTIVITY from BASE_NAV_LINKS in TopNav

## Implementation Plan
1. Create `src/frontend/src/components/InfoModal.tsx` — modal wrapper + About, Support, FAQ, Terms sub-pages
2. Update `TopNav.tsx` — remove 3 redundant nav tabs
3. Update `App.tsx` — add infoModal state (which page is open), pass actor to footer, wire footer buttons
