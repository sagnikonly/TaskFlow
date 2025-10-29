// @deno-types="https://deno.land/x/types/index.d.ts"
// deno-lint-ignore-file no-explicit-any

// Type declarations for Deno global
declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AI models to try in order (best to fallback)
// Using only Gemini 2.0 models for best performance
const AI_MODELS = [
  'gemini-2.0-flash-exp',  // Latest, fastest, most capable free model
];

// Retry configuration - optimized for free tier
const MAX_RETRIES = 5; // More retries for reliability
const RETRY_DELAY_MS = 3000; // 3 seconds base delay

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGeminiWithRetry(
  apiKey: string,
  prompt: string,
  modelIndex = 0,
  retryCount = 0
): Promise<any> {
  const model = AI_MODELS[modelIndex];
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3, // Lower temperature for more consistent, reliable decisions
            maxOutputTokens: 2000, // More tokens for comprehensive responses
            topP: 0.95,
            topK: 40,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      
      // Handle rate limits and quota errors
      if (response.status === 429 || response.status === 503) {
        console.log(`Rate limit or quota exceeded for ${model}, retrying...`);
        
        // Try next model if available
        if (modelIndex < AI_MODELS.length - 1) {
          console.log(`Switching to fallback model: ${AI_MODELS[modelIndex + 1]}`);
          await sleep(RETRY_DELAY_MS);
          return callGeminiWithRetry(apiKey, prompt, modelIndex + 1, 0);
        }
        
        // Retry with same model
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAY_MS * Math.pow(2, retryCount); // Exponential backoff
          console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          await sleep(delay);
          return callGeminiWithRetry(apiKey, prompt, modelIndex, retryCount + 1);
        }
      }
      
      throw new Error(`API Error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error(`Error with ${model}:`, error);
    
    // Try next model if available
    if (modelIndex < AI_MODELS.length - 1) {
      console.log(`Trying fallback model: ${AI_MODELS[modelIndex + 1]}`);
      await sleep(RETRY_DELAY_MS);
      return callGeminiWithRetry(apiKey, prompt, modelIndex + 1, 0);
    }
    
    // Retry with same model
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(delay);
      return callGeminiWithRetry(apiKey, prompt, modelIndex, retryCount + 1);
    }
    
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { task, userProfile } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ shouldStepUp: false, suggestion: null, error: 'API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic validation - only check cooldown
    const hasNotSteppedUpRecently = !task.stepUpDate || 
      (new Date().getTime() - new Date(task.stepUpDate).getTime()) > 3 * 24 * 60 * 60 * 1000;

    if (!hasNotSteppedUpRecently) {
      return new Response(
        JSON.stringify({ shouldStepUp: false, suggestion: null, reason: 'Cooldown period active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare complete task history for AI
    const completionHistory = task.completionHistory || [];
    const stepUpHistory = task.stepUpHistory || [];
    
    // Calculate statistics for AI context
    const totalDays = completionHistory.length;
    const completedDays = completionHistory.filter((h: any) => h.completed).length;
    const completionRate = totalDays > 0 ? (completedDays / totalDays * 100).toFixed(1) : 0;
    
    // Calculate streak
    let currentStreak = 0;
    const sortedHistory = [...completionHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    for (const entry of sortedHistory) {
      if (entry.completed) currentStreak++;
      else break;
    }



    // Create EXTREMELY comprehensive prompt with ALL data and detailed guidelines
    const prompt = `You are an EXPERT productivity coach and behavioral psychologist with 20+ years of experience in progressive goal setting, habit formation, and human performance optimization. Your decisions directly impact user motivation and success.

═══════════════════════════════════════════════════════════════════
CRITICAL MISSION: Analyze this user's COMPLETE history and determine with ABSOLUTE PRECISION whether NOW is the optimal time for a step-up suggestion.
═══════════════════════════════════════════════════════════════════

📋 TASK INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Task Title: ${task.title}
• Category: ${task.category}
• Current Goal: ${task.count?.total || 'N/A'} per day
• Today's Progress: ${task.count?.current || 0}/${task.count?.total || 'N/A'}
• User's Context Notes: ${task.notes || 'None provided'}
• Task Created On: ${task.createdAt || 'Unknown'}
• Last Step-Up Date: ${task.stepUpDate || 'Never stepped up'}

👤 USER PROFILE & CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Name: ${userProfile?.full_name || 'Not specified'}
• Target Exam/Goal: ${userProfile?.target_exam || 'Not specified'}
• Personal Objective: ${userProfile?.goal || 'Not specified'}

📊 COMPLETE PERFORMANCE HISTORY (${totalDays} days tracked):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${completionHistory.length > 0 ? completionHistory.map((h: any) => `${h.date}: ${h.completed ? '✓ COMPLETED' : '✗ MISSED'}`).join('\n') : 'No history yet'}

📈 CALCULATED STATISTICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Total Days Tracked: ${totalDays} days
• Days Successfully Completed: ${completedDays} days
• Overall Completion Rate: ${completionRate}%
• Current Active Streak: ${currentStreak} consecutive days
• Longest Streak Ever: ${calculateLongestStreak(completionHistory)} days
• Days Since Task Created: ${totalDays} days

🎯 STEP-UP HISTORY (${stepUpHistory.length} previous step-ups):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${stepUpHistory.length > 0 ? stepUpHistory.map((su: any, idx: number) => 
  `Step-Up #${idx + 1}: ${su.oldGoal} → ${su.newGoal} (${((su.newGoal - su.oldGoal) / su.oldGoal * 100).toFixed(1)}% increase) on ${su.date}`
).join('\n') : 'This would be the FIRST step-up for this task'}

═══════════════════════════════════════════════════════════════════
🧠 YOUR COMPREHENSIVE ANALYSIS FRAMEWORK:
═══════════════════════════════════════════════════════════════════

1️⃣ PATTERN RECOGNITION (CRITICAL):
   ✓ Analyze the COMPLETE completion history day by day
   ✓ Identify trends: Is performance improving, stable, or declining?
   ✓ Look for patterns: Are there specific days they struggle?
   ✓ Check consistency: How reliable is their completion rate?
   ✓ Examine recent vs. historical performance
   ✓ Consider any gaps or breaks in the streak

2️⃣ READINESS ASSESSMENT (CRITICAL):
   ✓ Is the user TRULY ready for more challenge?
   ✓ Have they demonstrated SUSTAINED consistency?
   ✓ Is their current performance COMFORTABLE or STRUGGLING?
   ✓ Do they have MOMENTUM or are they barely keeping up?
   ✓ Would a step-up be MOTIVATING or OVERWHELMING?

3️⃣ TIMING EVALUATION (CRITICAL):
   ✓ Is NOW the optimal moment or should we wait?
   ✓ Have they had enough time at current level?
   ✓ Is there an upward trend in recent days?
   ✓ Are they in a strong streak or recovering from setback?
   ✓ Consider the 3-day cooldown since last step-up

4️⃣ PROGRESSION RATE CALCULATION (CRITICAL):
   ✓ If this is FIRST step-up: Be CONSERVATIVE (10-15% max)
   ✓ If they have 1-2 step-ups: Be MODERATE (15-20%)
   ✓ If they have 3+ successful step-ups: Can be PROGRESSIVE (20-25%)
   ✓ If previous step-ups were SUCCESSFUL: Continue pattern
   ✓ If previous step-ups caused DECLINE: Be more conservative
   ✓ NEVER suggest more than 25% increase
   ✓ ALWAYS round to sensible numbers (no decimals)

5️⃣ RISK ASSESSMENT (CRITICAL):
   ✓ Could this increase DEMOTIVATE the user?
   ✓ Could this cause BURNOUT or OVERWHELM?
   ✓ Is the foundation SOLID enough?
   ✓ Are there signs of STRUGGLE at current level?
   ✓ Would failure at new level DAMAGE confidence?

6️⃣ CONTEXTUAL FACTORS (CRITICAL):
   ✓ Consider their TARGET EXAM/GOAL timeline
   ✓ Consider the TASK TYPE (reading, exercise, study, etc.)
   ✓ Consider their PERSONAL NOTES for context
   ✓ Consider CATEGORY (some allow faster progression)
   ✓ Consider their OVERALL GOAL and how this task fits

═══════════════════════════════════════════════════════════════════
⚠️ CRITICAL DECISION RULES - FOLLOW STRICTLY:
═══════════════════════════════════════════════════════════════════

🚫 DO NOT SUGGEST STEP-UP IF:
   ❌ Less than 3 days of history (too early to judge)
   ❌ Completion rate below 60% (struggling at current level)
   ❌ Recent declining trend (last 3-5 days worse than average)
   ❌ Just recovered from a break (need stability first)
   ❌ Previous step-up caused performance drop
   ❌ Current streak is less than 3 days (not stable yet)
   ❌ User notes indicate difficulty or stress

✅ CONSIDER STEP-UP IF:
   ✓ At least 5-7 days of solid history
   ✓ Completion rate 75%+ consistently
   ✓ Current streak of 5+ days
   ✓ Recent trend is stable or improving
   ✓ Previous step-ups (if any) were successful
   ✓ User is comfortably hitting current goal
   ✓ No signs of struggle or stress

🎯 STEP-UP AMOUNT GUIDELINES:
   • FIRST step-up: 10-15% increase (build confidence)
   • SECOND step-up: 15-20% increase (moderate growth)
   • THIRD+ step-up: 15-25% increase (based on success)
   • ALWAYS round to whole numbers
   • NEVER suggest less than +1 from current
   • NEVER suggest more than +25% increase

═══════════════════════════════════════════════════════════════════
📝 YOUR RESPONSE REQUIREMENTS:
═══════════════════════════════════════════════════════════════════

If READY for step-up:
• Set shouldStepUp: true
• Calculate newGoal using guidelines above
• Provide SPECIFIC reason citing their actual data
• Give PERSONALIZED motivation mentioning their goals
• Set confidence: 80-100 (based on data strength)

If NOT READY for step-up:
• Set shouldStepUp: false
• Explain EXACTLY what you're waiting to see
• Be SPECIFIC about what needs to improve
• Give ENCOURAGING feedback about current progress
• Set confidence: 70-100 (based on certainty)

═══════════════════════════════════════════════════════════════════
🎯 RESPOND IN THIS EXACT JSON FORMAT:
═══════════════════════════════════════════════════════════════════

{
  "shouldStepUp": boolean,
  "newGoal": number (ONLY if shouldStepUp is true, MUST be whole number),
  "reason": "DETAILED explanation citing SPECIFIC data points from their history (2-3 sentences minimum)",
  "motivationalMessage": "PERSONALIZED encouragement mentioning their specific goals/exam (1-2 sentences)",
  "confidence": number (70-100, representing your certainty in this decision)
}

═══════════════════════════════════════════════════════════════════
⚠️ FINAL REMINDERS:
═══════════════════════════════════════════════════════════════════
• Your decision impacts real user motivation and success
• Be CONSERVATIVE when in doubt - better to wait than overwhelm
• Use ACTUAL DATA from their history in your reasoning
• Make it PERSONAL - mention their exam/goal if provided
• NEVER suggest unrealistic increases
• ALWAYS consider psychological impact
• Your confidence score should reflect data quality and clarity

NOW ANALYZE AND RESPOND:`;

    // Call AI with retry logic
    const data = await callGeminiWithRetry(GEMINI_API_KEY, prompt);
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const aiDecision = JSON.parse(jsonMatch[0]);

    if (!aiDecision.shouldStepUp) {
      return new Response(
        JSON.stringify({ 
          shouldStepUp: false, 
          suggestion: null,
          aiReason: aiDecision.reason,
          confidence: aiDecision.confidence 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        shouldStepUp: true,
        suggestion: {
          currentGoal: task.count?.total || 0,
          newGoal: aiDecision.newGoal,
          reason: aiDecision.reason,
          motivationalMessage: aiDecision.motivationalMessage,
          confidence: aiDecision.confidence,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-step-up:', error);
    return new Response(
      JSON.stringify({ 
        shouldStepUp: false, 
        suggestion: null,
        error: error.message || 'Internal server error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to calculate longest streak
function calculateLongestStreak(history: any[]): number {
  let maxStreak = 0;
  let currentStreak = 0;
  
  const sorted = [...history].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  for (const entry of sorted) {
    if (entry.completed) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return maxStreak;
}
