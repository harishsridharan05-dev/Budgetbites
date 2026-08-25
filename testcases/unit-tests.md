# Budget Bites Unit Test Documentation

This document describes the unit-test cases for the planning engine in `app (1).js`.

## Plan generation

| ID | Function | Scenario | Expected result |
| --- | --- | --- | --- |
| PLAN-01 | `targets` | Calculate targets from age, height, weight, and goal | Returns bounded calories plus protein, carbohydrate, fat, TDEE, BMI, and BMI band |
| PLAN-02 | `eligible` | Apply cuisine, diet, allergy, skill, and time filters | Returns only recipes that satisfy every active constraint |
| PLAN-03 | `poolsFor` | Selected cuisine has too few recipes for a slot | Uses suitable recipes from the wider library and records the borrowed slot |
| PLAN-04 | `generate` | Generate a plan for multiple days and household members | Returns meals, nutrition factors, grocery lines, and a stable slot layout |
| PLAN-05 | `generate` | No recipes satisfy the selected constraints | Returns a plan error identifying the unavailable meal slots |

## Grocery totals

| ID | Function | Scenario | Expected result |
| --- | --- | --- | --- |
| GROC-01 | `aggregate` | Ingredients occur across several meals and days | Combines ingredient quantities and records all meals using each ingredient |
| GROC-02 | `aggregate` | Required quantity is below one purchasable pack | Charges for one pack and reports the pack quantity |
| GROC-03 | `aggregate` | Pantry ingredient is included in the plan | Marks the line as pantry while retaining its calculated cost |
| GROC-04 | `aggregate` | Household size or day factors change | Scales required quantities before rounding up to packs |
| GROC-05 | `generate` | Popular tier exceeds the grocery budget | Tries cheaper brand tiers and reports the selected tier and budget status |

## Shopping recommendations

| ID | Function | Scenario | Expected result |
| --- | --- | --- | --- |
| SHOP-01 | `shoppingRecs` | Plan is seven days or shorter | Recommends one shopping trip and prioritises the highest-cost items |
| SHOP-02 | `shoppingRecs` | Plan is longer than seven days | Recommends multiple trips and separates fresh items from pantry staples |
| SHOP-03 | `shoppingRecs` | Basket is over budget | Includes practical cost-reduction advice and identifies major cost contributors |
| SHOP-04 | `shoppingRecs` | Pantry items are hidden from the weekly list | Keeps pantry costs in the total while excluding them from weekly purchase guidance |

## Wizard validation

| ID | Function | Scenario | Expected result |
| --- | --- | --- | --- |
| VAL-01 | `validate` | Age, height, or weight is missing or outside its allowed range | Returns the matching field-specific error message |
| VAL-02 | `validate` | Fitness goal, dietary preference, or cooking experience is missing | Returns a prompt for the missing required selection |
| VAL-03 | `validate` | Current wizard step is valid | Returns `null` and allows the user to continue |
| VAL-04 | `validate` | User clicks a future progress step with invalid input | Keeps the current step and displays the returned error |

## Manual execution note

The functions are defined in the browser application and depend on the recipe and ingredient tables from `data (1).js`. Run the application in a browser, exercise each case with the wizard, and compare the displayed plan, grocery totals, and error text with the expected results above.
