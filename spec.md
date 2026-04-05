# Adifundbroker Dashboard

## Current State
New project. Only scaffolded files exist (empty Motoko actor, no frontend UI).

## Requested Changes (Diff)

### Add
- **Login/Landing Screen**: ICP Internet Identity login simulation with Cyber-Degen dark branding. After simulated login, show main dashboard.
- **Top Navigation**: Brand name "ADIFUNDBROKER" (split-color orange/white), wallet connection status pill (address + green dot), user identity display, nav links (Dashboard, Terminal, Portfolio, Activity).
- **AI Trading Pulse Widget**: Prominent centered widget with SVG/CSS animated radar rings, rotating scan line, pulsing concentric circles, animated data bars and live feed list. Labeled "AI TRADING PULSE" with SYSTEM STATUS: ACTIVE chip.
- **Portfolio Overview Panel**: Total deposited, total projected earnings, 24h change indicator, asset breakdown bar chart (simulated).
- **Active Deposits List**: Table showing deposit #, asset, amount (£), ROI %, daily earnings, with sparkline indicators. Highlighted top row with orange glow.
- **Projected Earnings Panel**: Day simulator (user inputs number of days), shows per-deposit earnings breakdown (Deposit 1 @ 2%, Deposit 2 @ 3%, Deposit 3 @ 1%), aggregate total daily ROI, cumulative projected earnings over N days.
- **Recent Activity / Transaction Log**: Simulated list of past events (deposits, earnings distributions, AI scan events) with timestamps.
- **Deposit Button**: Primary neon orange "+ MAKE DEPOSIT" button that opens the 5-Pillar Gateway modal.
- **5-Pillar Gateway Modal**:
  - Asset dropdown: ICP, BTC, BCH, BNB, EGLD
  - Each asset shows hardcoded wallet address with "Click to Copy" functionality
  - Amount input (£200–£5000 validation)
  - 30-day deposit cycle tracking via localStorage (max 3 deposits per 30-day window)
  - Disabled state + message when limit reached
- **Footer**: Muted links, copyright, OPERATIONAL status indicator.

### Modify
- Backend actor: minimal stub (no real data storage needed, frontend-only).

### Remove
- Nothing to remove (new project).

## Implementation Plan
1. Generate minimal Motoko backend (stub actor).
2. Build React frontend with the following components:
   - `LoginPage`: Simulated ICP Internet Identity login screen with animated brand visuals.
   - `App`: Top-level router between login and dashboard states.
   - `TopNav`: Brand wordmark, nav links, wallet pill, user identity.
   - `AiTradingPulse`: SVG radar widget with CSS animations (rotating scan wedge, pulsing rings, animated bars, live feed).
   - `PortfolioOverview`: Stats cards (total deposited, total earnings), asset bar chart.
   - `ActiveDeposits`: Table of deposits with ROI indicators and sparklines.
   - `ProjectedEarnings`: Day-simulator, per-deposit ROI breakdown, aggregate totals.
   - `RecentActivity`: Simulated transaction log.
   - `DepositModal`: 5-Pillar Gateway with asset dropdown, wallet address copy, amount validation, 30-day cycle limit.
   - `Dashboard`: Grid layout combining all panels.
3. Implement localStorage deposit tracking (30-day window, max 3 entries).
4. Implement ROI calculation logic (Deposit 1: 2%, Deposit 2: 3%, Deposit 3: 1%).
5. Apply Cyber-Degen design system: near-black backgrounds, neon orange (#FF8C00) accents, glowing borders, uppercase headings, Space Grotesk / Inter typography.
