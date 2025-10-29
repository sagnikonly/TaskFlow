# Task Edit Feature - Comprehensive Guide

## Overview
A beautiful, comprehensive task editing dialog that slides up from the bottom with Material 3 design. Users can edit all task properties and manually step up their goals.

---

## 🎯 Features

### 1. Click to Edit
- **Click anywhere on task** to open edit dialog
- **Excludes**: Checkbox, buttons, step-up indicator
- **Smooth animation**: Slides up from bottom
- **Mobile-first**: Bottom sheet on mobile, centered on desktop

### 2. Edit All Properties
```
✓ Task title
✓ Category (subject)
✓ Priority (low, medium, high)
✓ Recurrence (none, daily, weekly, monthly)
✓ Notes (for AI context)
✓ Goal target (if has counter)
```

### 3. Manual Step-Up
```
✓ Quick +15% button
✓ Custom amount button
✓ Records in step-up history
✓ Shows confirmation for large increases
✓ Updates AI analysis data
```

### 4. Step-Up History Display
```
✓ Shows last 3 step-ups
✓ Displays old → new goal
✓ Shows date of each step-up
✓ Scrollable if more than 3
```

### 5. Task Information
```
✓ Creation date
✓ Last step-up date
✓ Completion rate
✓ Days tracked
```

---

## 🎨 Design

### Material 3 Compliance
```css
/* Bottom Sheet Animation */
- Slides up from bottom (mobile)
- Centered dialog (desktop)
- Smooth cubic-bezier easing
- 300ms duration

/* Rounded Corners */
- Top: 24px (rounded-t-3xl)
- Bottom: 0px on mobile
- All: 24px on desktop

/* Colors */
- Surface background
- Border with proper contrast
- Primary accent colors
- Muted text for secondary info
```

### Responsive Behavior
```
Mobile (< 640px):
- Fixed to bottom
- Slides up from bottom
- Full width
- Rounded top only
- Max height: 70vh

Desktop (≥ 640px):
- Centered on screen
- Standard dialog
- Max width: 28rem
- Fully rounded
- Standard height
```

---

## 🔧 Implementation

### Component Structure
```typescript
<TaskEditDialog>
  <DialogHeader>
    Edit Task
  </DialogHeader>
  
  <Content>
    <TaskTitle />
    <Category />
    <Priority />
    <Recurrence />
    
    {hasGoal && (
      <GoalSection>
        <GoalInput />
        <ManualStepUp>
          <QuickButton +15% />
          <CustomButton />
        </ManualStepUp>
        <StepUpHistory />
      </GoalSection>
    )}
    
    <Notes />
    <TaskInfo />
  </Content>
  
  <Actions>
    <Cancel />
    <Save />
  </Actions>
</TaskEditDialog>
```

### Opening Logic
```typescript
// TaskItem.tsx
const handleTaskClick = (e: React.MouseEvent) => {
  const target = e.target as HTMLElement;
  
  // Don't open if clicking interactive elements
  if (
    target.closest('input[type="checkbox"]') ||
    target.closest('button') ||
    target.closest('label')
  ) {
    return;
  }
  
  setEditDialogOpen(true);
};
```

### Manual Step-Up Logic
```typescript
// Quick +15% Step-Up
const handleManualStepUp = () => {
  const currentGoal = task.count.total;
  const increase = Math.ceil(currentGoal * 0.15);
  const newGoal = currentGoal + increase;
  
  // Record in history
  const stepUpHistory = [
    ...task.stepUpHistory,
    {
      oldGoal: currentGoal,
      newGoal: newGoal,
      date: new Date().toISOString()
    }
  ];
  
  // Update task
  updateTask(task.id, {
    count: { ...task.count, total: newGoal },
    stepUpDate: new Date().toISOString(),
    stepUpHistory: stepUpHistory,
    stepUpSuggestion: undefined // Clear AI suggestion
  });
};

// Custom Step-Up
const handleCustomStepUp = () => {
  const newGoal = prompt("Enter new goal:");
  
  // Validate
  if (newGoal <= currentGoal) {
    toast.error("Must be greater than current");
    return;
  }
  
  // Warn if large increase
  if (newGoal > currentGoal * 1.5) {
    const confirm = window.confirm(
      `That's a ${percentage}% increase! Sure?`
    );
    if (!confirm) return;
  }
  
  // Update with history
  // ... same as quick step-up
};
```

---

## 📊 User Experience

### Opening Dialog
```
1. User clicks on task
2. Dialog slides up from bottom (300ms)
3. Form populated with current values
4. Focus on first input (optional)
```

### Editing Task
```
1. User modifies any field
2. Changes reflected in state
3. Validation on save
4. Toast notification on success
```

### Manual Step-Up
```
Quick +15%:
1. Click "+15%" button
2. Instant calculation
3. Goal updated
4. History recorded
5. Toast: "Goal increased from X to Y! 🎉"

