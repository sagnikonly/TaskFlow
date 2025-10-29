# Step Up Feature - Visual Guide

## Before vs After

### ❌ OLD DESIGN (Removed)
```
┌─────────────────────────────────────┐
│  📅 Wednesday, 29 Oct               │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  📈 Step Up Your Game         │ │  ← Explicit button removed
│  └───────────────────────────────┘ │
│                                     │
│  Today                              │
│  ○ Finalize project proposal        │
│  ○ Drink water (2/8)                │
│  ○ Read 30 pages (0/30)             │
└─────────────────────────────────────┘
```

### ✅ NEW DESIGN (Minimal & Smart)
```
┌─────────────────────────────────────┐
│  📅 Wednesday, 29 Oct               │
│                                     │
│  Today                              │
│  ○ Finalize project proposal        │
│  ○ Drink water (2/8) 📈            │  ← Small icon appears when ready
│  ○ Read 30 pages (0/30)             │
└─────────────────────────────────────┘
```

## Step Up Indicator States

### 1. No Suggestion (Default)
```
┌────────────────────────────────┐
│ ○ Read 30 pages (25/30)       │  ← No icon, building consistency
└────────────────────────────────┘
```

### 2. Suggestion Available (After AI Analysis)
```
┌────────────────────────────────┐
│ ○ Read 30 pages (25/30) 📈    │  ← Minimal icon appears
└────────────────────────────────┘
```

### 3. Click to View Details
```
┌─────────────────────────────────────┐
│  📈 Step Up Suggestion              │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Suggested Goal               │ │
│  │  30 → 35                      │ │
│  └───────────────────────────────┘ │
│                                     │
│  You've maintained a 7-day streak   │
│  with 85% completion. Time to       │
│  challenge yourself!                │
│                                     │
│  Keep up the momentum! Small steps  │
│  lead to big achievements.          │
│                                     │
│  [ Not Now ]  [ Accept ]            │
└─────────────────────────────────────┘
```

## Icon Design

### Material 3 Compliant
```css
/* Minimal circular button */
width: 24px;
height: 24px;
border-radius: 50%;
background: primary/10;
color: primary;

/* Icon */
material-symbols-outlined: "trending_up"
font-size: 16px;

/* Hover effect */
hover: scale(1.1)
hover: background: primary/20
```

### Visual Representation
```
Normal State:     Hover State:      Active State:
   ┌───┐            ┌───┐             ┌───┐
   │ ↗ │            │ ↗ │             │ ↗ │
   └───┘            └───┘             └───┘
   24px             26px              24px
   opacity: 0.8     opacity: 1.0      opacity: 1.0
```

## User Journey Timeline

```
Day 1-6: Building Consistency
├─ User creates task: "Read 30 pages"
├─ Completes daily
├─ No visual changes
└─ AI monitoring in background

Day 7: Eligibility Check
├─ 7-day streak achieved
├─ 75%+ completion rate
├─ AI analyzes patterns
└─ Still no visual changes

Day 8: Suggestion Generated
├─ AI determines readiness
├─ Considers user profile
├─ Generates suggestion
└─ 📈 Icon appears next to task

User Interaction:
├─ Notices subtle icon
├─ Clicks to view details
├─ Reads AI reasoning
└─ Accepts or dismisses

After Acceptance:
├─ Goal updated (30 → 35)
├─ Icon disappears
├─ 14-day cooldown starts
└─ Cycle repeats
```

## Profile Integration

### Settings → Profile Section
```
┌─────────────────────────────────────┐
│  👤 Profile                         │
│                                     │
│  Full Name                          │
│  ┌───────────────────────────────┐ │
│  │ John Doe                      │ │
│  └───────────────────────────────┘ │
│                                     │
│  Target Exam/Goal                   │
│  ┌───────────────────────────────┐ │
│  │ JEE Advanced 2026             │ │
│  └───────────────────────────────┘ │
│                                     │
│  Personal Goal                      │
│  ┌───────────────────────────────┐ │
│  │ Score 250+ in JEE Advanced    │ │
│  │ Focus on Math and Physics     │ │
│  └───────────────────────────────┘ │
│                                     │
│  [ Update Profile ]                 │
└─────────────────────────────────────┘
```

### How AI Uses Profile Data
```
Task: "Read 30 pages"
Notes: "Physics textbook for JEE"
Profile: "JEE Advanced 2026"

AI Analysis:
├─ Recognizes exam preparation context
├─ Understands importance of consistency
├─ Suggests gradual increase (30 → 35)
└─ Provides exam-specific motivation
```

