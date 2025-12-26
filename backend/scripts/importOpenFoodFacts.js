const axios = require('axios');
const fs = require('fs');
const zlib = require('zlib');
const readline = require('readline');
const path = require('path');
const { pipeline } = require('stream/promises');
const db = require('../src/config/database');

const CSV_GZ_URL = 'https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz';
const TEMP_GZ_FILE = path.join(__dirname, 'temp_openfoodfacts.csv.gz');
const TEMP_CSV_FILE = path.join(__dirname, 'temp_openfoodfacts.csv');

// Categories to include (basic ingredients only)
const ALLOWED_CATEGORIES = [
  'viandes', 'poissons', 'fruits', 'légumes', 'produits-laitiers',
  'fromages', 'oeufs', 'céréales', 'légumineuses', 'noix', 'graines',
  'huiles', 'épices', 'condiments', 'farines', 'riz', 'pâtes', 'pain',
  'vegetables', 'fruits', 'meats', 'fish', 'dairy', 'eggs', 'grains',
  'legumes', 'nuts', 'seeds', 'oils', 'spices', 'en:fresh', 'en:raw',
  'en:vegetables', 'en:fruits', 'en:meats', 'en:fish', 'en:seafood'
];

// Words to exclude (prepared/processed products)
const EXCLUDE_KEYWORDS = [
  'pizza', 'burger', 'sandwich', 'plat', 'préparé', 'surgelé',
  'conserve', 'sauce', 'prepared', 'frozen', 'canned', 'ready',
  'meal', 'dish', 'snack', 'dessert', 'gâteau', 'cake', 'biscuit',
  'cookie', 'chocolat', 'chocolate', 'bonbon', 'candy', 'soda',
  'jus de fruits', 'juice', 'boisson', 'drink', 'beverage', 'bar',
  'cereal', 'céréales petit déjeuner', 'breakfast', 'soup', 'soupe'
];

async function downloadFile(url, dest) {
  console.log(`📥 Downloading ${url}...`);
  console.log('⚠️  This will take 5-10 minutes (~900 MB)...\n');
  
  const writer = fs.createWriteStream(dest);
  
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
    headers: {
      'User-Agent': 'Atlas-Core/1.0 (https://github.com/LuluLePerdu/Atlas-Core)'
    },
    timeout: 600000 // 10 minutes
  });

  const total = parseInt(response.headers['content-length'], 10);
  let downloaded = 0;
  let lastPercent = 0;

  response.data.on('data', (chunk) => {
    downloaded += chunk.length;
    const percent = Math.floor((downloaded / total) * 100);
    if (percent !== lastPercent && percent % 5 === 0) {
      const mb = Math.floor(downloaded / 1024 / 1024);
      const totalMb = Math.floor(total / 1024 / 1024);
      process.stdout.write(`\r   ${percent}% - ${mb}/${totalMb} MB downloaded...`);
      lastPercent = percent;
    }
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      console.log('\n✅ Download complete');
      resolve();
    });
    writer.on('error', reject);
  });
}

async function decompressFile(gzFile, outputFile) {
  console.log('\n📦 Decompressing GZIP file...');
  console.log('⚠️  This will take 2-3 minutes...\n');
  
  const gunzip = zlib.createGunzip();
  const source = fs.createReadStream(gzFile);
  const destination = fs.createWriteStream(outputFile);

  let processed = 0;
  source.on('data', (chunk) => {
    processed += chunk.length;
    const mb = Math.floor(processed / 1024 / 1024);
    if (mb % 50 === 0 && mb > 0) {
      process.stdout.write(`\r   Processed ${mb} MB...`);
    }
  });

  await pipeline(source, gunzip, destination);
  console.log('\n✅ Decompression complete');
}

function isBasicIngredient(product) {
  const productName = product.product_name?.toLowerCase() || '';
  
  // Must have a name
  if (!productName || productName.length < 2) return false;
  
  // Must have nutritional data (will be checked later)
  return true;
}

function parseNutrientValue(value) {
  if (!value || value === '' || value === 'unknown') return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : Math.round(parsed * 10) / 10;
}

function categorizeFoodItem(categories) {
  const cats = categories?.toLowerCase() || '';
  
  if (cats.includes('viande') || cats.includes('meat') || cats.includes('poisson') || cats.includes('fish')) {
    return 'protein';
  }
  if (cats.includes('lait') || cats.includes('fromage') || cats.includes('dairy') || cats.includes('cheese') || cats.includes('yaourt') || cats.includes('yogurt')) {
    return 'dairy';
  }
  if (cats.includes('fruit')) {
    return 'fruit';
  }
  if (cats.includes('légume') || cats.includes('vegetable')) {
    return 'vegetable';
  }
  if (cats.includes('céréale') || cats.includes('grain') || cats.includes('riz') || cats.includes('rice') || cats.includes('pâte') || cats.includes('pasta')) {
    return 'grain';
  }
  if (cats.includes('légumineuse') || cats.includes('legume') || cats.includes('haricot') || cats.includes('bean') || cats.includes('lentille') || cats.includes('lentil')) {
    return 'legume';
  }
  if (cats.includes('noix') || cats.includes('nut') || cats.includes('graine') || cats.includes('seed')) {
    return 'nut';
  }
  if (cats.includes('huile') || cats.includes('oil')) {
    return 'oil';
  }
  if (cats.includes('épice') || cats.includes('spice') || cats.includes('condiment')) {
    return 'condiment';
  }
  
  return 'other';
}

