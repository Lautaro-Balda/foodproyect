#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();

async function seedIngredients(ingredientNames) {
  if (!ingredientNames || ingredientNames.length === 0) {
    console.log('Usage: npm run seed -- ingredient1 ingredient2 ...');
    console.log('Example: npm run seed -- tomate cebolla ajo');
    process.exit(0);
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY environment variable not set');
    process.exit(1);
  }

  console.log(`📝 Fetching nutrition data for: ${ingredientNames.join(', ')}`);

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a nutrition expert. Provide approximate nutritional data per 100g or 100ml for these ingredients: ${ingredientNames.join(', ')}

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response in case it includes markdown code blocks
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const nutritionData = JSON.parse(cleanedText);
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