Custom:
1. Click "Custom" button
2. Prompt appears
3. Enter new goal
4. Validation check
5. Confirmation if >50% increase
6. Goal updated
7. History recorded
8. Toast notification
```

### Closing Dialog
```
Cancel:
- Click "Cancel" button
- Click outside dialog
- Press Escape key
- Slides down (mobile) or fades out

Save:
- Click "Save Changes"
- Validation passes
- Task updated
- Toast notification
- Dialog closes
```

---

## 🎯 Manual Step-Up Details

### Quick +15% Button
```
Purpose: Fast, safe step-up
Calculation: Math.ceil(current * 0.15)
Examples:
- 20 → 23 (+3)
- 30 → 35 (+5)
- 50 → 58 (+8)

Benefits:
✓ One-click action
✓ Safe increase amount
✓ No typing needed
✓ Instant feedback
```

### Custom Button
```
Purpose: User-defined step-up
Input: Prompt dialog
Validation:
- Must be number
- Must be > current goal
- Warns if > 50% increase

Examples:
- 20 → 25 (25% increase)
- 30 → 40 (33% increase)
- 50 → 80 (60% increase, needs confirmation)

Benefits:
✓ Full control
✓ Any amount
✓ Safety warnings
✓ Confirmation for large jumps
```

### Step-Up History
```
Display:
- Last 3 step-ups
- Old → New format
- Date of each
- Scrollable if more

Example:
📈 30 → 35 (Oct 29, 2024)
📈 25 → 30 (Oct 22, 2024)
📈 20 → 25 (Oct 15, 2024)

Purpose:
✓ Track progression
✓ See patterns
✓ Inform decisions
✓ Motivate user
```

---

## 🔄 Integration with AI

### AI Suggestion vs Manual
```
AI Suggestion:
- Appears as small icon
- Based on complete analysis
- Optimal timing
- Personalized reasoning

Manual Step-Up:
- User-initiated
- Immediate action
- Any time (respects cooldown)
- User's judgment

Both:
- Record in same history
- Update stepUpDate
- Clear AI suggestion
- Trigger new analysis cycle
```

### Data Flow
```
Manual Step-Up
    ↓
Update Task
    ↓
Record in stepUpHistory
    ↓
Set stepUpDate
    ↓
Clear stepUpSuggestion
    ↓
Next AI Analysis (6 hours)
    ↓
AI sees manual step-up in history
    ↓
