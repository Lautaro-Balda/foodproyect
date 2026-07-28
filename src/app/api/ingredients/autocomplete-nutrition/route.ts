import { Anthropic } from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

interface NutritionData {
  calorias100: number | null;
  proteinas100: number | null;
  carbohidratos100: number | null;
  grasas100: number | null;
  fibra100: number | null;
}

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'No ingredients provided' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const ingredientNames = ingredients
      .map((ing: string | { name: string }) => typeof ing === 'string' ? ing : ing.name)
      .join(', ');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are a nutrition expert. Provide approximate nutritional data per 100g or 100ml for these ingredients: ${ingredientNames}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "<ingredient_name>": {
    "calorias100": <number or null>,
    "proteinas100": <number or null>,
    "carbohidratos100": <number or null>,
    "grasas100": <number or null>,
    "fibra100": <number or null>
  }
}

Use null for any values you cannot estimate with reasonable confidence. All numeric values should be in grams for macronutrients and kcal for calories.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const nutritionData = JSON.parse(content.text);

    return NextResponse.json(nutritionData);
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nutrition data from AI' },
      { status: 500 }
    );
  }
}
