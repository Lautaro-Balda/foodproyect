#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { Anthropic } = require('@anthropic-ai/sdk');

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function seedIngredients(ingredientNames) {
  if (!ingredientNames || ingredientNames.length === 0) {
    console.log('Usage: npm run seed -- ingredient1 ingredient2 ...');
    console.log('Example: npm run seed -- tomate cebolla ajo');
    process.exit(0);
  }

  console.log(`📝 Fetching nutrition data for: ${ingredientNames.join(', ')}`);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are a nutrition expert. Provide approximate nutritional data per 100g or 100ml for these ingredients: ${ingredientNames.join(', ')}

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
    console.log('✅ Nutrition data received from AI');

    const createdIngredients = [];
    const skipped = [];

    for (const ingredientName of ingredientNames) {
      try {
        const nutrition = nutritionData[ingredientName] || {};

        const ingredient = await prisma.ingredient.create({
          data: {
            name: ingredientName,
            unit: 'G',
            quantity: 0,
            calorias100: nutrition.calorias100 ?? null,
            proteinas100: nutrition.proteinas100 ?? null,
            carbohidratos100: nutrition.carbohidratos100 ?? null,
            grasas100: nutrition.grasas100 ?? null,
            fibra100: nutrition.fibra100 ?? null,
          },
        });

        createdIngredients.push(ingredient);
        console.log(`  ✓ ${ingredientName} (${nutrition.calorias100 || '?'} kcal)`);
      } catch (error) {
        if (error.code === 'P2002') {
          skipped.push(ingredientName);
          console.log(`  ⊘ ${ingredientName} (ya existe)`);
        } else {
          console.error(`  ✗ ${ingredientName}: ${error.message}`);
        }
      }
    }

    console.log('');
    console.log(`🎉 Operación completada:`);
    console.log(`   Creados: ${createdIngredients.length}`);
    if (skipped.length > 0) {
      console.log(`   Omitidos (ya existían): ${skipped.length}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const args = process.argv.slice(2);
seedIngredients(args);