AI considers it in next decision
```

---

## 📱 Mobile Optimization

### Touch Targets
```
All buttons: 44x44px minimum
Input fields: 48px height
Tap areas: Generous padding
Spacing: 16px between elements
```

### Bottom Sheet
```
Position: Fixed to bottom
Width: Full width
Height: Auto (max 70vh)
Scroll: Content area only
Animation: Slide up 300ms
Backdrop: Tap to close
```

### Keyboard Handling
```
Opens: Pushes dialog up
Closes: Dialog returns
Focus: Maintains on input
Submit: Enter key works
```

---

## 🎨 Visual Examples

### Desktop View
```
┌─────────────────────────────────────┐
│  ✏️ Edit Task                       │
│                                     │
│  Task Title                         │
│  ┌───────────────────────────────┐ │
│  │ Read pages                    │ │
│  └───────────────────────────────┘ │
│                                     │
│  Category                           │
│  ┌───────────────────────────────┐ │
│  │ Personal Growth ▼             │ │
│  └───────────────────────────────┘ │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Goal Target        Current: 28/30  │
│  ┌───────────────────────────────┐ │
│  │ 30                            │ │
│  └───────────────────────────────┘ │
│                                     │
│  Quick Step-Up                      │
│  ┌──────────────┬──────────────┐   │
│  │ 📈 +15% (5)  │ ✏️ Custom    │   │
│  └──────────────┴──────────────┘   │
│                                     │
│  Step-Up History                    │
│  📈 25 → 30 (Oct 22)                │
│  📈 20 → 25 (Oct 15)                │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [ Cancel ]  [ Save Changes ]       │
└─────────────────────────────────────┘
```

### Mobile View (Bottom Sheet)
```
┌─────────────────────────────────────┐
│  ✏️ Edit Task                       │
│  ─────────────────────────────────  │
│                                     │
│  Task Title                         │
│  [Read pages                    ]   │
│                                     │
│  Category                           │
│  [Personal Growth ▼             ]   │
│                                     │
│  Goal Target        Current: 28/30  │
│  [30                            ]   │
│                                     │
│  Quick Step-Up                      │
│  [📈 +15% (5)] [✏️ Custom]          │
│                                     │
│  [Scrollable content...]            │
│                                     │
│  [ Cancel ]  [ Save Changes ]       │
└─────────────────────────────────────┘
```

---

## 🧪 Testing Scenarios

### Test 1: Basic Edit
```
1. Click on task
2. Change title
3. Change category
4. Click "Save Changes"
5. Verify: Task updated
6. Verify: Toast shown
7. Verify: Dialog closed
```

### Test 2: Quick Step-Up
```
1. Click on task with goal
2. Click "+15%" button
3. Verify: Goal increased by 15%
4. Verify: History recorded
5. Verify: Toast shown
6. Verify: Form updated
```

### Test 3: Custom Step-Up
```
1. Click on task with goal
2. Click "Custom" button
3. Enter new goal
4. Verify: Prompt validation
5. Verify: Large increase warning
6. Verify: Goal updated
7. Verify: History recorded
```

### Test 4: Mobile Bottom Sheet
```
1. Open on mobile device
2. Verify: Slides from bottom
3. Verify: Full width
4. Verify: Rounded top only
5. Verify: Scrollable content
6. Verify: Tap outside closes
```

### Test 5: Click Exclusions
```
1. Click checkbox
2. Verify: Dialog doesn't open
3. Click increment button
4. Verify: Dialog doesn't open
5. Click step-up icon
6. Verify: Dialog doesn't open
7. Click task text
8. Verify: Dialog opens
```

---

## 🎓 Best Practices

### For Users
```
✓ Click task to edit anytime
✓ Use +15% for safe increases
✓ Use Custom for specific goals
✓ Add notes for AI context
✓ Check step-up history
✓ Review task info regularly
```

### For Developers
```
✓ Validate all inputs
✓ Confirm large increases
✓ Record all step-ups
✓ Clear AI suggestions
✓ Update timestamps
✓ Show clear feedback
```

---

## 🚀 Future Enhancements

### Planned Features
```
- [ ] Undo last step-up
- [ ] Step-down option
- [ ] Bulk edit multiple tasks
- [ ] Duplicate task
- [ ] Archive task
- [ ] Task templates
- [ ] Quick actions menu
- [ ] Swipe gestures
- [ ] Keyboard shortcuts
- [ ] Voice input
```

### Advanced Step-Up
```
- [ ] AI-suggested custom amounts
- [ ] Progressive step-up plans
- [ ] Goal milestones
- [ ] Celebration animations
- [ ] Achievement badges
- [ ] Streak bonuses
```

---

## 📊 Analytics

### Track User Behavior
```
- Edit frequency
- Most edited fields
- Manual vs AI step-ups
- Average increase amount
- Step-up success rate
- Dialog open duration
```

### Optimize Experience
```
- A/B test button labels
- Test different increase %
- Optimize form layout
- Improve validation
- Enhance animations
```

---

## 🎉 Conclusion

The Task Edit feature provides:
- ✅ **Comprehensive editing** - All properties in one place
- ✅ **Manual step-up** - User control when needed
- ✅ **Beautiful design** - Material 3 bottom sheet
- ✅ **Mobile-first** - Optimized for touch
- ✅ **AI integration** - Works with AI suggestions
- ✅ **History tracking** - Records all changes
- ✅ **User-friendly** - Intuitive and fast

**Result**: Users have full control over their tasks with a beautiful, efficient editing experience that complements the AI-driven step-up system.

---

*Last Updated: October 29, 2025*
*Version: 1.0.0 - Task Edit Feature*
