exports.seed = async function(knex) {
  // Get demo user ID
  const demoUser = await knex('users').where({ email: 'demo@atlascore.com' }).first();
  const demoUserId = demoUser ? demoUser.id : null;

  // Common ingredients database (public - user_id is null)
  const ingredients = [
    // Proteins
    { name: 'Chicken breast', name_fr: 'Poitrine de poulet', name_en: 'Chicken breast', calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, category: 'protein' },
    { name: 'Beef', name_fr: 'Boeuf', name_en: 'Beef', calories_per_100g: 250, protein_per_100g: 26, carbs_per_100g: 0, fat_per_100g: 17, category: 'protein' },
    { name: 'Pork', name_fr: 'Porc', name_en: 'Pork', calories_per_100g: 242, protein_per_100g: 27, carbs_per_100g: 0, fat_per_100g: 14, category: 'protein' },
    { name: 'Salmon', name_fr: 'Saumon', name_en: 'Salmon', calories_per_100g: 208, protein_per_100g: 20, carbs_per_100g: 0, fat_per_100g: 13, category: 'protein' },
    { name: 'Tuna', name_fr: 'Thon', name_en: 'Tuna', calories_per_100g: 132, protein_per_100g: 28, carbs_per_100g: 0, fat_per_100g: 1, category: 'protein' },
    { name: 'Egg', name_fr: 'Oeuf', name_en: 'Egg', calories_per_100g: 155, protein_per_100g: 13, carbs_per_100g: 1.1, fat_per_100g: 11, category: 'protein' },
    { name: 'Tofu', name_fr: 'Tofu', name_en: 'Tofu', calories_per_100g: 76, protein_per_100g: 8, carbs_per_100g: 1.9, fat_per_100g: 4.8, category: 'protein' },
    { name: 'Turkey', name_fr: 'Dinde', name_en: 'Turkey', calories_per_100g: 135, protein_per_100g: 30, carbs_per_100g: 0, fat_per_100g: 1, category: 'protein' },
    { name: 'Shrimp', name_fr: 'Crevettes', name_en: 'Shrimp', calories_per_100g: 99, protein_per_100g: 24, carbs_per_100g: 0.2, fat_per_100g: 0.3, category: 'protein' },
    { name: 'Ground beef', name_fr: 'Boeuf haché', name_en: 'Ground beef', calories_per_100g: 332, protein_per_100g: 14, carbs_per_100g: 0, fat_per_100g: 30, category: 'protein' },

    // Dairy
    { name: 'Milk', name_fr: 'Lait', name_en: 'Milk', calories_per_100g: 42, protein_per_100g: 3.4, carbs_per_100g: 5, fat_per_100g: 1, category: 'dairy' },
    { name: 'Cheese', name_fr: 'Fromage', name_en: 'Cheese', calories_per_100g: 402, protein_per_100g: 25, carbs_per_100g: 1.3, fat_per_100g: 33, category: 'dairy' },
    { name: 'Yogurt', name_fr: 'Yogourt', name_en: 'Yogurt', calories_per_100g: 59, protein_per_100g: 10, carbs_per_100g: 3.6, fat_per_100g: 0.4, category: 'dairy' },
    { name: 'Butter', name_fr: 'Beurre', name_en: 'Butter', calories_per_100g: 717, protein_per_100g: 0.9, carbs_per_100g: 0.1, fat_per_100g: 81, category: 'dairy' },
    { name: 'Greek yogurt', name_fr: 'Yogourt grec', name_en: 'Greek yogurt', calories_per_100g: 97, protein_per_100g: 9, carbs_per_100g: 3.6, fat_per_100g: 5, category: 'dairy' },
    { name: 'Cottage cheese', name_fr: 'Fromage cottage', name_en: 'Cottage cheese', calories_per_100g: 98, protein_per_100g: 11, carbs_per_100g: 3.4, fat_per_100g: 4.3, category: 'dairy' },

    // Grains & Carbs
    { name: 'Rice', name_fr: 'Riz', name_en: 'Rice', calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3, category: 'grain' },
    { name: 'Pasta', name_fr: 'Pâtes', name_en: 'Pasta', calories_per_100g: 131, protein_per_100g: 5, carbs_per_100g: 25, fat_per_100g: 1.1, category: 'grain' },
    { name: 'Bread', name_fr: 'Pain', name_en: 'Bread', calories_per_100g: 265, protein_per_100g: 9, carbs_per_100g: 49, fat_per_100g: 3.2, category: 'grain' },
    { name: 'Oats', name_fr: 'Avoine', name_en: 'Oats', calories_per_100g: 389, protein_per_100g: 17, carbs_per_100g: 66, fat_per_100g: 6.9, category: 'grain' },
    { name: 'Quinoa', name_fr: 'Quinoa', name_en: 'Quinoa', calories_per_100g: 120, protein_per_100g: 4.4, carbs_per_100g: 21, fat_per_100g: 1.9, category: 'grain' },
    { name: 'Potato', name_fr: 'Pomme de terre', name_en: 'Potato', calories_per_100g: 77, protein_per_100g: 2, carbs_per_100g: 17, fat_per_100g: 0.1, category: 'grain' },
    { name: 'Sweet potato', name_fr: 'Patate douce', name_en: 'Sweet potato', calories_per_100g: 86, protein_per_100g: 1.6, carbs_per_100g: 20, fat_per_100g: 0.1, category: 'grain' },
    { name: 'Brown rice', name_fr: 'Riz brun', name_en: 'Brown rice', calories_per_100g: 111, protein_per_100g: 2.6, carbs_per_100g: 23, fat_per_100g: 0.9, category: 'grain' },
    { name: 'Whole wheat bread', name_fr: 'Pain de blé entier', name_en: 'Whole wheat bread', calories_per_100g: 247, protein_per_100g: 13, carbs_per_100g: 41, fat_per_100g: 3.4, category: 'grain' },
    { name: 'Couscous', name_fr: 'Couscous', name_en: 'Couscous', calories_per_100g: 112, protein_per_100g: 3.8, carbs_per_100g: 23, fat_per_100g: 0.2, category: 'grain' },

    // Vegetables
    { name: 'Broccoli', name_fr: 'Brocoli', name_en: 'Broccoli', calories_per_100g: 34, protein_per_100g: 2.8, carbs_per_100g: 7, fat_per_100g: 0.4, category: 'vegetable' },
    { name: 'Spinach', name_fr: 'Épinards', name_en: 'Spinach', calories_per_100g: 23, protein_per_100g: 2.9, carbs_per_100g: 3.6, fat_per_100g: 0.4, category: 'vegetable' },
    { name: 'Tomato', name_fr: 'Tomate', name_en: 'Tomato', calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fat_per_100g: 0.2, category: 'vegetable' },
    { name: 'Carrot', name_fr: 'Carotte', name_en: 'Carrot', calories_per_100g: 41, protein_per_100g: 0.9, carbs_per_100g: 10, fat_per_100g: 0.2, category: 'vegetable' },
    { name: 'Bell pepper', name_fr: 'Poivron', name_en: 'Bell pepper', calories_per_100g: 31, protein_per_100g: 1, carbs_per_100g: 6, fat_per_100g: 0.3, category: 'vegetable' },
    { name: 'Onion', name_fr: 'Oignon', name_en: 'Onion', calories_per_100g: 40, protein_per_100g: 1.1, carbs_per_100g: 9, fat_per_100g: 0.1, category: 'vegetable' },
    { name: 'Garlic', name_fr: 'Ail', name_en: 'Garlic', calories_per_100g: 149, protein_per_100g: 6.4, carbs_per_100g: 33, fat_per_100g: 0.5, category: 'vegetable' },
    { name: 'Cucumber', name_fr: 'Concombre', name_en: 'Cucumber', calories_per_100g: 15, protein_per_100g: 0.7, carbs_per_100g: 3.6, fat_per_100g: 0.1, category: 'vegetable' },
    { name: 'Lettuce', name_fr: 'Laitue', name_en: 'Lettuce', calories_per_100g: 15, protein_per_100g: 1.4, carbs_per_100g: 2.9, fat_per_100g: 0.2, category: 'vegetable' },
    { name: 'Zucchini', name_fr: 'Courgette', name_en: 'Zucchini', calories_per_100g: 17, protein_per_100g: 1.2, carbs_per_100g: 3.1, fat_per_100g: 0.3, category: 'vegetable' },
    { name: 'Cauliflower', name_fr: 'Chou-fleur', name_en: 'Cauliflower', calories_per_100g: 25, protein_per_100g: 1.9, carbs_per_100g: 5, fat_per_100g: 0.3, category: 'vegetable' },
    { name: 'Mushroom', name_fr: 'Champignon', name_en: 'Mushroom', calories_per_100g: 22, protein_per_100g: 3.1, carbs_per_100g: 3.3, fat_per_100g: 0.3, category: 'vegetable' },
    { name: 'Asparagus', name_fr: 'Asperge', name_en: 'Asparagus', calories_per_100g: 20, protein_per_100g: 2.2, carbs_per_100g: 3.9, fat_per_100g: 0.1, category: 'vegetable' },
    { name: 'Green beans', name_fr: 'Haricots verts', name_en: 'Green beans', calories_per_100g: 31, protein_per_100g: 1.8, carbs_per_100g: 7, fat_per_100g: 0.2, category: 'vegetable' },

    // Fruits
    { name: 'Apple', name_fr: 'Pomme', name_en: 'Apple', calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2, category: 'fruit' },
    { name: 'Banana', name_fr: 'Banane', name_en: 'Banana', calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 23, fat_per_100g: 0.3, category: 'fruit' },
    { name: 'Orange', name_fr: 'Orange', name_en: 'Orange', calories_per_100g: 47, protein_per_100g: 0.9, carbs_per_100g: 12, fat_per_100g: 0.1, category: 'fruit' },
    { name: 'Strawberry', name_fr: 'Fraise', name_en: 'Strawberry', calories_per_100g: 32, protein_per_100g: 0.7, carbs_per_100g: 7.7, fat_per_100g: 0.3, category: 'fruit' },
    { name: 'Blueberry', name_fr: 'Bleuet', name_en: 'Blueberry', calories_per_100g: 57, protein_per_100g: 0.7, carbs_per_100g: 14, fat_per_100g: 0.3, category: 'fruit' },
    { name: 'Avocado', name_fr: 'Avocat', name_en: 'Avocado', calories_per_100g: 160, protein_per_100g: 2, carbs_per_100g: 9, fat_per_100g: 15, category: 'fruit' },
    { name: 'Mango', name_fr: 'Mangue', name_en: 'Mango', calories_per_100g: 60, protein_per_100g: 0.8, carbs_per_100g: 15, fat_per_100g: 0.4, category: 'fruit' },
    { name: 'Pineapple', name_fr: 'Ananas', name_en: 'Pineapple', calories_per_100g: 50, protein_per_100g: 0.5, carbs_per_100g: 13, fat_per_100g: 0.1, category: 'fruit' },
    { name: 'Watermelon', name_fr: 'Melon d\'eau', name_en: 'Watermelon', calories_per_100g: 30, protein_per_100g: 0.6, carbs_per_100g: 8, fat_per_100g: 0.2, category: 'fruit' },
    { name: 'Grapes', name_fr: 'Raisins', name_en: 'Grapes', calories_per_100g: 69, protein_per_100g: 0.7, carbs_per_100g: 18, fat_per_100g: 0.2, category: 'fruit' },

    // Legumes
    { name: 'Chickpeas', name_fr: 'Pois chiches', name_en: 'Chickpeas', calories_per_100g: 164, protein_per_100g: 8.9, carbs_per_100g: 27, fat_per_100g: 2.6, category: 'legume' },
    { name: 'Lentils', name_fr: 'Lentilles', name_en: 'Lentils', calories_per_100g: 116, protein_per_100g: 9, carbs_per_100g: 20, fat_per_100g: 0.4, category: 'legume' },
    { name: 'Black beans', name_fr: 'Haricots noirs', name_en: 'Black beans', calories_per_100g: 132, protein_per_100g: 8.9, carbs_per_100g: 24, fat_per_100g: 0.5, category: 'legume' },
    { name: 'Kidney beans', name_fr: 'Haricots rouges', name_en: 'Kidney beans', calories_per_100g: 127, protein_per_100g: 8.7, carbs_per_100g: 23, fat_per_100g: 0.5, category: 'legume' },
    { name: 'Pinto beans', name_fr: 'Haricots pinto', name_en: 'Pinto beans', calories_per_100g: 143, protein_per_100g: 9, carbs_per_100g: 26, fat_per_100g: 0.7, category: 'legume' },

    // Nuts & Seeds
    { name: 'Almonds', name_fr: 'Amandes', name_en: 'Almonds', calories_per_100g: 579, protein_per_100g: 21, carbs_per_100g: 22, fat_per_100g: 50, category: 'nut' },
    { name: 'Walnuts', name_fr: 'Noix', name_en: 'Walnuts', calories_per_100g: 654, protein_per_100g: 15, carbs_per_100g: 14, fat_per_100g: 65, category: 'nut' },
    { name: 'Peanuts', name_fr: 'Arachides', name_en: 'Peanuts', calories_per_100g: 567, protein_per_100g: 26, carbs_per_100g: 16, fat_per_100g: 49, category: 'nut' },
    { name: 'Chia seeds', name_fr: 'Graines de chia', name_en: 'Chia seeds', calories_per_100g: 486, protein_per_100g: 17, carbs_per_100g: 42, fat_per_100g: 31, category: 'seed' },
    { name: 'Peanut butter', name_fr: 'Beurre d\'arachide', name_en: 'Peanut butter', calories_per_100g: 588, protein_per_100g: 25, carbs_per_100g: 20, fat_per_100g: 50, category: 'nut' },
    { name: 'Cashews', name_fr: 'Noix de cajou', name_en: 'Cashews', calories_per_100g: 553, protein_per_100g: 18, carbs_per_100g: 30, fat_per_100g: 44, category: 'nut' },

    // Oils & Fats
    { name: 'Olive oil', name_fr: 'Huile d\'olive', name_en: 'Olive oil', calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, category: 'oil' },
    { name: 'Coconut oil', name_fr: 'Huile de coco', name_en: 'Coconut oil', calories_per_100g: 862, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, category: 'oil' },
    { name: 'Vegetable oil', name_fr: 'Huile végétale', name_en: 'Vegetable oil', calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, category: 'oil' },

    // Sweeteners & Condiments
    { name: 'Sugar', name_fr: 'Sucre', name_en: 'Sugar', calories_per_100g: 387, protein_per_100g: 0, carbs_per_100g: 100, fat_per_100g: 0, category: 'sweetener' },
    { name: 'Honey', name_fr: 'Miel', name_en: 'Honey', calories_per_100g: 304, protein_per_100g: 0.3, carbs_per_100g: 82, fat_per_100g: 0, category: 'sweetener' },
    { name: 'Soy sauce', name_fr: 'Sauce soja', name_en: 'Soy sauce', calories_per_100g: 53, protein_per_100g: 10, carbs_per_100g: 4.9, fat_per_100g: 0, category: 'condiment' },
    { name: 'Ketchup', name_fr: 'Ketchup', name_en: 'Ketchup', calories_per_100g: 112, protein_per_100g: 1.2, carbs_per_100g: 27, fat_per_100g: 0.1, category: 'condiment' },
    { name: 'Mayonnaise', name_fr: 'Mayonnaise', name_en: 'Mayonnaise', calories_per_100g: 680, protein_per_100g: 1.2, carbs_per_100g: 0.6, fat_per_100g: 75, category: 'condiment' },
  ];

  // Insert ingredients
  await knex('ingredients').insert(ingredients.map(ing => ({
    ...ing,
    user_id: null, // Public ingredients
    source: 'local',
    created_at: new Date(),
    updated_at: new Date()
  })));

  console.log(`✅ Seeded ${ingredients.length} public ingredients`);
};
