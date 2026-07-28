#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const ingredientsFile = path.join(process.cwd(), 'ingredients.txt');

async function fetchNutritionData(ingredients) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  const prompt = `You are a nutrition expert. Provide approximate nutritional data per 100g or 100ml for these ingredients: ${ingredients.join(', ')}

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

  const message = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const textContent = message.choices[0].message.content;
  if (!textContent) {
    throw new Error('No content in response from Groq');
  }

  // Clean up the response in case it includes markdown code blocks
  let cleanedText = textContent.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(cleanedText);
}

async function seedIngredients() {
  if (!fs.existsSync(ingredientsFile)) {
    console.log('📄 File not found: ingredients.txt');
    console.log('');
    console.log('📝 Usage:');
    console.log('   1. Create ingredients.txt in the project root (one ingredient per line)');
    console.log('');
    console.log('📋 Example ingredients.txt:');
    console.log('   carne vacuna');
    console.log('   morron rojo');
    console.log('   leche entera');
    console.log('   tomate cherry');
    console.log('   cebolla blanca');
    console.log('');
    console.log('   npm run seed');
    process.exit(0);
  }

  // Read and parse ingredients from file
  const fileContent = fs.readFileSync(ingredientsFile, 'utf-8');
  const allIngredients = fileContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#')); // Filter empty lines and comments

  if (allIngredients.length === 0) {
    console.log('❌ No ingredients found in ingredients.txt');
    process.exit(1);
  }

  console.log(`📝 Found ${allIngredients.length} ingredient(s) to process`);
  console.log('');

  const batchSize = 10;
  const totalBatches = Math.ceil(allIngredients.length / batchSize);
  let totalCreated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  try {
    // Process ingredients in batches of 10
    for (let i = 0; i < allIngredients.length; i += batchSize) {
      const batch = allIngredients.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      console.log(`🔄 Batch ${batchNumber}/${totalBatches}: Processing ${batch.length} ingredient(s)...`);

      try {
        const nutritionData = await fetchNutritionData(batch);
        console.log(`   ✅ Nutrition data received`);

        for (const ingredientName of batch) {
          try {
            const nutrition = nutritionData[ingredientName] || {};

            // Use upsert to update if exists, create if not
            const ingredient = await prisma.ingredient.upsert({
              where: { name: ingredientName },
              update: {
                calorias100: nutrition.calorias100 ?? null,
                proteinas100: nutrition.proteinas100 ?? null,
                carbohidratos100: nutrition.carbohidratos100 ?? null,
                grasas100: nutrition.grasas100 ?? null,
                fibra100: nutrition.fibra100 ?? null,
              },
              create: {
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

            console.log(`   ✓ ${ingredientName} (${nutrition.calorias100 || '?'} kcal)`);
            totalCreated++;
          } catch (error) {
            console.error(`   ✗ ${ingredientName}: ${error.message}`);
            totalFailed++;
          }
        }
      } catch (error) {
        console.error(`   ❌ Batch ${batchNumber} failed: ${error.message}`);
        for (const ingredientName of batch) {
          totalFailed++;
        }
      }

      console.log('');
    }

    console.log(`🎉 Operación completada:`);
    console.log(`   Total ingredientes: ${allIngredients.length}`);
    console.log(`   ✓ Procesados exitosamente: ${totalCreated}`);
    if (totalFailed > 0) {
      console.log(`   ✗ Con error: ${totalFailed}`);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedIngredients();
