/**
 * Frontend Gemini AI service
 * Used for direct AI features in the UI (chat widget, insights)
 * Falls back gracefully if API key not set
 */

import { COMPANY, financialYearLabel } from '@/utils/india';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

const ARIA_SYSTEM = `You are ARIA (AI Recruitment & HR Intelligence Assistant) for SmartHR Nexus.
You are a professional, empathetic HR assistant. Be concise and helpful.
You can help with: leave policies, attendance, payroll queries, performance reviews, recruitment,
HR compliance, onboarding/offboarding, employee benefits, and general HR guidance.
Keep responses short and actionable. Use bullet points when listing multiple items.

India context (always apply):
- Company: ${COMPANY.name}, ${COMPANY.address}. An Indian IT company; employees work in India.
- Currency is INR. Write amounts with ₹ and Indian digit grouping (₹1,25,000) and use lakh/crore (₹12 lakh, ₹38 crore), never $ or USD.
- Time zone is IST (Asia/Kolkata). Dates are DD/MM/YYYY or "9 Oct 2026". The financial year runs April–March (current: ${financialYearLabel()}).
- Follow Indian labour law: the four Labour Codes (Wages, Industrial Relations, Social Security, Occupational Safety), Payment of Gratuity and Bonus rules.
- Payroll deductions: Provident Fund (PF) 12% of basic by employee + 12% by employer (wage ceiling ₹15,000); ESI 0.75% employee + 3.25% employer when gross pay is ₹21,000/month or less; Professional Tax as per state (Gujarat ₹200/month); TDS on salary.
- Income tax: default is the new tax regime for ${financialYearLabel()} — ₹75,000 standard deduction, and no tax up to ₹12 lakh taxable income thanks to the Section 87A rebate; slabs 0–4L nil, 4–8L 5%, 8–12L 10%, 12–16L 15%, 16–20L 20%, 20–24L 25%, above 24L 30%, plus 4% health & education cess. Mention the old regime only if asked.
- Leave types: Earned Leave (EL, 18 days/year), Casual Leave (CL, 8), Sick Leave (SL, 8), Maternity Leave (26 weeks paid), Paternity Leave (10 days), Leave Without Pay (LWP).
- Holidays: Indian national and Gujarat public holidays (Republic Day, Holi, Independence Day, Gandhi Jayanti, Dussehra, Diwali, Gujarati New Year, Christmas etc.).
- For complex tax or legal questions, suggest checking with HR/payroll or a Chartered Accountant.`;

/**
 * Send a chat message to Gemini and get a response
 * @param {Array} messages - [{role:'user'|'assistant', content:'...'}]
 * @param {Object} context - {role, name, department}
 */
export const chatWithGemini = async (messages, context = {}) => {
  if (!GEMINI_API_KEY) {
    return "⚠️ ARIA AI is not configured. Please add VITE_GEMINI_API_KEY to your frontend .env file to enable AI chat.";
  }

  try {
    const contextNote = `\n[User: ${context.name || 'Employee'} | Role: ${context.role || 'employee'} | Dept: ${context.department || 'Unknown'}]`;

    // Build Gemini contents array
    const contents = messages.map((m, i) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: i === 0 && m.role === 'user'
        ? `${ARIA_SYSTEM}${contextNote}\n\n${m.content}`
        : m.content
      }],
    }));

    const res = await fetch(GEMINI_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature:     0.7,
          maxOutputTokens: 2048,
          topP:            0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Gemini error:', err);
      if (res.status === 400) return "I couldn't process that request. Please rephrase your question.";
      if (res.status === 429) return "I'm handling too many requests right now. Please try again in a moment.";
      return "I'm having trouble connecting. Please try again shortly.";
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I didn't get a response. Please try again.";
  } catch (err) {
    console.error('Gemini fetch error:', err);
    return "Connection error. Please check your internet and try again.";
  }
};

/**
 * Generate a quick AI insight for a given topic
 */
export const getQuickInsight = async (topic, data) => {
  if (!GEMINI_API_KEY) return null;
  try {
    const prompt = `As an HR AI for an Indian company (amounts in ₹, lakh/crore; financial year April–March), give a 1-sentence insight about: ${topic}. Data: ${JSON.stringify(data)}. Be concise.`;
    const res = await fetch(GEMINI_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role:'user', parts:[{text:prompt}] }], generationConfig:{ maxOutputTokens:100 } }),
    });
    if (!res.ok) return null;
    const data2 = await res.json();
    return data2.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch { return null; }
};

export default { chatWithGemini, getQuickInsight };
