# WeekFlow - Roadmap de développement

## 🎯 Vision
Une app tout-en-un pour planifier sa semaine en 10 minutes : workouts, repas, calendrier, épicerie et budget automatiquement connectés.

---

## ✅ Phase 1 : Fondations (COMPLÉTÉE)

### Backend
- [x] Architecture PostgreSQL + Express
- [x] Authentification JWT avec persist
- [x] Migrations et modèles DB complets
- [x] API REST pour toutes les ressources

### Frontend  
- [x] React + Zustand state management
- [x] i18n FR/EN complet
- [x] Responsive design avec TailwindCSS
- [x] Navigation et routing

### Modules de base
- [x] Dashboard avec overview
- [x] Authentification (login/register)
- [x] Gestion de compte (profil, mot de passe)
- [x] Système de templates de semaine

---

## ✅ Phase 2 : Modules principaux (COMPLÉTÉE)

### 💪 Workouts
- [x] CRUD workouts avec exercices (sets, reps, rest)
- [x] Types de programmes (strength, cardio, hiit, yoga)
- [x] Bibliothèque d'entraînements
- [ ] Association workout → calendrier automatique
- [ ] Suggestions de jours selon récupération
- [ ] Timer de repos entre séries
- [ ] Notes de progression après session

### 🍽️ Recettes & Meal Planning
- [x] CRUD recettes avec ingrédients
- [x] Macros par portion (calories, protéines, glucides, lipides)
- [x] Tags et filtres
- [x] Planificateur de semaine (meal plan)
- [ ] CRUD complet sur recettes existantes
- [ ] Drag & drop recette → jour du calendrier
- [ ] Estimation temps de préparation
- [ ] Instructions étape par étape avec timer
- [ ] Filtres : rapide, haute protéine, végé, batch cooking

### 🛒 Liste d'épicerie
- [x] Génération automatique depuis meal plan
- [x] Agrégation des ingrédients
- [x] Checkbox pour cocher items
- [x] Prix par item (avant taxes)
- [x] Calcul total dépensé
- [x] Création transaction budget automatique
- [ ] Regroupement par section (fruits/légumes, viandes, etc.)
- [ ] Historique des prix
- [ ] Mode édition (ajouter/retirer items manuellement)

### 💰 Budget
- [x] Catégories par défaut (Épicerie, Loyer, etc.)
- [x] Transactions income/expense
- [x] Summary mensuel (revenus, dépenses, balance)
- [x] Breakdown par catégorie
- [x] Intégration liste épicerie → transaction
- [ ] Budget mensuel par catégorie (limites)
- [ ] Visualisations (charts)
- [ ] Export CSV
- [ ] Transactions récurrentes (loyer auto)

### 📅 Calendrier
- [x] Vue hebdomadaire avec blocs
- [x] Création blocs manuels (type, horaire, couleur)
- [x] Templates save/apply
- [ ] **Vue avec emojis visuels (comme mockup)**
- [ ] **Drag & drop pour déplacer blocs**
- [ ] Vue jour/mois
- [ ] Crénaux libres automatiques
- [ ] Bloc "Meal Prep" auto-généré le dimanche

---

## 🚧 Phase 3 : Intelligence & Automation (EN COURS)

### 🔗 Connexions intelligentes
- [ ] **Sélectionner recettes → Auto-génère meal prep block**
- [ ] **Meal prep time estimé selon recettes choisies**
- [ ] **Workout planifié → Auto-créé dans calendrier**
- [ ] **Changement recette → Liste épicerie mise à jour instantanément**
- [ ] **Manquer workout → Suggestion de décalage**

### 🤖 Mode Autopilot
- [ ] Analyse des habitudes utilisateur
- [ ] Génération semaine complète automatique
- [ ] Suggestions de workouts selon récupération
- [ ] Optimisation meal prep (ingrédients communs)
- [ ] Ordre de préparation optimal

### 📊 Stats & Overview hebdomadaire
- [ ] **Résumé semaine actuelle (dashboard)**
  - Workouts planifiés (count)
  - Recettes différentes (count)
  - Temps meal prep total
  - Items épicerie (count)
  - Coût estimé épicerie
- [ ] Calories/protéines moyennes par jour
- [ ] Workouts complétés vs planifiés
- [ ] Temps meal prep réel vs estimé
- [ ] Coût moyen épicerie par semaine

---

## 🎨 Phase 4 : UX améliorée (À VENIR)

