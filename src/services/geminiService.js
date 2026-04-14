// Gemini API integration service
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;

if (API_KEY && API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(API_KEY);
}

/**
 * Analyze a complaint and suggest priority, category, sentiment, etc., using Gemini AI
 */
export async function analyzeComplaint(title, description) {
  if (!genAI) {
    return {
      priority: 'medium',
      category: 'Other',
      department: 'Administration',
      sentiment: 'Neutral',
      urgency: 'Moderate',
      keyIssues: ['AI analysis unavailable'],
      summary: 'AI analysis unavailable – please configure your Gemini API key.',
      suggestedResponse: 'Thank you for your complaint. We will review it shortly.',
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an AI assistant for a university complaint management system.
Analyze the following complaint and respond with a JSON object only (no markdown formatting, no extra text).

Complaint Title: ${title}
Complaint Description: ${description}

Respond with exactly this JSON structure:
{
  "category": "Academic" | "Infrastructure" | "Hostel" | "Canteen" | "Library" | "Administration" | "Sports" | "Other",
  "priority": "low" | "medium" | "high" | "critical",
  "department": "Computer Science" | "Information Technology" | "Electronics" | "Mechanical" | "Civil" | "Electrical" | "Other",
  "sentiment": "Positive" | "Neutral" | "Negative" | "Critical",
  "urgency": "A 1-3 word description of the urgency",
  "keyIssues": ["an array of 2-3 short key issues extracted from the text"],
  "summary": "A concise 1-sentence summary of the main issue",
  "suggestedResponse": "A personalized acknowledgment message thanking the user",
  "suggestedSolution": "An immediate troubleshooting step or workaround they can try",
  "estimatedResolutionTime": "Estimated ETA based on severity (e.g., '24-48 hours', 'Immediate')",
  "helpfulTips": ["Wait patiently", "Check portal"]
}

Important Logic Constraints: 
- If the sentiment is 'Critical', the 'priority' MUST be set to 'critical'.
- Detect emotional tone deeply focusing on frustration indicating a Critical score.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      priority: 'medium',
      category: 'Other',
      department: 'Administration',
      sentiment: 'Neutral',
      urgency: 'Unknown',
      keyIssues: ['Error during analysis'],
      summary: 'Could not analyze complaint automatically.',
      suggestedResponse: 'Thank you for your complaint.',
      suggestedSolution: 'No immediate solution available.',
      estimatedResolutionTime: 'Unknown',
      helpfulTips: ['Please wait for our admin team to review this.'],
    };
  }
}

/**
 * Generate a personalized draft response block for admin panel
 */
export async function generateAutoResponseDraft(complaint) {
  if (!genAI) return 'AI auto-responder unavailable.';
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Draft a personalized, professional email response to this student complaint.
Student: ${complaint.submittedBy}
Category: ${complaint.category}
Issue: ${complaint.description}
Status: ${complaint.status}

The tone should be empathetic, assuring action, and formal. Keep it to 3-4 short paragraphs without placeholders if possible.`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    return 'Failed to generate draft. Please write manually.';
  }
}


/**
 * Generate a resolution summary for a complaint
 */
export async function generateResolutionSummary(complaint) {
  if (!genAI) {
    return 'AI resolution summary unavailable. Please configure your Gemini API key in the .env file.';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate a professional resolution summary for this complaint:
Title: ${complaint.title}
Category: ${complaint.category}
Priority: ${complaint.priority}
Description: ${complaint.description}
Status: ${complaint.status}

Write a brief, professional 2-3 sentence resolution summary that could be sent to the customer.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Unable to generate resolution summary at this time.';
  }
}

/**
 * Get AI-powered insights for the admin dashboard
 */
export async function getDashboardInsights(stats) {
  if (!genAI) {
    return 'Configure your Gemini API key to receive AI-powered insights about your complaint trends.';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `As a complaint management AI analyst, provide 2-3 concise insights based on these stats:
- Total complaints: ${stats.total}
- Pending: ${stats.pending}
- In Progress: ${stats.inProgress}
- Resolved: ${stats.resolved}
- High priority: ${stats.highPriority}

Provide actionable insights in 2-3 short bullet points.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Unable to fetch AI insights at this time.';
  }
}

/**
 * Perform semantic search across complaints to find related ones
 */
export async function performSemanticSearch(query, complaints) {
  if (!genAI || !query || complaints.length === 0) return [];

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const searchableData = complaints.map(c => ({
      id: c.id,
      title: c.title,
      desc: c.description,
      cat: c.category
    }));

    const prompt = `You are a semantic search engine matching a user query to complaints databases.
Query: "${query}"
    
Complaints data:
${JSON.stringify(searchableData)}

Return a JSON array of the most relevant matched complaints.
Each object must have:
- "id": the exact complaint ID
- "relevanceScore": number 1-100 indicating semantic match strength
- "reason": A short 4-8 word reason why it matches

Respond ONLY with the precise JSON array.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('Semantic search error:', error);
    return [];
  }
}

/**
 * Perform comprehensive deep analytics across all institutional metrics
 */
export async function generateDeepAnalytics(complaints) {
  if (!genAI || !complaints || complaints.length === 0) return null;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // Using PRO model for massive context analysis
    
    // Minimized data footprint to prevent overwhelming token context
    const dataset = complaints.map(c => ({
      id: c.id,
      category: c.category,
      department: c.department || c.studentDepartment,
      priority: c.priority,
      status: c.status,
      desc: c.description.substring(0, 500) // Truncated to avoid extreme token lengths
    }));

    const prompt = `You are a Senior Strategic Data Operations AI analyzing incident reports for a university/organization. 
Analyze the following dataset of all active and resolved complaints.

Dataset:
${JSON.stringify(dataset)}

Identify macro-level systemic issues, predict resolution timelines over similar issues, evaluate department load, and provide concrete preventative measures.

Respond ONLY with exactly this JSON structure (no markdown, no extra text):
{
  "summaryReport": "A detailed 2-3 sentence executive summary of the system's current operations state",
  "patterns": [
    { "pattern": "Short description of repeating issue", "frequency": "High/Medium/Low", "severity": "Critical/High/Medium/Low" }
  ],
  "rootCauses": [
    { "issue": "The recurring problem", "cause": "The logical root cause you deduce", "confidence": "Percentage 1-100" }
  ],
  "recommendations": [
    { "action": "Specific preventative mitigation step", "impact": "High/Medium/Low", "effort": "High/Medium/Low" }
  ],
  "departmentMetrics": [
    { "department": "Dept Name", "performanceScore": "1-100", "bottleneck": "Primary AI-perceived bottleneck" }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Deep analytics error:', error);
    return null;
  }
}
