'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Audit utility usage data using AI
 * Analyzes San Antonio utility usage data with seasonal context
 * Returns a witty analysis of whether the usage is normal
 */
export async function auditUtilityUsage(usageData: {
    date: Date | string;
    value: number;
    unit: string;
    accountType?: string;
}[]) {
    try {
        // Get the generative model
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Format usage data for the prompt
        const formattedData = usageData.map((log) => ({
            date: typeof log.date === 'string' ? log.date : log.date.toISOString().split('T')[0],
            value: log.value,
            unit: log.unit,
            accountType: log.accountType || 'unknown',
        }));

        const prompt = `Analyze this San Antonio utility usage data. We utilize real-time data to prevent leaks. Is this usage normal for the season? Keep it witty.

Usage Data:
${JSON.stringify(formattedData, null, 2)}

Please provide:
1. A brief analysis of the usage patterns
2. Whether this is normal for the San Antonio area and current season
3. Any potential concerns or red flags (like possible leaks)
4. Tips to optimize usage

Keep your response conversational, witty, and under 300 words.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const analysis = response.text();

        return {
            success: true,
            analysis,
            usageDataPoints: usageData.length,
        };
    } catch (error: any) {
        console.error('Error auditing utility usage:', error);
        return {
            success: false,
            error: error.message || 'Failed to audit utility usage',
        };
    }
}

/**
 * Explain how a payment was settled via blockchain
 * Takes a transaction hash and provides a user-friendly explanation
 */
export async function explainSettlement(txHash: string) {
    try {
        // Get the generative model
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `Explain to the user how their payment was settled via blockchain using this hash: ${txHash}. Keep it simple and reassuring.

Please explain:
1. What the transaction hash represents
2. How blockchain makes the payment secure and transparent
3. Why this is better than traditional payment methods
4. That their payment is confirmed and immutable

Keep the explanation simple, reassuring, and suitable for someone who may not be familiar with blockchain technology. Use around 150-200 words.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const explanation = response.text();

        return {
            success: true,
            explanation,
            txHash,
        };
    } catch (error: any) {
        console.error('Error explaining settlement:', error);
        return {
            success: false,
            error: error.message || 'Failed to explain settlement',
        };
    }
}
