# 🍽️ Budget Bites

> **Your week of meals, planned to the rupee.**

Budget Bites is a browser-based meal planning and grocery budgeting application that creates personalised meal plans based on a user's body metrics, fitness goal, dietary preferences, allergies, cooking experience, available time, household size, planning duration, and grocery budget.

The application combines nutrition calculations, recipe eligibility, ingredient reuse, grocery pack pricing, brand tiers, and shopping recommendations to build a practical meal plan that fits the user's requirements and budget.

---

## ✨ Features

### 🧮 Personalised Nutrition Planning

Budget Bites calculates nutrition targets from:

- Age
- Height
- Weight
- Fitness goal
- Number of people

It calculates:

- Daily calorie target
- Protein target
- Carbohydrate target
- Fat target
- TDEE
- BMI and BMI category

The planning engine uses a Mifflin-St Jeor based calculation with a sex-neutral constant because the application does not collect sex information.

---

### 🥗 Dietary & Allergy Filtering

Users can select:

- Cuisine
- Dietary preference
- Allergies
- Fitness goal

Supported dietary preferences include:

- Vegan
- Vegetarian
- Egg-based
- Non-vegetarian

The planner filters recipes according to dietary compatibility, allergies, cooking skill, available cooking time, and cuisine preferences.

If a selected cuisine does not have enough suitable recipes for a meal slot, Budget Bites can borrow recipes from the wider recipe library instead of leaving the meal slot empty.

---

### 🍳 Smart Meal Planning

The application generates multi-day meal plans containing:

- Breakfast
- Lunch
- Dinner
- Optional snack

The planner considers:

- Calorie requirements
- Protein requirements
- Recipe cost
- Ingredient reuse
- Cuisine preference
- Recipe variety
- Cooking time
- Cooking skill
- Protein-source rotation

The system also discourages repeating the same dish within a short period.

---

### 💰 Grocery Budget Optimisation

Budget Bites does not simply estimate the cost of individual ingredients.

It calculates grocery requirements using actual package sizes and brand tiers.

The application can:

- Aggregate ingredients across the complete meal plan
- Round quantities up to purchasable pack sizes
- Calculate the number of packs required
- Calculate grocery cost
- Separate pantry staples from weekly purchases
- Compare different brand tiers
- Automatically move to a cheaper tier when necessary

The planner attempts increasing levels of cost pressure until it finds a plan that best fits the user's budget.

---

### 🛒 Grocery List

The generated grocery list contains:

- Ingredient
- Required quantity
- Pack quantity
- Number of packs
- Brand
- Cost
- Aisle/category
- Number of meals using the ingredient

Ingredients are sorted by cost so that users can immediately see the biggest contributors to their grocery bill.

---

### ♻️ Ingredient Reuse

Budget Bites intentionally encourages ingredient reuse.

For example, ingredients appearing in multiple meals are given preference during meal-plan generation.

This helps:

- Reduce grocery costs
- Reduce food waste
- Simplify shopping
- Make meal preparation easier

---

### 🏷️ Brand Tier Comparison

The application supports multiple grocery brand tiers:

- Value
- Popular
- Premium

Users can compare how the same meal plan changes in price depending on the selected brand tier.

If the selected tier exceeds the user's budget, Budget Bites can automatically switch to a cheaper tier and explain the change.

---

### 🛍️ Shopping Platform Comparison

The application estimates the final basket price across supported grocery platforms.

It considers:

- Basket multiplier
- Delivery charges
- Platform fees
- Free-delivery thresholds

The platforms are then sorted by estimated total cost.

---

### 📅 Shopping Recommendations

Budget Bites generates practical shopping advice such as:

- Whether one or multiple shopping trips are better
- Which ingredients should be purchased in bulk
- Which ingredients contribute most to the bill
- Pantry items that are one-time purchases
- Storage recommendations
- Ways to reduce an over-budget plan

For plans longer than seven days, the application recommends splitting grocery shopping into multiple trips so fresh produce and dairy do not have to be purchased too far in advance.

---

### 🔐 Local Accounts

Budget Bites includes a local account/profile system.

Users can:

- Create an account
- Sign in
- Sign out
- Stay signed in
- Save their meal-planning profile
- Restore their previous profile

Passwords are not stored in plaintext.

The application uses:

- Random salts
- PBKDF2
- SHA-256
- 150,000 iterations

### ⚠️ Important Security Note

This is **not real server-side authentication**.

Budget Bites is a static browser application and stores account information in the browser's `localStorage`.

Therefore:

- There is no backend authentication server
- The account system should not be considered secure authentication
- Users should not reuse important passwords
- Anyone with access to the device/browser can potentially bypass the login screen

The account system is primarily intended to keep different household profiles separate on the same browser.

---

## 🧭 User Flow

Budget Bites uses a four-step planning wizard.

### Step 1 — Who Is Eating?

Users enter:

- Age
- Height
- Weight
- Fitness goal
- Number of consumers

### Step 2 — Your Plate

Users select:

- Cuisine
- Dietary preference
- Allergies

### Step 3 — Your Kitchen

Users select:

- Cooking experience
- Available cooking time per meal

### Step 4 — The Shop

Users choose:

- Planning duration
- Grocery budget

The application then generates the complete meal and grocery plan.

---

## 🍲 Recipe Details

Every generated recipe can be opened in a recipe popup.

The recipe view includes:

- Cuisine
- Preparation time
- Cooking time
- Required skill level
- Dietary category
- Calories
- Protein
- Carbohydrates
- Fat
- Ingredients
- Ingredient quantities
- Allergens
- Cooking method
- Recipe tips

Ingredient quantities are automatically scaled according to household size and meal serving factors.

---

## 🏗️ Application Architecture

Budget Bites is divided into three major layers:

```text
┌──────────────────────────────┐
│          USER INTERFACE      │
│                              │
│  4-Step Wizard               │
│  Results                     │
│  Grocery List                │
│  Recipe Popup                │
│  Account UI                  │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│       PLANNING ENGINE        │
│                              │
│  Nutrition Targets           │
│  Recipe Eligibility          │
│  Meal Scheduling             │
│  Cost Optimisation           │
│  Brand Tiers                 │
│  Platform Pricing            │
│  Shopping Recommendations    │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│           DATA               │
│                              │
│  Recipes                     │
│  Ingredients                 │
│  Cuisines                    │
│  Diets                       │
│  Brand Information           │
│  Grocery Platforms           │
└──────────────────────────────┘