### Interface principale
- [ ] **Vue calendrier avec emojis** (comme mockup ASCII)
  ```
  │ LUN  MAR  MER  JEU  VEN  SAM  DIM      │
  │ 6h   ⏰   ⏰   ⏰   ⏰   ⏰   🛌   🛌     │
  │ 8h   📚   📚   📚   📚   📚   💪   🍳     │
  ```
- [ ] Drag & drop natif (react-beautiful-dnd)
- [ ] Mode "Quick Add" - ajout rapide depuis dashboard
- [ ] Notifications/rappels avant blocs
- [ ] Mode sombre

### Meal Planning avancé
- [ ] Vue repas par jour (3 colonnes : breakfast, lunch, dinner)
- [ ] Duplication de journée complète
- [ ] Swap rapide recettes
- [ ] Portions ajustables par jour
- [ ] Preview liste épicerie avant génération

### Templates intelligents
- [ ] Templates prédéfinis : "Semaine normale", "Focus gym", "Exams"
- [ ] Copier semaine passée en 1 clic
- [ ] Template "type de jour" (lundi type, mardi type)
- [ ] Partage de templates entre utilisateurs

---

## 🔮 Phase 5 : Features avancées (FUTUR)

### Social & Partage
- [ ] Partage de recettes publiques
- [ ] Communauté workout programs
- [ ] Challenges hebdomadaires
- [ ] Leaderboard friends

### Intégrations
- [ ] Export calendrier vers Google Calendar
- [ ] Import recettes depuis URL
- [ ] Scan code-barres pour prix épicerie
- [ ] Sync wearables (Apple Health, Fitbit)

### Mobile
- [ ] Progressive Web App (PWA)
- [ ] Notifications push
- [ ] Mode offline
- [ ] App native React Native

### AI & Recommandations
- [ ] Suggestions recettes selon ingrédients restants
- [ ] Génération recettes par AI
- [ ] Ajustement macros automatique selon objectifs
- [ ] Prédiction coût épicerie

---

## 🎯 Priorités immédiates (Next Sprint)

### 1. CRUD Recettes complet
- [ ] Modal édition recette (pre-fill form)
- [ ] Bouton supprimer avec confirmation
- [ ] Gestion d'erreurs

### 2. Association Recettes → Meal Plan simplifié
- [ ] Dropdown "Ajouter à la semaine" depuis liste recettes
- [ ] Sélection rapide jour + meal type (breakfast/lunch/dinner)
- [ ] Vue meal plan avec recettes assignées par jour

### 3. Bloc Meal Prep automatique
- [ ] Calcul temps total meal prep (sum prep_time + cook_time recettes)
- [ ] Auto-création bloc "🧑‍🍳 Meal Prep" le dimanche après-midi
- [ ] Affichage temps estimé dans bloc

### 4. Vue calendrier visuelle avec emojis
- [ ] Remplacer vue liste par grid horaire
- [ ] Emojis par type de bloc (💪 workout, 🍽️ meal, 📚 work)
- [ ] Couleurs par catégorie
- [ ] Horaires visibles (6h, 8h, 12h...)

### 5. Stats hebdomadaires dashboard
- [ ] Card "Cette semaine" sur dashboard
- [ ] Count workouts planifiés
- [ ] Count recettes différentes
- [ ] Temps meal prep estimé
- [ ] Items + coût épicerie

---

## 📝 Notes techniques

### Stack actuel
- **Backend**: Node.js + Express + PostgreSQL + Knex
- **Frontend**: React + Vite + Zustand + TailwindCSS
- **Auth**: JWT + localStorage persist
- **i18n**: Custom hook FR/EN

### Architecture clés
- Stores Zustand : authStore, mealStore, workoutStore, calendarStore, budgetStore
- Models backend : Recipe, MealPlan, Workout, CalendarBlock, GroceryList, Transaction, BudgetCategory
- Services : workoutService, calendarService, groceryGenerator, templateService

### Améliorations techniques futures
- [ ] Tests unitaires (Jest + React Testing Library)
- [ ] CI/CD pipeline
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Database indexes optimization
- [ ] API rate limiting
- [ ] WebSockets pour real-time updates

---

## 📊 Métriques de succès

### Adoption
- Temps planification semaine < 10 minutes
- Taux d'utilisation templates > 60%
- Génération liste épicerie utilisée > 80%

### Engagement
- Workouts complétés / planifiés > 70%
- Recettes réutilisées par semaine > 3
- Retour sur app > 3x par semaine

### Value
- Économie temps meal prep estimée
- Économie argent épicerie (budget tracking)
- Réduction food waste (portions calculées)

---

**Dernière mise à jour** : 25 décembre 2025
**Version actuelle** : 0.2.0-alpha
**Prochaine release** : 0.3.0 - Focus UX & Automation
