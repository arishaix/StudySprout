import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for DB updates
);

export async function POST(req: Request) {
  try {
    const { activity, minutes, notes, vibe, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 1. Check Usage Limit & Admin Status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('last_herald_at, is_admin, vibe_history')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Supabase Profile Error:", profileError);
      return NextResponse.json({ 
        error: "Database error. Please ensure the migration for 'vibe_history' was run." 
      }, { status: 500 });
    }

    // Smart Guardrail Logic
    const isAdmin = !!profile.is_admin;
    const history = profile.vibe_history || [];
    const hasTriedVibe = history.includes(vibe);
    const now = new Date();

    // Bypass if Admin OR First time trying this specific vibe
    if (!isAdmin && hasTriedVibe && profile?.last_herald_at) {
      const lastUsed = new Date(profile.last_herald_at);
      if (lastUsed.toDateString() === now.toDateString()) {
        return NextResponse.json({ 
          error: "The Ghostwriter drafted for you already today! 🎋 Blooms are limited to 1 draft/day for vibes they've already tried." 
        }, { status: 429 });
      }
    }

    // Prepare history update
    const updatedHistory = hasTriedVibe ? history : [...history, vibe];

    // 2. Construct Prompt
    const systemPrompt = `You are "The Bloom Ghostwriter", a specialized agent for the StudySprout app. 
    Your mission is to transform study sessions into viral social media posts for X (Twitter).
    
    STRICT RULES:
    1. WORD COUNT: Aim for 40-60 words.
    2. STYLE: Match the requested vibe exactly: "${vibe}".
       - "Focus": Professional, direct, results-oriented, emphasizes discipline.
       - "Growth": Inspiring, positive, emphasizes the journey.
       - "Casual": Friendly, relatable, conversational.
    3. CONTENT: Only talk about studies, learning, or productivity. If the input is about something else, politely decline.
    4. Focus on the effort and progress shown in the log.`;

    const userPrompt = `Vibe: ${vibe}
    Activity: ${activity}
    Duration: ${minutes} minutes
    Personal Notes: ${notes}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    });

    const suggestion = completion.choices[0].message.content;

    // 3. Update limit and history in DB
    await supabase
      .from('profiles')
      .update({ 
        last_herald_at: new Date().toISOString(),
        vibe_history: updatedHistory
      })
      .eq('id', userId);

    return NextResponse.json({ suggestion });

  } catch (error: any) {
    console.error('Ghostwriter Error:', error);
    return NextResponse.json({ error: 'Failed to summon the Ghostwriter' }, { status: 500 });
  }
}
