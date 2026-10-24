/**
 * SmartHR Nexus — AI Service (Google Gemini)
 * Replaces OpenAI with Google Generative AI (gemini-1.5-flash / gemini-1.5-pro)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const fs       = require('fs');
const logger   = require('../../utils/logger');
const { Application } = require('../../models/Recruitment.model');

// ── Gemini client ─────────────────────────────────────────────────────────────
const getClient = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set in .env');
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const getModel = (pro = false) => {
  const genAI = getClient();
  const defaultModel = pro ? 'gemini-pro-latest' : 'gemini-flash-latest';
  const modelName = pro ? (process.env.GEMINI_PRO_MODEL || defaultModel) : (process.env.GEMINI_MODEL || defaultModel);
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
  });
};

/** Call Gemini and parse JSON from the response */
const callGemini = async (prompt, { pro = false, json = true } = {}) => {
  const model    = getModel(pro);
  const result   = await model.generateContent(prompt);
  const text     = result.response.text().trim();
  if (!json) return text;

  // Strip possible markdown code fences
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(clean);
};

// ── Extract text from resume PDF ─────────────────────────────────────────────
const extractResumeText = async (resumePath) => {
  try {
    const dataBuffer = fs.readFileSync(resumePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    logger.error(`Resume extraction failed: ${error.message}`);
    throw new Error('Failed to extract resume text');
  }
};

// ── AI Resume Screening ───────────────────────────────────────────────────────
const screenResume = async (applicationId, jobDetails, resumeText) => {
  try {
    const prompt = `
You are an expert AI HR talent evaluator for SmartHR Nexus.
Analyze this resume against the job requirements and return ONLY a valid JSON object — no markdown, no explanation.

JOB:
Title: ${jobDetails.title}
Required Skills: ${jobDetails.skills?.join(', ')}
Experience Required: ${jobDetails.experience?.min}–${jobDetails.experience?.max} years
Requirements:
${jobDetails.requirements?.join('\n')}

RESUME:
${resumeText.slice(0, 4000)}

Return this exact JSON structure:
{
  "score": <0–100 integer>,
  "recommendation": "<strong_yes|yes|maybe|no>",
  "summary": "<2–3 sentence assessment>",
  "strengths": ["<strength 1>","<strength 2>","<strength 3>"],
  "weaknesses": ["<gap 1>","<gap 2>"],
  "skillMatch": [{"skill":"<name>","matched":<true|false>,"score":<0–100>}],
  "experienceMatch": <true|false>,
  "educationMatch": <true|false>,
  "keyHighlights": ["<highlight 1>"],
  "redFlags": []
}

Be objective. Do not discriminate based on name, gender, or ethnicity.
`;

    const result = await callGemini(prompt);

    await Application.findByIdAndUpdate(applicationId, {
      'aiScreening.score':          result.score,
      'aiScreening.summary':        result.summary,
      'aiScreening.strengths':      result.strengths,
      'aiScreening.weaknesses':     result.weaknesses,
      'aiScreening.recommendation': result.recommendation,
      'aiScreening.skillMatch':     result.skillMatch,
      'aiScreening.processedAt':    new Date(),
      stage: result.score >= 70 ? 'shortlisted' : 'rejected',
    });

    logger.info(`✅ Gemini resume screening done for ${applicationId}: Score ${result.score}`);
    return result;
  } catch (error) {
    logger.error(`Resume screening failed: ${error.message}`);
    throw error;
  }
};

// ── HR Chat (ARIA) ────────────────────────────────────────────────────────────
const chatWithHR = async (messages, context = {}) => {
  try {
    let userStats = null;
    let companyStats = null;

    if (context.userId) {
      try {
        const mongoose = require('mongoose');
        const User = mongoose.model('User');
        const Attendance = mongoose.model('Attendance');
        const Payroll = mongoose.model('Payroll');
        const Department = mongoose.model('Department');

        // Fetch User details
        const employee = await User.findById(context.userId).populate('department');

        // Calculate attendance stats for this user
        const attendanceRecords = await Attendance.find({ employee: context.userId });
        const totalAttendance = attendanceRecords.length;
        const presentCount = attendanceRecords.filter(r => ['present', 'late', 'work_from_home'].includes(r.status)).length;
        const wfhCount = attendanceRecords.filter(r => r.status === 'work_from_home').length;
        const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
        const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

        // Fetch latest payroll
        const latestPayroll = await Payroll.findOne({ employee: context.userId })
          .sort({ 'payPeriod.year': -1, 'payPeriod.month': -1 });

        userStats = {
          employeeId: employee?.employeeId || 'N/A',
          fullName: employee?.fullName || context.name,
          role: employee?.role || context.role,
          position: employee?.position || 'N/A',
          department: employee?.department?.name || context.department || 'N/A',
          dateOfJoining: employee?.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A',
          skills: employee?.skills || [],
          salaryBasic: employee?.salary?.basic || 0,
          attendance: {
            percentage: attendancePercentage,
            present: presentCount,
            absent: absentCount,
            wfh: wfhCount,
            totalRecords: totalAttendance
          },
          latestPayroll: latestPayroll ? {
            month: latestPayroll.payPeriod.month,
            year: latestPayroll.payPeriod.year,
            grossEarnings: latestPayroll.grossEarnings,
            totalDeductions: latestPayroll.totalDeductions,
            netSalary: latestPayroll.netSalary,
            status: latestPayroll.status
          } : null
        };

        // Fetch company statistics (for company insights)
        const totalEmployees = await User.countDocuments({ isActive: true });
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const presentToday = await Attendance.countDocuments({ date: { $gte: today }, status: { $in: ['present', 'late', 'work_from_home'] } });
        const wfhToday = await Attendance.countDocuments({ date: { $gte: today }, status: 'work_from_home' });
        const deptsCount = await Department.countDocuments({ isActive: true });
        
        companyStats = {
          name: "SmartHR Nexus Inc.",
          totalEmployees,
          presentToday,
          wfhToday,
          activeDepartments: deptsCount,
          activeJobPostings: 47,
        };
      } catch (err) {
        logger.error(`Failed to load ARIA db context: ${err.message}`);
      }
    }

    const systemContext = `
You are ARIA (AI Recruitment & HR Intelligence Assistant) for SmartHR Nexus.
You are a professional, empathetic HR assistant. 

IMPORTANT: You are directly integrated with the SmartHR Nexus databases and have real-time access to the user's data and company statistics. Use this data directly to answer the user's questions about their attendance, salary/payroll, role, profile, and company-wide statistics. Do NOT tell the user that you need access to their HR portal or ask for their employee ID since you already have this information!

${userStats ? `CURRENT USER REAL-TIME DATABASE PROFILE:
- Full Name: ${userStats.fullName}
- Employee ID: ${userStats.employeeId}
- Role: ${userStats.role}
- Position: ${userStats.position}
- Department: ${userStats.department}
- Date of Joining: ${userStats.dateOfJoining}
- Skills: ${userStats.skills.join(', ') || 'None listed'}
- Basic Salary: ${userStats.salaryBasic}

USER ATTENDANCE STATS:
- Current Monthly Attendance Percentage: ${userStats.attendance.percentage}% (calculated based on ${userStats.attendance.totalRecords} logged days)
- Logged Days: ${userStats.attendance.present} Present/Late/WFH, ${userStats.attendance.wfh} Work From Home, ${userStats.attendance.absent} Absent.

USER LATEST PAYROLL STATS:
${userStats.latestPayroll ? `- Pay Period: ${userStats.latestPayroll.month}/${userStats.latestPayroll.year}
- Net Salary: ${userStats.latestPayroll.netSalary}
- Gross Earnings: ${userStats.latestPayroll.grossEarnings}
- Total Deductions: ${userStats.latestPayroll.totalDeductions}
- Payroll Status: ${userStats.latestPayroll.status}` : `- No processed payroll records found.`}
` : `USER CONTEXT:
- Role: ${context.role || 'employee'}
- Name: ${context.name || 'User'}
- Department: ${context.department || 'Unknown'}`}

${companyStats ? `COMPANY REAL-TIME STATS:
- Company Name: ${companyStats.name}
- Total Active Employees: ${companyStats.totalEmployees}
- Attendance Status Today: ${companyStats.presentToday} checked-in employees (${companyStats.wfhToday} working remotely)
- Active Departments: ${companyStats.activeDepartments}
- Open/Active Job Postings: ${companyStats.activeJobPostings}
` : ''}

INDIA CONTEXT (always apply):
- The company is Nexus Infotech Pvt. Ltd., headquartered in Ahmedabad, Gujarat, with offices in Mumbai, Bengaluru, Pune and Hyderabad. The platform was developed by Jensi Patel.
- All amounts are in Indian Rupees: write them with the ₹ symbol and Indian digit grouping (₹1,23,456), and use lakh/crore (e.g. ₹8.6 lakh per annum).
- Salary structure: Basic (50% of gross), HRA, Conveyance, Medical and Special Allowance. Deductions: Provident Fund (12% of basic up to ₹15,000 wages), ESI (0.75% when gross is ₹21,000/month or less), Professional Tax (Gujarat ₹200/month) and TDS.
- Income tax: new tax regime for FY 2026-27 — slabs 0% up to ₹4 lakh, 5% ₹4–8 lakh, 10% ₹8–12 lakh, 15% ₹12–16 lakh, 20% ₹16–20 lakh, 25% ₹20–24 lakh, 30% above ₹24 lakh; ₹75,000 standard deduction; no tax when taxable income is up to ₹12 lakh; 4% cess.
- Leave policy: Earned Leave (EL) 18 days/year, Casual Leave (CL) 8, Sick Leave (SL) 8, maternity leave 26 weeks, paternity leave 10 days, Leave Without Pay (LWP).
- Financial year is April–March; time zone is IST. Follow Indian labour codes and Gujarat public holidays (e.g. Uttarayan, Holi, Independence Day, Gandhi Jayanti, Dussehra, Diwali, Gujarati New Year).

Help the user with:
- Recruitment and hiring
- Employee onboarding/offboarding
- HR policies and compliance (such as leave policy, work from home rules)
- Performance management
- Payroll, salary, and benefits queries
- Leave status and attendance percentage

Be concise, helpful, and professional. Use bullet points when listing items. For sensitive HR matters (e.g. disputes), recommend speaking with HR directly.
`;

    // Build conversation history for Gemini (ensuring it starts with a 'user' message)
    const history = [];
    let foundUserMsg = false;
    for (let i = 0; i < messages.length - 1; i++) {
      const m = messages[i];
      if (m.role === 'user') foundUserMsg = true;
      if (foundUserMsg) {
        history.push({
          role:  m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        });
      }
    }

    const model = getModel(false);
    const chat  = model.startChat({
      history,
      systemInstruction: { parts: [{ text: systemContext }] },
    });

    const lastMsg = messages[messages.length - 1];
    const result  = await chat.sendMessage(lastMsg.content);
    return result.response.text();
  } catch (error) {
    logger.error(`ARIA chat failed: ${error.message}`);
    throw error;
  }
};

// ── Interview Analysis ────────────────────────────────────────────────────────
const analyzeInterview = async (transcript, jobTitle, candidateName) => {
  try {
    const prompt = `
Analyze this interview transcript for ${jobTitle}.
Candidate: ${candidateName}

TRANSCRIPT:
${transcript.slice(0, 3000)}

Return ONLY valid JSON (no markdown):
{
  "overallRating": <1–5>,
  "communicationScore": <1–5>,
  "technicalScore": <1–5>,
  "cultureFitScore": <1–5>,
  "keyInsights": ["<insight>"],
  "concerns": ["<concern>"],
  "recommendation": "<hire|consider|reject>",
  "sentimentAnalysis": "<positive|neutral|negative>",
  "summary": "<2–3 sentence summary>"
}
`;
    return await callGemini(prompt);
  } catch (error) {
    logger.error(`Interview analysis failed: ${error.message}`);
    throw error;
  }
};

// ── Performance Insights ──────────────────────────────────────────────────────
const generatePerformanceInsights = async (employeeData, reviewData) => {
  try {
    const prompt = `
Generate AI performance insights for an employee review.

Employee: ${employeeData.name}, ${employeeData.position}, ${employeeData.department}
Tenure: ${employeeData.tenure} months
Previous Rating: ${employeeData.previousRating || 'N/A'}

Review Data:
${JSON.stringify(reviewData, null, 2)}

Return ONLY valid JSON (no markdown):
{
  "summary": "<comprehensive summary>",
  "predictions": ["<career prediction>"],
  "recommendations": ["<development recommendation>"],
  "riskFlags": ["<retention or performance risk if any>"],
  "promotionReadiness": "<ready|6_months|12_months|not_ready>",
  "keyAchievements": ["<achievement>"],
  "developmentAreas": ["<area>"]
}
`;
    return await callGemini(prompt);
  } catch (error) {
    logger.error(`Performance insights failed: ${error.message}`);
    throw error;
  }
};

// ── Payroll Optimization ──────────────────────────────────────────────────────
const optimizePayroll = async (payrollData, employeeData) => {
  try {
    const prompt = `
Analyze this payroll and suggest tax-efficient optimizations.

Employee: ${employeeData.name}
Tax Regime: ${employeeData.taxRegime}
Location: ${employeeData.location}

Payroll Data:
${JSON.stringify(payrollData, null, 2)}

Return ONLY valid JSON (no markdown):
{
  "taxSavings": <estimated annual savings>,
  "suggestions": [{"item":"<suggestion>","potentialSaving":<amount>,"action":"<action>"}],
  "allowanceOptimization": "<recommendation>",
  "investmentRecommendations": ["<recommendation>"],
  "complianceAlerts": ["<alert if any>"]
}
`;
    return await callGemini(prompt);
  } catch (error) {
    logger.error(`Payroll optimization failed: ${error.message}`);
    throw error;
  }
};

// ── Job Description Generator ─────────────────────────────────────────────────
const generateJobDescription = async (jobTitle, department, requirements) => {
  try {
    const prompt = `
Write a professional, engaging job description for SmartHR Nexus.

Role: ${jobTitle}
Department: ${department}
Key Requirements: ${requirements}

Return ONLY valid JSON (no markdown):
{
  "description": "<2–3 paragraph job description>",
  "responsibilities": ["<responsibility 1>","<responsibility 2>","<responsibility 3>","<responsibility 4>","<responsibility 5>"],
  "requirements": ["<requirement 1>","<requirement 2>","<requirement 3>","<requirement 4>"],
  "benefits": ["<benefit 1>","<benefit 2>","<benefit 3>"],
  "skills": ["<skill 1>","<skill 2>","<skill 3>","<skill 4>","<skill 5>"]
}
`;
    return await callGemini(prompt);
  } catch (error) {
    logger.error(`JD generation failed: ${error.message}`);
    throw error;
  }
};

module.exports = {
  extractResumeText,
  screenResume,
  chatWithHR,
  analyzeInterview,
  generatePerformanceInsights,
  optimizePayroll,
  generateJobDescription,
};