## Task Notes Integration

### Adding Task with Notes
```
┌─────────────────────────────────────┐
│  Add New Task                       │
│                                     │
│  Task Title                         │
│  ┌───────────────────────────────┐ │
│  │ Read pages                    │ │
│  └───────────────────────────────┘ │
│                                     │
│  Notes (Optional)                   │
│  ┌───────────────────────────────┐ │
│  │ Physics chapters for JEE      │ │  ← AI uses this context
│  │ Mechanics and Thermodynamics  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ☑ Add progress counter             │
│  Goal Target: 30                    │
│                                     │
│  [ Cancel ]  [ Add Task ]           │
└─────────────────────────────────────┘
```

## Color Themes

All themes maintain the minimal Step Up design:

### Purple (Default)
```
Icon: hsl(282, 62%, 50%)
Background: hsl(282, 62%, 97%)
```

### Blue
```
Icon: hsl(217, 91%, 60%)
Background: hsl(217, 91%, 97%)
```

### Green
```
Icon: hsl(142, 71%, 45%)
Background: hsl(142, 71%, 97%)
```

### Orange
```
Icon: hsl(25, 95%, 53%)
Background: hsl(25, 95%, 97%)
```

### Pink
```
Icon: hsl(339, 82%, 60%)
Background: hsl(339, 82%, 97%)
```

## Dark Mode

### Light Mode
```
┌─────────────────────────────────────┐
│ ○ Read 30 pages (25/30) 📈        │
│   Personal Growth                   │
└─────────────────────────────────────┘
Background: #FFFFFF
Text: #1A1A1A
Icon: Primary color
```

### Dark Mode
```
┌─────────────────────────────────────┐
│ ○ Read 30 pages (25/30) 📈        │
│   Personal Growth                   │
└─────────────────────────────────────┘
Background: #1A1A1A
Text: #FFFFFF
Icon: Primary color (brighter)
```

## Animation & Transitions

### Icon Appearance
```
Fade In + Scale
Duration: 300ms
Easing: ease-out

0%   → opacity: 0, scale: 0.8
100% → opacity: 1, scale: 1.0
```

### Hover Effect
```
Scale Up
Duration: 200ms
Easing: ease-in-out

Normal → scale: 1.0
Hover  → scale: 1.1
```

### Dialog Opening
```
Fade In + Slide Up
Duration: 300ms
Easing: ease-out

0%   → opacity: 0, translateY: 20px
100% → opacity: 1, translateY: 0
```

## Accessibility

### Keyboard Navigation
```
Tab       → Focus on icon
Enter     → Open dialog
Esc       → Close dialog
Tab       → Navigate buttons
Enter     → Activate button
```

### Screen Reader
```
Icon: "Step up suggestion available"
Dialog: "Step Up Suggestion dialog"
Accept: "Accept step up suggestion"
Dismiss: "Dismiss suggestion"
```

### Touch Targets
```
Minimum size: 44x44px (iOS)
Minimum size: 48x48px (Android)
Current: 24x24px icon + 10px padding = 44x44px ✓
```

## Responsive Design

### Mobile (< 640px)
```
┌─────────────────────┐
│ ○ Read 30 pages    │
│   (25/30) 📈       │
│   Personal Growth   │
└─────────────────────┘
Icon: 24px
Padding: 8px
```

### Tablet (640px - 1024px)
```
┌───────────────────────────┐
│ ○ Read 30 pages (25/30) 📈│
│   Personal Growth          │
└───────────────────────────┘
Icon: 24px
Padding: 12px
```

### Desktop (> 1024px)
```
┌─────────────────────────────────┐
│ ○ Read 30 pages (25/30) 📈     │
│   Personal Growth                │
└─────────────────────────────────┘
Icon: 24px
Padding: 16px
```

## Best Practices Summary

### ✅ DO
- Keep icon minimal (24px)
- Use subtle colors (primary/10)
- Show only when AI confirms readiness
- Provide clear reasoning in dialog
- Allow easy dismissal
- Respect 14-day cooldown

### ❌ DON'T
- Add explicit "Step Up" buttons
- Show suggestions too early
- Overwhelm with large increases
- Force users to accept
- Show multiple suggestions at once
- Interrupt user workflow

## Conclusion

The new Step Up design is:
- **Minimal**: Small icon, no buttons
- **Smart**: AI-powered timing
- **Contextual**: Uses profile and notes
- **Non-intrusive**: Appears when ready
- **Material 3**: Follows design guidelines
- **Accessible**: Keyboard and screen reader support
