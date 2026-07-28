import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

interface NutritionData {
  calorias100: number | null;
  proteinas100: number | null;
  carbohidratos100: number | null;
  grasas100: number | null;
  fibra100: number | null;
}

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'No ingredients provided' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured' },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    const ingredientNames = ingredients
      .map((ing: string | { name: string }) => typeof ing === 'string' ? ing : ing.name)
      .join(', ');

    const prompt = `You are a nutrition expert. Provide approximate nutritional data per 100g or 100ml for these ingredients: ${ingredientNames}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text, no code blocks):
{
  "<ingredient_name>": {
    "calorias100": <number or null>,
    "proteinas100": <number or null>,
    "carbohidratos100": <number or null>,
    "grasas100": <number or null>,
    "fibra100": <number or null>
  }
}

Use null for any values you cannot estimate with reasonable confidence. All numeric values should be in grams for macronutrients and kcal for calories.`;

    const message = await client.messages.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Groq');
    }

    // Clean up the response in case it includes markdown code blocks
    let cleanedText = content.text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const nutritionData = JSON.parse(cleanedText);

    return NextResponse.json(nutritionData);
  } catch (error) {
    console.error('Error calling Groq API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nutrition data from AI' },
      { status: 500 }
    );
  }
}
