# Adifundbroker Dashboard

## Current State
- ICP Internet Identity login with admin role assigned to first login (no hardcoded fallback yet)
- TopNav has a Bell icon with a hardcoded badge of "3" but no click handler or notification panel wired up
- No notification system exists in the backend or frontend
- AdminPanel has 5 tabs: Queue, Users, Stats, FAQ, Content -- no notifications tab
- Dashboard has no way for users to see or copy their own ICP principal ID
- Admin role loss occurs when backend data resets because it relies on first-login assignment only

## Requested Changes (Diff)

### Add
- Backend: Notification type with id, message, sender, target (all users or specific principal), timestamp, and read status per user
- Backend: `sendNotification(message, targetPrincipal?)` -- admin only, sends to all users if no target
- Backend: `getMyNotifications()` -- returns notifications for the calling user
- Backend: `markNotificationRead(id)` -- marks a notification as read for the calling user
- Frontend: Working notification bell dropdown in TopNav -- shows list of notifications, unread count badge, mark-read on click
- Frontend: "MY PRINCIPAL ID" display panel on the Dashboard with a one-click copy button so users can easily find and share their principal
- AdminPanel: New "NOTIFICATIONS" tab (6th tab) with a compose form to write a message and send to all users or a specific principal

### Modify
- TopNav Bell: Wire click handler to open/close notification dropdown; fetch real unread count from backend; replace hardcoded "3" badge
- AdminPanel: Add NOTIFICATIONS tab to ADMIN_TABS array
- Dashboard: Add principal ID copy panel below existing content

### Remove
- Hardcoded badge count "3" on Bell icon

## Implementation Plan
1. Add notification types and functions to backend main.mo: Notification type, notifications map, sendNotification, getMyNotifications, markNotificationRead
2. Regenerate backend bindings (handled by generate_motoko_code)
3. Add NotificationBell component to TopNav with dropdown panel (fetches from backend, shows messages, marks read)
4. Add PrincipalCopyPanel component to Dashboard showing full principal with copy button
5. Add NotificationsTab component to AdminPanel with compose + send form targeting all or specific user
6. Wire all new components to actor