async function parseCSV(filePath) {
  const ingredients = [];
  const seen = new Set();
  
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let headers = [];
    let lineCount = 0;
    let validCount = 0;

    rl.on('line', (line) => {
      lineCount++;
      
      if (lineCount === 1) {
        // Parse headers
        headers = line.split('\t');
        console.log(`📋 Found ${headers.length} columns`);
        return;
      }

      // Parse data row
      const values = line.split('\t');
      const product = {};
      
      headers.forEach((header, i) => {
        product[header] = values[i];
      });

      // Filter and extract
      if (isBasicIngredient(product)) {
        const name = product.product_name?.trim();
        const nameFr = product.product_name_fr?.trim() || name;
        const nameEn = product.product_name_en?.trim() || name;
        
        if (!name || name.length < 2) return;
        
        // Avoid duplicates
        const key = name.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);

        const calories = parseNutrientValue(product['energy-kcal_100g']);
        const protein = parseNutrientValue(product.proteins_100g);
        const carbs = parseNutrientValue(product.carbohydrates_100g);
        const fat = parseNutrientValue(product.fat_100g);

        // Only include if we have nutritional data
        if (calories !== null && protein !== null && carbs !== null && fat !== null) {
          ingredients.push({
            name,
            name_fr: nameFr,
            name_en: nameEn,
            calories_per_100g: calories,
            protein_per_100g: protein,
            carbs_per_100g: carbs,
            fat_per_100g: fat,
            category: categorizeFoodItem(product.categories),
            source: 'OpenFoodFacts',
            user_id: null // Public ingredient
          });
          
          validCount++;
          
          if (validCount % 500 === 0) {
            process.stdout.write(`\r✅ Found ${validCount} valid ingredients...`);
          }
        }
      }
      
      // Progress indicator
      if (lineCount % 100000 === 0) {
        console.log(`\n   Processed ${lineCount.toLocaleString()} lines...`);
      }
    });

    rl.on('close', () => {
      console.log(`\n📊 Processed ${lineCount.toLocaleString()} lines, found ${validCount.toLocaleString()} valid ingredients`);
      resolve(ingredients);
    });

    rl.on('error', reject);
  });
}

async function importIngredients(ingredients) {
  console.log(`\n💾 Importing ${ingredients.length.toLocaleString()} ingredients into database...`);
  
  // Import in batches to avoid memory issues
  const batchSize = 500;
  let imported = 0;
  
  for (let i = 0; i < ingredients.length; i += batchSize) {
    const batch = ingredients.slice(i, i + batchSize);
    
    try {
      await db('ingredients')
        .insert(batch)
        .onConflict(['name', 'source'])
        .ignore();
      
      imported += batch.length;
      process.stdout.write(`\r   ${imported.toLocaleString()}/${ingredients.length.toLocaleString()} imported...`);
    } catch (error) {
      console.error(`\n❌ Error importing batch ${i}-${i + batchSize}:`, error.message);
    }
  }
  
  console.log(`\n✅ Import complete!`);
}

async function main() {
  try {
    console.log('🚀 Starting Open Food Facts import...\n');
    
    // Step 1: Download GZIP CSV
    if (!fs.existsSync(TEMP_GZ_FILE)) {
      await downloadFile(CSV_GZ_URL, TEMP_GZ_FILE);
    } else {
      console.log('📁 Using existing GZIP file');
    }
    
    // Step 2: Decompress
    if (!fs.existsSync(TEMP_CSV_FILE)) {
      await decompressFile(TEMP_GZ_FILE, TEMP_CSV_FILE);
    } else {
      console.log('\n📁 Using existing CSV file');
    }
    
    // Step 3: Parse CSV
    console.log('\n📖 Parsing CSV file (this will take 10-15 minutes)...\n');
    const ingredients = await parseCSV(TEMP_CSV_FILE);
    
    if (ingredients.length === 0) {
      console.log('⚠️  No valid ingredients found');
      return;
    }
    
    // Step 4: Import to database
    await importIngredients(ingredients);
    
    // Step 5: Cleanup
    console.log('\n🧹 Cleaning up temporary files...');
    if (fs.existsSync(TEMP_GZ_FILE)) fs.unlinkSync(TEMP_GZ_FILE);
    if (fs.existsSync(TEMP_CSV_FILE)) fs.unlinkSync(TEMP_CSV_FILE);
    
    // Step 6: Stats
    const total = await db('ingredients').count('* as count').first();
    console.log(`\n📊 Database now contains ${parseInt(total.count).toLocaleString()} ingredients`);
    
    console.log('\n✨ Import completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
