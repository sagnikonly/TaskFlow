# Step Up Feature - Implementation Guide

## Overview
The Step Up feature is an intelligent, AI-powered system that automatically suggests goal increases when users are ready. It works silently in the background and appears as a minimal, non-intrusive indicator within tasks.

## Key Design Principles

### 1. Minimal & Subtle UI
- **No explicit button** on home screen
- **Small icon indicator** appears next to task title when suggestion is ready
- **Material 3 compliant** design with rounded corners and proper spacing
- **Non-intrusive** - doesn't interrupt user workflow

### 2. Intelligent Backend Analysis
The AI analyzes multiple factors to determine the right time:

#### Criteria for Step-Up Suggestion:
- **Consistency**: 75%+ completion rate
- **Streak**: 7+ consecutive days of completion
- **Progress**: Regularly hitting 85%+ of current goal
- **History**: At least 7 days of tracked data
- **Cooldown**: 14+ days since last step-up

#### AI Decision Making:
The Gemini AI considers:
- Task completion patterns
- User's target exam/goal from profile
- Personal notes on the task
- Task category and type
- Gradual progression (10-25% increase max)

### 3. Profile Integration
Users can add in Settings:
- **Full Name**: Personal identification
- **Target Exam/Goal**: e.g., JEE, NEET, UPSC, Personal fitness
- **Personal Goal**: Detailed description of what they want to achieve

This data is used by AI to provide contextual suggestions.

## Technical Implementation

### Frontend Components

#### 1. StepUpIndicator (`src/components/StepUpIndicator.tsx`)
- Minimal circular icon with trending_up symbol
- Appears inline with task title
- Opens dialog on click showing:
  - Current goal → New goal
  - AI-generated reason
  - Motivational message
  - Accept/Dismiss buttons

#### 2. useStepUpAnalysis Hook (`src/hooks/use-step-up-analysis.ts`)
- Runs automatically on Home page mount
- Checks every 6 hours for eligible tasks
- Calls backend function for each eligible task
- Updates task context with suggestions

### Backend Functions

#### 1. analyze-step-up (`supabase/functions/analyze-step-up/index.ts`)
**Purpose**: Analyze individual task and generate step-up suggestion

**Input**:
```json
{
  "task": {
    "id": "string",
    "title": "string",
    "category": "string",
    "count": { "current": number, "total": number },
    "completionHistory": [{ "date": "string", "completed": boolean }],
    "notes": "string",
    "stepUpDate": "string"
  },
  "userProfile": {
    "target_exam": "string",
    "goal": "string"
  }
}
```

**Output**:
```json
{
  "shouldStepUp": boolean,
  "suggestion": {
    "currentGoal": number,
    "newGoal": number,
    "reason": "string",
    "motivationalMessage": "string"
  }
}
```

#### 2. check-step-up-suggestions (`supabase/functions/check-step-up-suggestions/index.ts`)
**Purpose**: Scheduled function to check all users' tasks (for future Supabase cron integration)

### Data Flow

```
User completes tasks daily
        ↓
Completion history tracked in TaskContext
        ↓
useStepUpAnalysis hook runs (every 6 hours)
        ↓
Eligible tasks sent to analyze-step-up function
        ↓
AI analyzes patterns + user profile
        ↓
If ready: suggestion added to task
        ↓
Small icon appears next to task
        ↓
User clicks → sees suggestion → accepts/dismisses
```

## Configuration

### Required Setup

1. **Gemini API Key**
   - Get from: https://aistudio.google.com/apikey
   - Add in Settings → Gemini API Key section
   - Stored in localStorage as `gemini_api_key`

2. **User Profile** (Optional but recommended)
   - Go to Settings → Profile
   - Add Target Exam/Goal
   - Add Personal Goal description
   - This helps AI provide better suggestions

3. **Task Notes** (Optional)
   - When creating tasks, add notes
   - AI uses this context for analysis
   - Example: "Preparing for JEE Math section"

## User Experience Flow

### Day 1-6: Building Consistency
- User creates task: "Read 30 pages"
- Completes it daily
- No step-up suggestion yet

### Day 7+: AI Monitoring
- User maintains 7-day streak
- Consistently hits 85%+ of goal
- AI analyzes in background
- No visible changes yet

### Day 8-10: Suggestion Appears
- AI determines user is ready
- Small trending_up icon appears next to task
- User notices subtle indicator
- Clicks to see suggestion

### Accepting Suggestion
- Dialog shows: 30 → 35 pages
- Explains why (consistency, streak)
- Motivational message
- User accepts → goal updated
- 14-day cooldown starts

## Best Practices

### For Users
1. **Add profile information** for better suggestions
2. **Use task notes** to provide context
3. **Be consistent** - AI rewards consistency
4. **Don't rush** - suggestions appear when you're ready
5. **Dismiss if not ready** - no pressure to accept

### For Developers
1. **Keep UI minimal** - don't add more buttons
2. **Respect cooldown periods** - avoid suggestion fatigue
3. **Test AI prompts** - ensure reasonable increases
4. **Monitor API usage** - Gemini API has rate limits
5. **Handle errors gracefully** - fail silently if API unavailable

## Future Enhancements

### Planned Features
1. **Supabase Integration**
   - Store tasks in database
   - Sync across devices
   - Server-side cron job for analysis

2. **Advanced AI Analysis**
   - Consider time of day patterns
   - Analyze task difficulty
   - Personalized increase percentages
   - Multi-task correlation

3. **Gamification**
   - Badges for accepting step-ups
   - Streak visualization
   - Progress milestones

4. **Notifications**
   - Optional push notifications
   - Email summaries
   - Weekly progress reports

## Troubleshooting

### Suggestions Not Appearing
- Check if Gemini API key is set
- Verify task has 7+ days of history
- Ensure completion rate is 75%+
- Check if 14 days passed since last step-up

### API Errors
- Verify API key is valid
- Check internet connection
- Review browser console for errors
- Ensure Supabase functions are deployed

### Incorrect Suggestions
- Update profile information
- Add more detailed task notes
- Adjust AI prompt in backend function
- Report issue with task details

## API Costs

### Gemini API (Free Tier)
- 15 requests per minute
- 1,500 requests per day
- Sufficient for personal use
- Each analysis = 1 request

### Optimization
- 6-hour check interval reduces calls
- Only eligible tasks analyzed
- Caching prevents duplicate analysis
- Cooldown period limits frequency

## Privacy & Security

### Data Handling
- API key stored locally (localStorage)
- Tasks stored locally (localStorage)
- Profile data in Supabase (encrypted)
- No third-party tracking

### AI Processing
- Task data sent to Gemini API
- No personal identifiable information
- Only task metrics and notes
- Responses not stored by Google

## Conclusion

The Step Up feature provides intelligent, personalized goal progression without overwhelming users. It respects Material 3 design principles, works silently in the background, and appears only when users are truly ready to level up.
