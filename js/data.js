/* ==========================================================================
   Budget Bites — Data Layer
   --------------------------------------------------------------------------
   Everything the planner reads and nothing it does. Two halves:

     1. PANTRY   ingredients, nutrition, brand catalogue, delivery platforms,
                 cuisines, diets, allergens, goals and skill levels.
     2. RECIPES  the recipe library, with per-serving quantities and method.

   Loaded before planner logic, because the recipe list derives its allergens,
   macros and protein source from the ingredient tables defined here.
   ========================================================================== */


const AISLES = ['Fresh produce', 'Grains & flour', 'Dal & pulses',
                'Dairy & protein', 'Spices', 'Oils & pantry'];

/* --------------------------------------------------------------------------
   Ingredients
   n = display name · a = aisle · u = unit (g / ml / pc)
   pack/p are filled in from the 'popular' brand once BR is defined.
   al = allergens · pantry = a one-time staple, not a weekly cost
   -------------------------------------------------------------------------- */
const I = (n, a, u, al, pantry) => ({ n, a, u, al: al || [], pantry: !!pantry });

const ING = {
  /* ---- Grains & flour ---- */
  rice:      I('Rice',                  'Grains & flour', 'g'),
  atta:      I('Wheat flour (atta)',    'Grains & flour', 'g', ['gluten']),
  maida:     I('Refined flour (maida)', 'Grains & flour', 'g', ['gluten']),
  oats:      I('Rolled oats',           'Grains & flour', 'g', ['gluten']),
  poha:      I('Poha',                  'Grains & flour', 'g'),
  rava:      I('Rava (semolina)',       'Grains & flour', 'g', ['gluten']),
  besan:     I('Besan',                 'Grains & flour', 'g'),
  batter:    I('Idli/dosa batter',      'Grains & flour', 'g'),
  pasta:     I('Pasta',                 'Grains & flour', 'g', ['gluten']),
  noodles:   I('Noodles',               'Grains & flour', 'g', ['gluten']),
  bread:     I('Bread',                 'Grains & flour', 'pc', ['gluten']),
  vermicelli:I('Vermicelli',            'Grains & flour', 'g', ['gluten']),

  /* ---- Dal & pulses ---- */
  toor:      I('Toor dal',        'Dal & pulses', 'g'),
  moong:     I('Moong dal',       'Dal & pulses', 'g'),
  urad:      I('Urad dal',        'Dal & pulses', 'g'),
  chana:     I('Chana dal',       'Dal & pulses', 'g'),
  rajma:     I('Rajma',           'Dal & pulses', 'g'),
  chickpea:  I('Kabuli chana',    'Dal & pulses', 'g'),
  sprouts:   I('Sprouted moong',  'Dal & pulses', 'g'),
  roastchana:I('Roasted chana',   'Dal & pulses', 'g'),

  /* ---- Fresh produce ---- */
  onion:     I('Onion',           'Fresh produce', 'g'),
  tomato:    I('Tomato',          'Fresh produce', 'g'),
  potato:    I('Potato',          'Fresh produce', 'g'),
  carrot:    I('Carrot',          'Fresh produce', 'g'),
  beans:     I('French beans',    'Fresh produce', 'g'),
  spinach:   I('Palak',           'Fresh produce', 'g'),
  cabbage:   I('Cabbage',         'Fresh produce', 'g'),
  capsicum:  I('Capsicum',        'Fresh produce', 'g'),
  cauli:     I('Cauliflower',     'Fresh produce', 'g'),
  peas:      I('Green peas',      'Fresh produce', 'g'),
  brinjal:   I('Brinjal',         'Fresh produce', 'g'),
  okra:      I('Ladies finger',   'Fresh produce', 'g'),
  pumpkin:   I('Pumpkin',         'Fresh produce', 'g'),
  mushroom:  I('Mushroom',        'Fresh produce', 'g'),
  babycorn:  I('Baby corn',       'Fresh produce', 'g'),
  broccoli:  I('Broccoli',        'Fresh produce', 'g'),
  cucumber:  I('Cucumber',        'Fresh produce', 'g'),
  beetroot:  I('Beetroot',        'Fresh produce', 'g'),
  springonion:I('Spring onion',   'Fresh produce', 'g'),
  coconut:   I('Grated coconut',  'Fresh produce', 'g'),
  banana:    I('Banana',          'Fresh produce', 'pc'),
  apple:     I('Apple',           'Fresh produce', 'pc'),
  lemon:     I('Lemon',           'Fresh produce', 'pc'),
  gg:        I('Ginger-garlic paste','Fresh produce','g'),
  chilli:    I('Green chilli',    'Fresh produce', 'g'),
  curryleaf: I('Curry leaves',    'Fresh produce', 'g'),
  coriander: I('Coriander',       'Fresh produce', 'g'),
  mint:      I('Mint',            'Fresh produce', 'g'),

  /* ---- Dairy & protein ---- */
  milk:      I('Milk',            'Dairy & protein', 'ml', ['dairy']),
  curd:      I('Curd',            'Dairy & protein', 'g',  ['dairy']),
  paneer:    I('Paneer',          'Dairy & protein', 'g',  ['dairy']),
  cheese:    I('Cheese',          'Dairy & protein', 'g',  ['dairy']),
  butter:    I('Butter',          'Dairy & protein', 'g',  ['dairy']),
  cream:     I('Fresh cream',     'Dairy & protein', 'ml', ['dairy']),
  ghee:      I('Ghee',            'Dairy & protein', 'g',  ['dairy'], true),
  egg:       I('Eggs',            'Dairy & protein', 'pc', ['egg']),
  chicken:   I('Chicken',         'Dairy & protein', 'g'),
  fish:      I('Fish',            'Dairy & protein', 'g',  ['fish']),
  prawns:    I('Prawns',          'Dairy & protein', 'g',  ['fish']),
  tofu:      I('Tofu',            'Dairy & protein', 'g',  ['soy']),
  soyachunk: I('Soya chunks',     'Dairy & protein', 'g',  ['soy']),
  soyagran:  I('Soya granules',   'Dairy & protein', 'g',  ['soy']),
  peanut:    I('Groundnut',       'Dairy & protein', 'g',  ['peanut']),
  cashew:    I('Cashew',          'Dairy & protein', 'g',  ['nuts']),
  almond:    I('Almonds',         'Dairy & protein', 'g',  ['nuts']),

  /* ---- Spices (all pantry staples) ---- */
  salt:      I('Salt',            'Spices', 'g', [], true),
  sugar:     I('Sugar',           'Spices', 'g', [], true),
  jaggery:   I('Jaggery',         'Spices', 'g', [], true),
  mustard:   I('Mustard seeds',   'Spices', 'g', [], true),
  cumin:     I('Jeera',           'Spices', 'g', [], true),
  turmeric:  I('Turmeric powder', 'Spices', 'g', [], true),
  chpowder:  I('Chilli powder',   'Spices', 'g', [], true),
  corpowder: I('Coriander powder','Spices', 'g', [], true),
  garam:     I('Garam masala',    'Spices', 'g', [], true),
  sambarpwd: I('Sambar powder',   'Spices', 'g', [], true),
  pepper:    I('Black pepper',    'Spices', 'g', [], true),
  chaat:     I('Chaat masala',    'Spices', 'g', [], true),
  methi:     I('Kasuri methi',    'Spices', 'g', [], true),
  hing:      I('Asafoetida',      'Spices', 'g', [], true),
  oregano:   I('Mixed herbs',     'Spices', 'g', [], true),
  tamarind:  I('Tamarind',        'Spices', 'g', [], true),
  sesame:    I('Sesame seeds',    'Spices', 'g', ['sesame'], true),

  /* ---- Oils & pantry ---- */
  oil:       I('Cooking oil',     'Oils & pantry', 'ml', [], true),
  soy:       I('Soy sauce',       'Oils & pantry', 'ml', ['soy', 'gluten'], true),
  vinegar:   I('Vinegar',         'Oils & pantry', 'ml', [], true),
  ketchup:   I('Tomato ketchup',  'Oils & pantry', 'g',  [], true),
  chillisauce:I('Red chilli sauce','Oils & pantry','ml', [], true),
  honey:     I('Honey',           'Oils & pantry', 'g',  [], true),
  cornflour: I('Corn flour',      'Oils & pantry', 'g',  [], true),
  pastasauce:I('Pasta sauce',     'Oils & pantry', 'g',  [], true)
};

/* --------------------------------------------------------------------------
   Nutrition — per 100 g / 100 ml, or PER PIECE for `pc` ingredients.
   [kcal, protein g, carbohydrate g, fat g]

   Recipe macros are DERIVED from these values, never hand-written. That is the
   only way a dish's protein figure can be trusted: if there is no protein
   source in the ingredient list, the number comes out low, as it should.
   Values are standard raw/uncooked composition figures.
   -------------------------------------------------------------------------- */
const NUTRI = {
  /* grains & flour */
  rice:[360,6.8,78,0.6], atta:[340,12,71,1.7], maida:[350,10,76,1],
  oats:[380,13,67,7], poha:[350,7,77,1], rava:[360,12,73,1],
  besan:[387,22,58,7], batter:[150,5,30,0.5], pasta:[360,12,72,1.5],
  noodles:[380,10,75,5], bread:[70,2.6,13,0.9], vermicelli:[360,11,74,1],

  /* dal & pulses (dry weight) */
  toor:[340,22,63,1.5], moong:[350,24,63,1.2], urad:[340,25,59,1.6],
  chana:[360,20,60,5], rajma:[330,24,60,1], chickpea:[360,19,61,6],
  sprouts:[100,7,15,0.5], roastchana:[370,22,58,5],

  /* fresh produce */
  onion:[40,1.1,9,0.1], tomato:[18,0.9,3.9,0.2], potato:[77,2,17,0.1],
  carrot:[41,0.9,10,0.2], beans:[31,1.8,7,0.1], spinach:[23,2.9,3.6,0.4],
  cabbage:[25,1.3,6,0.1], capsicum:[26,1,6,0.2], cauli:[25,1.9,5,0.3],
  peas:[81,5.4,14,0.4], brinjal:[25,1,6,0.2], okra:[33,1.9,7,0.2],
  pumpkin:[26,1,6.5,0.1], mushroom:[22,3.1,3.3,0.3], babycorn:[26,2,5,0.3],
  broccoli:[34,2.8,7,0.4], cucumber:[15,0.7,3.6,0.1], beetroot:[43,1.6,10,0.2],
  springonion:[32,1.8,7,0.2], coconut:[354,3.3,15,33],
  banana:[105,1.3,27,0.4], apple:[95,0.5,25,0.3], lemon:[17,0.6,5,0.2],
  gg:[100,4,20,0.6], chilli:[40,2,9,0.4], curryleaf:[100,6,19,1],
  coriander:[23,2.1,3.7,0.5], mint:[44,3.8,8,0.7],

  /* dairy & protein */
  milk:[58,3.2,4.7,3], curd:[60,3.5,4.7,3], paneer:[265,18,3.5,20],
  cheese:[320,20,2,25], butter:[717,0.9,0.1,81], cream:[195,2.5,3,20],
  ghee:[900,0,0,100], egg:[72,6.3,0.4,5],
  chicken:[165,22,0,8], fish:[105,20,0,2.5], prawns:[99,20,0.9,1.7],
  tofu:[145,15,3,8], soyachunk:[345,52,33,0.5], soyagran:[345,52,33,0.5],
  peanut:[567,26,16,49], cashew:[553,18,30,44],
  almond:[579,21,22,50],

  /* spices */
  salt:[0,0,0,0], sugar:[400,0,100,0], jaggery:[383,0.4,98,0.1],
  mustard:[508,26,28,36], cumin:[375,18,44,22], turmeric:[354,8,65,10],
  chpowder:[282,12,50,14], corpowder:[298,12,55,18], garam:[380,14,45,15],
  sambarpwd:[330,15,45,10], pepper:[251,10,64,3], chaat:[280,10,45,5],
  methi:[323,23,58,6], hing:[297,4,68,1], oregano:[265,9,69,4],
  tamarind:[239,2.8,63,0.6], sesame:[573,17,23,50],

  /* oils & pantry */
  oil:[900,0,0,100], soy:[60,8,6,0], vinegar:[20,0,1,0],
  ketchup:[100,1.5,24,0.2], chillisauce:[90,1,20,0.5], honey:[304,0.3,82,0],
  cornflour:[380,0.3,91,0.1], pastasauce:[70,2,12,1.5]
};

Object.keys(ING).forEach(k => {
  if (!NUTRI[k]) console.error(`Ingredient "${k}" has no nutrition data`);
  ING[k].nut = NUTRI[k] || [0, 0, 0, 0];
});

/* --------------------------------------------------------------------------
   Brand catalogue — real Indian brands at three tiers.
   pack = purchasable size in base units · mrp = indicative shelf price (Rs)
   These are planning estimates, not live quotes. The platform links open a
   real search so the shopper can check today's number.
   -------------------------------------------------------------------------- */
const B = (n, pack, mrp, t) => ({ n, pack, mrp, t, p: mrp / pack });

const BR = {
  rice:      [B('Ponni rice, loose',1000,55,'value'),B('Daawat Rozana Super',1000,72,'popular'),B('India Gate Classic Basmati',1000,150,'premium')],
  atta:      [B('Chakki atta, loose',1000,42,'value'),B('Aashirvaad Shudh Chakki',1000,58,'popular'),B('Aashirvaad Multigrain',1000,82,'premium')],
  maida:     [B('Maida, loose',500,26,'value'),B('Pillsbury Maida',500,38,'popular')],
  oats:      [B('Oats, loose',500,55,'value'),B('Quaker Rolled Oats',500,80,'popular'),B("Bagrry's Rolled Oats",500,120,'premium')],
  poha:      [B('Poha, loose',500,28,'value'),B('Anil Poha',500,36,'popular')],
  rava:      [B('Rava, loose',500,26,'value'),B('Anil Bombay Rava',500,34,'popular'),B('Aashirvaad Rava',500,45,'premium')],
  besan:     [B('Besan, loose',500,45,'value'),B('Rajdhani Besan',500,58,'popular'),B('Tata Sampann Besan',500,72,'premium')],
  batter:    [B('Local mill batter',500,30,'value'),B('iD Fresh Idli Dosa Batter',500,45,'popular'),B('Milky Mist Batter',500,55,'premium')],
  pasta:     [B('Bambino Penne',500,75,'value'),B('Del Monte Penne',500,95,'popular'),B('Barilla Penne',500,180,'premium')],
  noodles:   [B("Ching's Hakka Noodles",280,45,'value'),B('Bambino Noodles',400,60,'popular')],
  bread:     [B('Local bakery loaf',20,45,'value'),B('Modern Sandwich Bread',20,60,'popular'),B('Britannia Brown Bread',20,70,'premium')],
  vermicelli:[B('Vermicelli, loose',500,38,'value'),B('Bambino Vermicelli',450,52,'popular')],

  toor:      [B('Toor dal, loose',500,62,'value'),B('Fortune Toor Dal',500,75,'popular'),B('Tata Sampann Unpolished Toor',500,95,'premium')],
  moong:     [B('Moong dal, loose',500,58,'value'),B('Tata Sampann Moong Dal',500,72,'popular')],
  urad:      [B('Urad dal, loose',500,68,'value'),B('Tata Sampann Urad Dal',500,85,'popular')],
  chana:     [B('Chana dal, loose',500,45,'value'),B('Tata Sampann Chana Dal',500,58,'popular')],
  rajma:     [B('Rajma, loose',500,68,'value'),B('Tata Sampann Rajma',500,85,'popular'),B('Organic Tattva Rajma',500,120,'premium')],
  chickpea:  [B('Kabuli chana, loose',500,55,'value'),B('Tata Sampann Kabuli Chana',500,72,'popular')],
  sprouts:   [B('Sprouted moong, loose',250,30,'value'),B('iD Fresh Sprouts',250,45,'popular')],
  roastchana:[B('Roasted chana, loose',250,38,'value'),B("Haldiram's Roasted Chana",200,45,'popular')],

  onion:     [B('Onion, loose',1000,35,'value'),B('Fresho Onion, packed',1000,48,'popular')],
  tomato:    [B('Tomato, loose',500,18,'value'),B('Fresho Tomato, packed',500,26,'popular')],
  potato:    [B('Potato, loose',1000,28,'value'),B('Fresho Potato, packed',1000,40,'popular')],
  carrot:    [B('Carrot, loose',250,14,'value'),B('Fresho Carrot, packed',250,20,'popular')],
  beans:     [B('Beans, loose',250,16,'value'),B('Fresho French Beans',250,24,'popular')],
  spinach:   [B('Palak bunch, market',250,12,'value'),B('Fresho Palak, packed',250,20,'popular')],
  cabbage:   [B('Cabbage, loose',500,16,'value'),B('Fresho Cabbage',500,24,'popular')],
  capsicum:  [B('Capsicum, loose',250,20,'value'),B('Fresho Capsicum',250,28,'popular')],
  cauli:     [B('Cauliflower, loose',500,22,'value'),B('Fresho Cauliflower',500,32,'popular')],
  peas:      [B('Green peas, loose',250,26,'value'),B('Safal Frozen Green Peas',500,65,'popular')],
  brinjal:   [B('Brinjal, loose',500,24,'value'),B('Fresho Brinjal',500,34,'popular')],
  okra:      [B('Ladies finger, loose',250,18,'value'),B('Fresho Ladies Finger',250,26,'popular')],
  pumpkin:   [B('Pumpkin, loose',500,20,'value'),B('Fresho Pumpkin',500,30,'popular')],
  mushroom:  [B('Mushroom, loose',200,40,'value'),B('Fresho Button Mushroom',200,55,'popular')],
  babycorn:  [B('Baby corn, loose',200,35,'value'),B('Fresho Baby Corn',200,48,'popular')],
  broccoli:  [B('Broccoli, loose',250,45,'value'),B('Fresho Broccoli',250,60,'popular')],
  cucumber:  [B('Cucumber, loose',500,20,'value'),B('Fresho Cucumber',500,28,'popular')],
  beetroot:  [B('Beetroot, loose',500,22,'value'),B('Fresho Beetroot',500,30,'popular')],
  springonion:[B('Spring onion, market',100,15,'value'),B('Fresho Spring Onion',100,22,'popular')],
  coconut:   [B('Grated coconut, market',200,18,'value'),B('Vasant Frozen Grated Coconut',200,35,'popular')],
  banana:    [B('Banana, loose',6,36,'value'),B('Fresho Banana',6,48,'popular')],
  apple:     [B('Apple, loose',4,80,'value'),B('Fresho Shimla Apple',4,110,'popular')],
  lemon:     [B('Lemon, loose',4,20,'value'),B('Fresho Lemon',4,28,'popular')],
  gg:        [B('Ginger-garlic paste, loose',100,20,'value'),B('Aachi Ginger Garlic Paste',100,32,'popular')],
  chilli:    [B('Green chilli, loose',50,6,'value'),B('Fresho Green Chilli',50,10,'popular')],
  curryleaf: [B('Curry leaves, market',20,5,'value'),B('Fresho Curry Leaves',25,10,'popular')],
  coriander: [B('Coriander bunch, market',100,12,'value'),B('Fresho Coriander',100,18,'popular')],
  mint:      [B('Mint bunch, market',100,12,'value'),B('Fresho Mint',100,18,'popular')],

  milk:      [B('Aavin Toned Milk',500,26,'value'),B('Amul Taaza',500,31,'popular'),B('Milky Mist Full Cream',500,40,'premium')],
  curd:      [B('Aavin Curd',400,26,'value'),B('Amul Masti Dahi',400,32,'popular'),B('Milky Mist Curd',400,42,'premium')],
  paneer:    [B('Local dairy paneer',200,70,'value'),B('Amul Fresh Paneer',200,95,'popular'),B('Milky Mist Paneer',200,110,'premium')],
  cheese:    [B('Go Cheese Slices',200,105,'value'),B('Amul Processed Cheese',200,125,'popular')],
  butter:    [B('Local table butter',100,48,'value'),B('Amul Butter',100,58,'popular')],
  cream:     [B('Local fresh cream',200,55,'value'),B('Amul Fresh Cream',200,75,'popular')],
  ghee:      [B('Aavin Ghee',100,58,'value'),B('Amul Pure Ghee',100,72,'popular'),B('Nandini Ghee',100,80,'premium')],
  egg:       [B('Farm eggs, loose',6,42,'value'),B('Suguna Home Fresh',6,55,'popular'),B('Eggoz Nutrition',6,75,'premium')],
  chicken:   [B('Local shop, curry cut',500,130,'value'),B('Suguna Daily Fressh',500,165,'popular'),B('Licious Curry Cut',500,240,'premium')],
  fish:      [B('Market fish, cleaned',500,150,'value'),B('FreshToHome Fish',500,320,'popular')],
  prawns:    [B('Market prawns, cleaned',250,180,'value'),B('FreshToHome Prawns',250,290,'popular')],
  tofu:      [B('Local soy tofu',200,55,'value'),B('Urban Platter Tofu',200,90,'popular')],
  soyachunk: [B('Soya chunks, loose',200,42,'value'),B('Nutrela Soya Chunks',200,62,'popular'),B('Organic Tattva Soya Chunks',200,95,'premium')],
  soyagran:  [B('Soya granules, loose',200,45,'value'),B('Nutrela Soya Granules',200,68,'popular')],
  peanut:    [B('Groundnut, loose',250,38,'value'),B('Nutraj Peanuts',250,55,'popular')],
  cashew:    [B('Cashew W320, loose',50,48,'value'),B('Nutraj Cashews',50,60,'popular'),B('Happilo Premium Cashews',50,85,'premium')],
  almond:    [B('Almonds, loose',100,85,'value'),B('Nutraj Almonds',100,105,'popular'),B('Happilo Almonds',100,140,'premium')],

  oil:       [B('Gold Winner Sunflower',1000,135,'value'),B('Fortune Sunlite',1000,150,'popular'),B('Saffola Gold',1000,190,'premium')],
  salt:      [B('Nirma Shudh Salt',1000,18,'value'),B('Tata Salt',1000,28,'popular'),B('Tata Salt Lite',1000,45,'premium')],
  sugar:     [B('Sugar, loose',500,25,'value'),B('Madhur Sugar',500,32,'popular')],
  jaggery:   [B('Jaggery, loose',500,55,'value'),B('24 Mantra Jaggery',500,85,'popular')],
  mustard:   [B('Mustard seeds, loose',100,18,'value'),B('Aachi Mustard',100,25,'popular')],
  cumin:     [B('Jeera, loose',100,38,'value'),B('Everest Jeera',100,52,'popular'),B('Tata Sampann Jeera',100,68,'premium')],
  turmeric:  [B('Turmeric powder, loose',100,24,'value'),B('Aachi Turmeric Powder',100,32,'popular'),B('Everest Haldi',100,42,'premium')],
  chpowder:  [B('Chilli powder, loose',100,28,'value'),B('Sakthi Chilli Powder',100,38,'popular'),B('Everest Tikhalal',100,52,'premium')],
  corpowder: [B('Coriander powder, loose',100,24,'value'),B('Sakthi Coriander Powder',100,32,'popular'),B('Everest Dhania',100,42,'premium')],
  garam:     [B('Garam masala, loose',100,48,'value'),B('Everest Garam Masala',100,62,'popular'),B('MDH Garam Masala',100,75,'premium')],
  sambarpwd: [B('Sambar powder, loose',100,32,'value'),B('Sakthi Sambar Powder',100,42,'popular'),B('MTR Sambar Powder',100,55,'premium')],
  pepper:    [B('Black pepper, loose',100,85,'value'),B('Everest Black Pepper',100,110,'popular')],
  chaat:     [B('Chaat masala, loose',100,32,'value'),B('Everest Chaat Masala',100,45,'popular')],
  methi:     [B('Kasuri methi, loose',25,20,'value'),B('MDH Kasuri Methi',25,32,'popular')],
  hing:      [B('Asafoetida, loose',25,35,'value'),B('LG Hing',25,55,'popular')],
  oregano:   [B('Mixed herbs, loose',25,30,'value'),B('Keya Mixed Herbs',25,55,'popular')],
  tamarind:  [B('Tamarind, loose',100,25,'value'),B('Aachi Tamarind Paste',100,35,'popular')],
  sesame:    [B('Sesame seeds, loose',100,32,'value'),B('Everest Til',100,48,'popular')],
  soy:       [B("Ching's Soy Sauce",200,55,'value'),B('Weikfield Soy Sauce',200,70,'popular'),B('Kikkoman Soy Sauce',250,180,'premium')],
  vinegar:   [B('Vinegar, loose',200,25,'value'),B('Weikfield Vinegar',200,40,'popular')],
  ketchup:   [B('Local tomato ketchup',500,65,'value'),B('Kissan Fresh Tomato Ketchup',500,99,'popular'),B('Heinz Tomato Ketchup',500,140,'premium')],
  chillisauce:[B("Ching's Red Chilli Sauce",200,55,'value'),B('Weikfield Chilli Sauce',200,70,'popular')],
  honey:     [B('Local honey',250,120,'value'),B('Dabur Honey',250,165,'popular'),B('Organic India Honey',250,240,'premium')],
  cornflour: [B('Corn flour, loose',100,20,'value'),B('Brown & Polson Corn Flour',100,32,'popular')],
  pastasauce:[B('Local pasta sauce',400,95,'value'),B('Del Monte Pasta Sauce',400,135,'popular')]
};

const TIERS = {
  value:   { n: 'Value',   d: 'Loose, local and own-label' },
  popular: { n: 'Popular', d: 'The brands most people buy' },
  premium: { n: 'Premium', d: 'Organic, unpolished, imported' }
};

/* Every ingredient must have at least one buyable option. */
Object.keys(ING).forEach(k => {
  if (!BR[k]) BR[k] = [B(ING[k].n, 100, 40, 'popular')];
});

const brandFor = (k, tier) => {
  const list = BR[k];
  return list.find(x => x.t === tier) || list.find(x => x.t === 'popular') || list[0];
};

/* The planner costs dishes at the popular tier so scoring stays stable no
   matter which tier the shopper is currently viewing. */
Object.keys(ING).forEach(k => {
  const b = brandFor(k, 'popular');
  ING[k].p = b.p;
  ING[k].pack = b.pack;
});

/* --------------------------------------------------------------------------
   Quick-commerce platforms
   Public search-page patterns — change one line here if a site moves its
   search route. Price index and fees are indicative, not live.
   -------------------------------------------------------------------------- */
const PLATFORMS = [
  { id:'blinkit',   n:'Blinkit',           ab:'B',  eta:'10–20 min', idx:1.00, ship:25, fee:12, free:199, c:'#F8CB46',
    url: q => `https://blinkit.com/s/?q=${encodeURIComponent(q)}` },
  { id:'zepto',     n:'Zepto',             ab:'Z',  eta:'10–15 min', idx:0.98, ship:30, fee:10, free:199, c:'#C4B5FD',
    url: q => `https://www.zeptonow.com/search?query=${encodeURIComponent(q)}` },
  { id:'instamart', n:'Swiggy Instamart',  ab:'S',  eta:'12–20 min', idx:1.02, ship:25, fee:15, free:199, c:'#FDBA74',
    url: q => `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(q)}` },
  { id:'bigbasket', n:'BigBasket',         ab:'BB', eta:'Same day',  idx:0.94, ship:0,  fee:0,  free:500, c:'#BEF264',
    url: q => `https://www.bigbasket.com/ps/?q=${encodeURIComponent(q)}` }
];

/* --------------------------------------------------------------------------
   Cuisines
   -------------------------------------------------------------------------- */
const CUISINES = {
  any:         { n: 'A mix of everything', d: 'Draw from every kitchen',        emoji: '🌍' },
  south:       { n: 'South Indian',        d: 'Rice, dal, coconut, curry leaf', emoji: '🥥' },
  north:       { n: 'North Indian',        d: 'Roti, rich gravies, garam masala', emoji: '🫓' },
  indochinese: { n: 'Indo-Chinese',        d: 'Soy, ginger, high-heat wok',     emoji: '🥡' },
  continental: { n: 'Continental',         d: 'Pasta, salads, bakes, toast',    emoji: '🥗' }
};

const DIET_RANK = { vegan: 0, veg: 1, egg: 2, nonveg: 3 };

const DIETS = {
  vegan:  { n: 'Vegan',           d: 'No animal produce' },
  veg:    { n: 'Vegetarian',      d: 'Dairy, no egg or meat' },
  egg:    { n: 'Eggetarian',      d: 'Veg plus egg' },
  nonveg: { n: 'Non-vegetarian',  d: 'Everything' }
};

const ALLERGENS = {
  dairy: 'Dairy', gluten: 'Gluten', peanut: 'Peanuts', nuts: 'Tree nuts',
  egg: 'Eggs', fish: 'Fish', soy: 'Soy', sesame: 'Sesame'
};

const GOALS = {
  lose:     { n: 'Lose weight',  d: 'Gentle calorie deficit',    adj: -0.15, pro: 1.4 },
  maintain: { n: 'Maintain',     d: 'Hold steady',               adj:  0,    pro: 1.1 },
  gain:     { n: 'Gain weight',  d: 'Calorie surplus',           adj:  0.15, pro: 1.3 },
  muscle:   { n: 'Build muscle', d: 'Slight surplus, protein-led', adj: 0.08, pro: 1.7 }
};

const SKILLS = {
  1: { n: 'Beginner',    d: 'Simple, few steps' },
  2: { n: 'Comfortable', d: 'Most home cooking' },
  3: { n: 'Confident',   d: 'Anything goes' }
};


/* ==========================================================================
   Budget Bites — Recipe Library
   --------------------------------------------------------------------------
   Quantities in `ing` are PER SINGLE SERVING; the planner scales them by the
   number of eaters and by the day's portion factor.

   diet   : vegan < veg < egg < nonveg  (a vegan dish suits every diet)
   skill  : 1 beginner · 2 comfortable · 3 confident
   time   : prep + cook, start to plate
   steps  : the method shown in the recipe popup
   ========================================================================== */

function R(o) { return o; }

const RECIPES = [

  /* ══════════════════════════ SOUTH INDIAN ══════════════════════════ */

  R({ id:'idli', n:'Idli with sambar', cuisine:'south', slots:['breakfast'], diet:'vegan',
    time:25, prep:10, cook:15, skill:2, kcal:390, pro:12, carb:66, fat:7,
    ing:{batter:180,toor:35,tomato:40,onion:30,sambarpwd:6,tamarind:5,oil:6,mustard:1,curryleaf:1,salt:2},
    steps:[
      'Grease the idli plates lightly and pour batter into each mould, filling about three-quarters.',
      'Steam for 10–12 minutes on medium heat. A skewer pushed in should come out clean.',
      'For the sambar, pressure-cook the toor dal with turmeric and a little water until soft, then whisk it smooth.',
      'Soak the tamarind in warm water, squeeze out the pulp and discard the fibre.',
      'Boil the onion and tomato in the tamarind water with sambar powder and salt until the raw smell goes, about 6 minutes.',
      'Add the mashed dal, loosen with water to a pouring consistency and simmer 4 minutes.',
      'Heat oil, crackle the mustard seeds, add curry leaves and pour this tempering over the sambar.'
    ],
    tip:'Let the steamed idlis stand two minutes before unmoulding — they release cleanly instead of tearing.' }),

  R({ id:'dosa', n:'Plain dosa with chutney', cuisine:'south', slots:['breakfast'], diet:'vegan',
    time:20, prep:8, cook:12, skill:2, kcal:400, pro:10, carb:60, fat:13,
    ing:{batter:170,coconut:40,chana:8,chilli:3,tamarind:2,oil:10,mustard:1,curryleaf:1,salt:2},
    steps:[
      'Thin the batter with a splash of water until it pours easily but still coats a spoon.',
      'Heat a tawa until a few drops of water dance on it, then rub with a halved onion dipped in oil.',
      'Pour a ladle of batter in the centre and spread outward in a spiral, working quickly.',
      'Drizzle oil around the edge and cook until the base is golden and lifts away on its own.',
      'For the chutney, grind coconut, roasted chana, green chilli, tamarind and salt with a little water.',
      'Temper mustard seeds and curry leaves in hot oil and stir into the chutney.'
    ],
    tip:'The tawa must be hot for the first dosa and slightly cooler for the rest — sprinkle water and wipe between dosas.' }),

  R({ id:'upma', n:'Rava upma', cuisine:'south', slots:['breakfast'], diet:'vegan',
    time:20, prep:7, cook:13, skill:1, kcal:340, pro:8, carb:50, fat:11,
    ing:{rava:70,onion:40,carrot:30,peas:15,oil:9,mustard:1,chana:5,curryleaf:1,chilli:3,salt:2},
    steps:[
      'Dry-roast the rava on low heat until it smells nutty and no longer looks raw, about 4 minutes. Set aside.',
      'Heat oil, crackle mustard seeds, add chana dal and fry until golden.',
      'Add curry leaves, green chilli and onion; cook until the onion turns soft and translucent.',
      'Add carrot and peas with salt, and cook 2 minutes.',
      'Pour in 2.5 times the rava\'s volume in hot water and bring to a rolling boil.',
      'Lower the heat and rain the rava in with one hand while stirring constantly with the other.',
      'Cover and rest 3 minutes off the heat, then fluff with a fork.'
    ],
    tip:'Roasting the rava first is the whole difference between fluffy upma and a lump.' }),

  R({ id:'pongal', n:'Ven pongal', cuisine:'south', slots:['breakfast'], diet:'veg',
    time:30, prep:8, cook:22, skill:2, kcal:430, pro:13, carb:62, fat:15,
    ing:{rice:70,moong:35,ghee:10,cashew:8,pepper:2,cumin:2,gg:5,curryleaf:1,hing:1,salt:2},
    steps:[
      'Dry-roast the moong dal until it smells warm and nutty, about 3 minutes.',
      'Pressure-cook the rice and roasted dal together with 4 cups of water for 4 whistles until very soft.',
      'Mash lightly with the back of a ladle — pongal should be creamy, not grainy.',
      'Heat ghee, fry the cashews until golden and lift them out.',
      'In the same ghee crackle cumin and crushed pepper, add ginger-garlic, curry leaves and asafoetida.',
      'Pour the tempering with the cashews over the pongal, add salt and mix well.'
    ],
    tip:'Keep it looser than you think — pongal thickens noticeably as it sits.' }),

  R({ id:'uttapam', n:'Onion tomato uttapam', cuisine:'south', slots:['breakfast'], diet:'vegan',
    time:22, prep:10, cook:12, skill:1, kcal:380, pro:11, carb:58, fat:12,
    ing:{batter:180,onion:45,tomato:40,capsicum:25,chilli:3,coriander:5,oil:9,salt:2},
    steps:[
      'Finely chop the onion, tomato, capsicum, chilli and coriander and toss together with a pinch of salt.',
      'Heat the tawa on medium and pour a thick ladle of batter without spreading it too thin.',
      'Scatter a generous handful of the vegetable mix over the top and press it in gently with a spatula.',
      'Drizzle oil around the edge, cover and cook 3–4 minutes until the base is golden.',
      'Flip and cook the vegetable side for 2 minutes, pressing lightly.'
    ],
    tip:'Salt the vegetables only just before use, or they release water and make the uttapam soggy.' }),

  R({ id:'semiya', n:'Semiya upma', cuisine:'south', slots:['breakfast'], diet:'vegan',
    time:18, prep:6, cook:12, skill:1, kcal:350, pro:9, carb:54, fat:11,
    ing:{vermicelli:70,onion:40,carrot:30,peas:20,oil:9,mustard:1,chana:5,curryleaf:1,chilli:3,lemon:0.25,salt:2},
    steps:[
      'Roast the vermicelli in a dry pan until evenly golden, then set aside.',
      'Heat oil, crackle mustard seeds, fry chana dal, then add curry leaves, chilli and onion.',
      'Add carrot and peas, season with salt and cook 2 minutes.',
      'Pour in twice the vermicelli\'s volume of hot water and bring to the boil.',
      'Stir in the roasted vermicelli, cover and cook on low until the water is absorbed, about 5 minutes.',
      'Rest off the heat, then fluff and finish with lemon juice.'
    ],
    tip:'Squeeze the lemon after the heat is off — boiling it turns the juice bitter.' }),

  R({ id:'sambarrice', n:'Sambar rice', cuisine:'south', slots:['lunch','dinner'], diet:'vegan',
    time:35, prep:10, cook:25, skill:2, kcal:500, pro:16, carb:80, fat:11,
    ing:{toor:55,rice:80,cabbage:40,carrot:35,tomato:40,sambarpwd:7,tamarind:6,oil:9,mustard:1,curryleaf:1,salt:2},
    steps:[
      'Pressure-cook the rice and toor dal together with turmeric until both are soft, about 4 whistles.',
      'Soak the tamarind in hot water and extract the pulp.',
      'Boil the carrot, cabbage and tomato in the tamarind water with sambar powder and salt until tender.',
      'Mash the cooked rice and dal together, then stir into the vegetables.',
      'Add hot water to loosen — sambar rice should fall off the spoon, not hold its shape — and simmer 5 minutes.',
      'Temper mustard seeds and curry leaves in oil and pour over the top.'
    ],
    tip:'It thickens a lot as it cools, so take it off the heat looser than you want to serve it.' }),

  R({ id:'lemonrice', n:'Lemon rice with peanuts', cuisine:'south', slots:['lunch','dinner'], diet:'vegan',
    time:20, prep:6, cook:14, skill:1, kcal:470, pro:11, carb:72, fat:15,
    ing:{rice:85,peanut:20,lemon:0.5,oil:10,mustard:1,chana:6,turmeric:1,curryleaf:1,chilli:3,salt:2},
    steps:[
      'Cook the rice so the grains stay separate, spread it on a plate and let it cool completely.',
      'Heat oil, crackle mustard seeds, then fry peanuts and chana dal until golden.',
      'Add curry leaves, slit green chilli and turmeric, and take off the heat after a few seconds.',
      'Pour the tempering over the rice, add salt and fold gently with a light hand.',
      'Squeeze in the lemon juice last and mix once more.'
    ],
    tip:'Warm rice tears and turns pasty — cooling it first is what keeps the grains distinct.' }),

  R({ id:'curdrice', n:'Curd rice', cuisine:'south', slots:['breakfast','lunch'], diet:'veg',
    time:15, prep:6, cook:9, skill:1, kcal:360, pro:11, carb:55, fat:9,
    ing:{rice:80,curd:150,carrot:20,coriander:4,oil:5,mustard:1,curryleaf:1,chilli:2,salt:2},
    steps:[
      'Cook the rice until soft — slightly overcooked is right here — and mash it lightly while warm.',
      'Let it cool to room temperature, then fold in the curd and salt.',
      'Stir through grated carrot and chopped coriander.',
      'Temper mustard seeds, curry leaves and green chilli in hot oil and pour over.'
    ],
    tip:'Never mix curd into hot rice: it splits. If you need it now, add a splash of cold milk first.' }),

  R({ id:'rasamrice', n:'Rasam, poriyal and rice', cuisine:'south', slots:['lunch','dinner'], diet:'vegan',
    time:35, prep:12, cook:23, skill:2, kcal:485, pro:13, carb:80, fat:11,
    ing:{rice:80,toor:35,cabbage:80,coconut:15,tamarind:6,tomato:35,oil:9,mustard:1,curryleaf:1,chpowder:1,pepper:1,cumin:1,salt:2},
    steps:[
      'Cook the rice and set aside. Pressure-cook the toor dal until soft and whisk smooth.',
      'Extract tamarind pulp in warm water and boil it with chopped tomato, chilli powder and salt until the raw smell lifts.',
      'Crush the pepper and cumin coarsely and add to the pot with the thinned dal.',
      'Bring the rasam just to a froth and take it off — it must never reach a rolling boil.',
      'For the poriyal, temper mustard seeds, add shredded cabbage and salt, and cook uncovered until just tender.',
      'Finish the poriyal with grated coconut and the rasam with a curry-leaf tempering.'
    ],
    tip:'Rasam is finished the moment it froths at the edges. Boiling it hard flattens the aroma.' }),

  R({ id:'kootu', n:'Vegetable kootu with rice', cuisine:'south', slots:['lunch','dinner'], diet:'vegan',
    time:30, prep:10, cook:20, skill:2, kcal:490, pro:16, carb:76, fat:13,
    ing:{rice:80,moong:50,pumpkin:80,beans:40,coconut:25,cumin:2,chilli:3,oil:8,mustard:1,curryleaf:1,turmeric:1,salt:2},
    steps:[
      'Cook the rice separately and keep warm.',
      'Boil the moong dal with turmeric until soft but still holding shape.',
      'Add the diced pumpkin and beans with salt and cook until tender, about 8 minutes.',
      'Grind coconut, cumin and green chilli to a coarse paste with a little water.',
      'Stir the paste into the dal and simmer 4 minutes so the raw coconut cooks out.',
      'Temper mustard seeds and curry leaves in oil and pour over.'
    ],
    tip:'Add the ground coconut at the end and keep the heat low — boiled coconut turns grainy.' }),

  R({ id:'tamarindrice', n:'Puliyodarai (tamarind rice)', cuisine:'south', slots:['lunch','dinner'], diet:'vegan',
    time:25, prep:8, cook:17, skill:2, kcal:480, pro:10, carb:74, fat:16,
    ing:{rice:85,tamarind:12,peanut:18,chana:8,oil:12,mustard:1,curryleaf:2,chpowder:2,turmeric:1,sesame:3,hing:1,salt:2},
    steps:[
      'Cook the rice with the grains separate, spread out and cool.',
      'Soak the tamarind in hot water and extract a thick pulp.',
      'Heat oil, crackle mustard, fry peanuts and chana dal until golden, then add curry leaves and asafoetida.',
      'Pour in the tamarind pulp with chilli powder, turmeric and salt.',
      'Simmer until the mixture darkens and the oil separates at the edges, about 8 minutes.',
      'Fold the paste through the cooled rice and finish with roasted sesame.'
    ],
    tip:'The paste keeps a week in the fridge — make double and the second meal takes four minutes.' }),

  R({ id:'fishcurry', n:'Fish curry with rice', cuisine:'south', slots:['lunch','dinner'], diet:'nonveg',
    time:40, prep:12, cook:28, skill:3, kcal:575, pro:34, carb:70, fat:17,
    ing:{fish:130,rice:80,onion:50,tomato:50,tamarind:6,gg:8,oil:11,chpowder:2,turmeric:1,curryleaf:1,mustard:1,salt:2},
    steps:[
      'Rub the fish with turmeric and salt and leave it 10 minutes while you build the gravy.',
      'Cook the rice and keep it warm.',
      'Heat oil, crackle mustard seeds, add curry leaves and sliced onion, and fry until deep golden.',
      'Add ginger-garlic paste and cook until the raw edge disappears.',
      'Add tomato, chilli powder, turmeric and salt, and cook down until the oil separates.',
      'Pour in tamarind extract with a cup of water and simmer 5 minutes.',
      'Slide the fish in, cover and simmer 8 minutes without stirring. Swirl the pan instead.'
    ],
    tip:'Once the fish goes in, never stir — swirl the pan by the handle or the pieces break up.' }),

  R({ id:'chettinad', n:'Chicken Chettinad with rice', cuisine:'south', slots:['lunch','dinner'], diet:'nonveg',
    time:45, prep:15, cook:30, skill:3, kcal:645, pro:39, carb:70, fat:23,
    ing:{chicken:130,rice:80,onion:60,tomato:50,coconut:20,gg:10,oil:12,pepper:2,cumin:2,chpowder:2,corpowder:2,turmeric:1,curryleaf:1,salt:2},
    steps:[
      'Dry-roast the coconut, pepper, cumin and coriander powder until fragrant, then grind to a coarse masala.',
      'Marinate the chicken in turmeric, chilli powder and salt for 15 minutes.',
      'Cook the rice separately.',
      'Heat oil, add curry leaves and onion and fry until browned at the edges.',
      'Add ginger-garlic paste, then tomato, and cook until the mixture pulls away from the pan.',
      'Add the chicken and sear on high for 4 minutes to seal it.',
      'Stir in the ground masala with a cup of water, cover and simmer 18 minutes until the chicken is tender and the gravy clings.'
    ],
    tip:'The freshly ground masala is the whole dish — a packet mix will not taste the same.' }),

  R({ id:'eggcurrysouth', n:'Egg roast with rice', cuisine:'south', slots:['lunch','dinner'], diet:'egg',
    time:32, prep:10, cook:22, skill:2, kcal:560, pro:24, carb:70, fat:21,
    ing:{egg:2,rice:80,onion:60,tomato:45,gg:8,oil:11,chpowder:2,turmeric:1,garam:1,curryleaf:1,salt:2},
    steps:[
      'Hard-boil the eggs for 9 minutes, cool under running water and peel.',
      'Score each egg lightly and toss in a pinch of turmeric, chilli powder and salt.',
      'Cook the rice and keep warm.',
      'Fry the sliced onion in oil with curry leaves until deeply browned — this takes a patient 10 minutes.',
      'Add ginger-garlic paste and tomato and cook to a thick masala.',
      'Add the spice powders, then the eggs, and roll them in the masala for 4 minutes on low.'
    ],
    tip:'Brown the onion properly. Pale onion gives a thin, sharp gravy instead of a sweet one.' }),

  R({ id:'sundal', n:'Chana sundal', cuisine:'south', slots:['snack'], diet:'vegan',
    time:15, prep:5, cook:10, skill:1, kcal:200, pro:11, carb:28, fat:5,
    ing:{chickpea:55,coconut:15,oil:5,mustard:1,curryleaf:1,chilli:2,hing:1,lemon:0.25,salt:1},
    steps:[
      'Soak the chana overnight, then pressure-cook with salt until soft but not mushy.',
      'Drain well — wet sundal goes soggy.',
      'Temper mustard seeds in oil, add curry leaves, green chilli and asafoetida.',
      'Toss in the drained chana and stir on high for 2 minutes.',
      'Take off the heat, fold in grated coconut and a squeeze of lemon.'
    ],
    tip:'Save the cooking water — it makes a good base for rasam the next day.' }),

  R({ id:'coconutfruit', n:'Fruit and coconut bowl', cuisine:'south', slots:['snack'], diet:'vegan',
    time:6, prep:6, cook:0, skill:1, kcal:210, pro:4, carb:34, fat:8,
    ing:{banana:1,apple:0.5,coconut:20,jaggery:6},
    steps:[
      'Dice the banana and apple into even pieces.',
      'Grate the jaggery finely so it dissolves rather than sitting in lumps.',
      'Toss the fruit with the coconut and jaggery.',
      'Rest 5 minutes so the jaggery draws out a little syrup.'
    ],
    tip:'Cut the apple last and toss it in immediately — the banana\'s moisture keeps it from browning.' }),

  R({ id:'chickenkurma', n:'Chicken kurma with rice', cuisine:'south', slots:['lunch','dinner'], diet:'nonveg',
    time:42, prep:14, cook:28, skill:2,
    ing:{chicken:135,rice:80,onion:55,coconut:25,cashew:7,gg:10,oil:11,garam:2,turmeric:1,curryleaf:1,coriander:4,salt:2},
    steps:[
      'Grind the coconut and cashew to a smooth paste with a little water.',
      'Marinate the chicken in turmeric and salt while you build the base.',
      'Cook the rice separately.',
      'Fry the sliced onion in oil with curry leaves until soft and pale gold.',
      'Add ginger-garlic paste and cook until the raw smell lifts.',
      'Add the chicken and sear 5 minutes on high.',
      'Stir in the coconut-cashew paste with a cup of water, cover and simmer 18 minutes until tender.',
      'Finish with garam masala and coriander.'
    ],
    tip:'Add the coconut paste on low heat and never boil it hard — it splits and turns grainy.' }),

  R({ id:'prawnmasala', n:'Prawn masala with rice', cuisine:'south', slots:['lunch','dinner'], diet:'nonveg',
    time:32, prep:12, cook:20, skill:2,
    ing:{prawns:130,rice:80,onion:55,tomato:45,gg:8,oil:11,chpowder:2,turmeric:1,curryleaf:1,coriander:4,salt:2},
    steps:[
      'Clean and devein the prawns, then toss in turmeric and salt.',
      'Cook the rice separately.',
      'Fry the onion with curry leaves until browned at the edges.',
      'Add ginger-garlic paste, then tomato and chilli powder, and cook until the oil separates.',
      'Add the prawns and stir on high for 3 minutes only.',
      'Cover, take off the heat and let the residual heat finish them.'
    ],
    tip:'Prawns cook in three minutes. Anything longer and they shrink into rubber.' }),

  R({ id:'pepperchicken', n:'Pepper chicken with rice', cuisine:'south', slots:['lunch','dinner'], diet:'nonveg',
    time:40, prep:12, cook:28, skill:3,
    ing:{chicken:140,rice:80,onion:55,pepper:4,gg:9,oil:11,corpowder:2,curryleaf:1,turmeric:1,salt:2},
    steps:[
      'Coarsely crush the peppercorns — powder is not the same thing.',
      'Marinate the chicken in turmeric, half the pepper and salt for 15 minutes.',
      'Cook the rice separately.',
      'Fry the onion and curry leaves in oil until deep gold.',
      'Add ginger-garlic paste and coriander powder and cook out the raw edge.',
      'Add the chicken and sear hard for 5 minutes.',
      'Cover and cook on low 15 minutes in its own moisture, then uncover and dry it out.',
      'Finish with the remaining crushed pepper off the heat.'
    ],
    tip:'Half the pepper goes in at the start for depth, half at the end for aroma.' }),

  R({ id:'fishfry', n:'Fish fry with rasam rice', cuisine:'south', slots:['lunch','dinner'], diet:'nonveg',
    time:38, prep:14, cook:24, skill:2,
    ing:{fish:130,rice:80,toor:25,tamarind:6,tomato:35,chpowder:2,turmeric:1,oil:12,curryleaf:1,pepper:1,cumin:1,salt:2},
    steps:[
      'Marinate the fish in chilli powder, turmeric, salt and a splash of water for 20 minutes.',
      'Cook the rice; pressure-cook the toor dal until soft.',
      'Extract tamarind pulp and boil it with tomato, crushed pepper and cumin until the raw smell goes.',
      'Add the thinned dal and bring the rasam just to a froth, then take it off.',
      'Shallow-fry the fish in hot oil, 3–4 minutes a side, without moving it early.',
      'Serve the fish alongside rasam and rice.'
    ],
    tip:'Leave the fish alone until it releases from the pan by itself — moving it early tears the crust off.' }),

  R({ id:'soyakurma', n:'Soya chunk kurma with rice', cuisine:'south', slots:['lunch','dinner'], diet:'vegan',
    time:35, prep:12, cook:23, skill:2,
    ing:{soyachunk:50,rice:80,onion:55,coconut:25,tomato:40,gg:9,oil:11,garam:2,turmeric:1,curryleaf:1,coriander:4,salt:2},
    steps:[
      'Boil the soya chunks in salted water for 5 minutes, then drain and squeeze each one dry.',
      'Rinse in cold water and squeeze again — this is what removes the raw beany smell.',
      'Grind the coconut to a smooth paste with a little water.',
      'Cook the rice separately.',
      'Fry the onion with curry leaves until soft, add ginger-garlic paste, then tomato.',
      'Cook until the oil separates, then add the squeezed soya chunks and stir 3 minutes.',
      'Add the coconut paste with a cup of water and simmer 10 minutes on low.',
      'Finish with garam masala and coriander.'
    ],
    tip:'Boil, drain, squeeze, rinse, squeeze again. Skipping the double squeeze is why soya sometimes tastes of cardboard.' }),

  R({ id:'soyapulao', n:'Soya chunk pulao', cuisine:'south', slots:['lunch','dinner'], diet:'vegan',
    time:32, prep:12, cook:20, skill:2,
    ing:{soyachunk:45,rice:85,carrot:40,beans:35,peas:30,onion:45,gg:8,oil:11,garam:3,mint:5,salt:2},
    steps:[
      'Boil the soya chunks 5 minutes, drain, rinse cold and squeeze dry.',
      'Soak the rice for 15 minutes and drain.',
      'Heat oil, fry the whole spices, then the sliced onion until golden.',
      'Add ginger-garlic paste, then the vegetables and soya chunks, and stir 3 minutes.',
      'Add the drained rice and toss gently for a minute so every grain is coated.',
      'Add 1.5 times the rice volume in water with salt and mint, cover and cook on low 12 minutes.',
      'Rest 5 minutes before fluffing with a fork.'
    ],
    tip:'Toss the rice in the oil before the water goes in — that is what keeps the grains separate.' }),

  R({ id:'paneerkurma', n:'Paneer kurma with ghee rice', cuisine:'south', slots:['lunch','dinner'], diet:'veg',
    time:35, prep:12, cook:23, skill:2,
    ing:{paneer:90,rice:80,onion:50,coconut:25,cashew:8,tomato:35,gg:9,ghee:6,oil:8,garam:2,curryleaf:1,mint:4,coriander:4,salt:2},
    steps:[
      'Grind the coconut and cashew to a silky paste — this is what makes a kurma rich without cream.',
      'Cook the rice, then stir a spoon of ghee and a few mint leaves through it while hot.',
      'Fry the paneer cubes in a little oil until just golden, then drop them into warm salted water so they stay soft.',
      'Fry the onion with curry leaves until soft, add ginger-garlic paste, then tomato.',
      'Cook down until glossy, then stir in the coconut-cashew paste with a cup of water.',
      'Simmer 8 minutes on low, then fold in the drained paneer and garam masala.',
      'Rest 5 minutes off the heat so the paneer drinks the gravy.'
    ],
    tip:'The warm-water trick is the whole secret to soft paneer — fried cubes left dry turn to rubber within minutes.' }),

  R({ id:'tofucurry', n:'Coconut tofu curry with rice', cuisine:'south', slots:['lunch','dinner'], diet:'vegan',
    time:32, prep:12, cook:20, skill:2,
    ing:{tofu:130,rice:80,coconut:30,onion:50,tomato:40,gg:8,oil:11,turmeric:1,chpowder:1,curryleaf:1,mustard:1,coriander:4,salt:2},
    steps:[
      'Press the tofu under a weight for 10 minutes, then cube and pat dry.',
      'Pan-fry the cubes in hot oil until golden on at least three sides, then set aside.',
      'Cook the rice separately.',
      'Grind the coconut with a little water to a loose milk.',
      'Crackle mustard seeds in oil, add curry leaves and onion and fry until soft.',
      'Add ginger-garlic paste and tomato with turmeric and chilli powder, and cook until the oil separates.',
      'Pour in the coconut milk, bring to a bare simmer and slide the tofu back in for 5 minutes.'
    ],
    tip:'Brown the tofu before it meets the gravy — fried edges hold their shape, raw cubes fall apart.' }),

  R({ id:'soya65', n:'Soya 65', cuisine:'south', slots:['snack'], diet:'vegan',
    time:25, prep:12, cook:13, skill:2,
    ing:{soyachunk:50,cornflour:14,besan:12,gg:7,oil:12,chpowder:2,curryleaf:2,chilli:3,lemon:0.3,salt:1},
    steps:[
      'Boil the soya chunks 5 minutes, drain, rinse cold and squeeze bone dry.',
      'Toss them in ginger-garlic paste, chilli powder, salt and lemon and leave 10 minutes.',
      'Coat in cornflour and besan until every chunk is dusted.',
      'Shallow-fry in hot oil until deep red-brown and crisp at the edges.',
      'Throw a handful of curry leaves and slit green chilli into the last 20 seconds of frying.',
      'Drain, squeeze over more lemon and eat immediately.'
    ],
    tip:'Curry leaves go in right at the end — they crisp in seconds and burn just as fast.' }),

  /* ══════════════════════════ NORTH INDIAN ══════════════════════════ */

  R({ id:'paratha', n:'Aloo paratha with curd', cuisine:'north', slots:['breakfast'], diet:'veg',
    time:30, prep:15, cook:15, skill:2, kcal:460, pro:13, carb:66, fat:16,
    ing:{atta:80,potato:110,curd:80,oil:10,chilli:3,coriander:5,cumin:1,chaat:1,salt:2},
    steps:[
      'Knead the atta with water and a little oil into a soft dough and rest it 15 minutes under a cloth.',
      'Boil, peel and mash the potato while still warm — cold potato goes gluey.',
      'Mix the mash with chopped chilli, coriander, cumin, chaat masala and salt. Cool it fully.',
      'Roll a small disc of dough, place a ball of filling in the centre and gather the edges over it.',
      'Press flat and roll out gently and evenly, dusting with flour as you go.',
      'Cook on a hot tawa, smearing oil on each side, until brown spots appear on both faces.',
      'Serve hot with chilled curd.'
    ],
    tip:'Cool the filling completely. Warm filling steams inside and splits the paratha as you roll.' }),

  R({ id:'chilla', n:'Besan chilla', cuisine:'north', slots:['breakfast'], diet:'vegan',
    time:20, prep:8, cook:12, skill:1, kcal:310, pro:14, carb:36, fat:11,
    ing:{besan:70,onion:35,tomato:30,capsicum:25,coriander:5,chilli:3,oil:9,turmeric:1,salt:2},
    steps:[
      'Whisk the besan with water into a smooth, lump-free batter the thickness of pouring cream.',
      'Rest the batter 10 minutes so the flour hydrates.',
      'Stir in finely chopped onion, tomato, capsicum, chilli, coriander, turmeric and salt.',
      'Pour a ladle onto a hot greased tawa and spread into a round.',
      'Drizzle oil around the edge and cook until the base lifts freely, about 3 minutes.',
      'Flip and cook the other side for 2 minutes.'
    ],
    tip:'Rest the batter. Un-rested besan tastes raw and chalky no matter how long you cook it.' }),

  R({ id:'poha', n:'Vegetable poha', cuisine:'north', slots:['breakfast'], diet:'vegan',
    time:20, prep:8, cook:12, skill:1, kcal:330, pro:7, carb:52, fat:9,
    ing:{poha:70,onion:40,potato:40,peas:20,peanut:12,oil:8,mustard:1,turmeric:1,curryleaf:1,lemon:0.25,salt:2},
    steps:[
      'Rinse the poha in a colander under running water for a few seconds, then leave it to drain and soften.',
      'Heat oil and fry the peanuts until they colour, then lift them out.',
      'Crackle mustard seeds in the same oil, add curry leaves, onion and diced potato.',
      'Cover and cook until the potato is tender, about 6 minutes.',
      'Add peas, turmeric and salt, then fold in the drained poha gently.',
      'Cover and steam 2 minutes on low, then finish with lemon juice and the fried peanuts.'
    ],
    tip:'Rinse, never soak. Poha sitting in water collapses into paste.' }),

  R({ id:'bhurji', n:'Egg bhurji with toast', cuisine:'north', slots:['breakfast'], diet:'egg',
    time:15, prep:5, cook:10, skill:1, kcal:430, pro:22, carb:34, fat:22,
    ing:{egg:2,bread:2,onion:40,tomato:35,chilli:3,coriander:4,oil:8,turmeric:1,chpowder:1,salt:2},
    steps:[
      'Beat the eggs with salt and a pinch of turmeric.',
      'Fry the onion and green chilli in oil until soft and just golden.',
      'Add tomato and chilli powder and cook until the tomato breaks down.',
      'Lower the heat, pour in the eggs and wait five seconds before stirring.',
      'Scramble slowly, pushing the curds around until just set but still glossy.',
      'Finish with coriander and serve with toast.'
    ],
    tip:'Take it off the heat while it still looks slightly underdone — it carries on cooking in the pan.' }),

  R({ id:'daltadka', n:'Dal tadka with rice', cuisine:'north', slots:['lunch','dinner'], diet:'vegan',
    time:30, prep:8, cook:22, skill:1, kcal:530, pro:19, carb:84, fat:12,
    ing:{toor:70,rice:80,onion:35,tomato:45,gg:6,oil:9,cumin:1,turmeric:1,chpowder:1,coriander:4,salt:2},
    steps:[
      'Pressure-cook the toor dal with turmeric and salt until completely soft, then whisk it smooth.',
      'Cook the rice separately.',
      'Heat oil in a small pan and crackle the cumin seeds.',
      'Add ginger-garlic paste and chopped onion and fry until golden.',
      'Add tomato and chilli powder and cook until the oil separates from the masala.',
      'Pour the tadka into the dal, simmer 5 minutes and finish with coriander.'
    ],
    tip:'Pour the tadka in hot and cover the pot immediately — the trapped steam carries the aroma through.' }),

  R({ id:'rajma', n:'Rajma chawal', cuisine:'north', slots:['lunch','dinner'], diet:'vegan',
    time:40, prep:10, cook:30, skill:2, kcal:560, pro:20, carb:88, fat:12,
    ing:{rajma:70,rice:80,onion:50,tomato:60,gg:8,oil:10,garam:2,chpowder:1,turmeric:1,coriander:4,salt:2},
    steps:[
      'Soak the rajma overnight — this is not optional — then pressure-cook with salt until a bean crushes easily.',
      'Cook the rice separately.',
      'Fry the onion in oil until properly browned, then add ginger-garlic paste.',
      'Add pureed tomato with chilli powder and turmeric, and cook until the oil separates.',
      'Add the cooked rajma with its water and simmer 12 minutes.',
      'Mash a ladleful of beans against the pan to thicken the gravy, then finish with garam masala and coriander.'
    ],
    tip:'Mashing a few beans is what makes the gravy cling instead of sitting watery under the rice.' }),

  R({ id:'chana', n:'Chana masala with roti', cuisine:'north', slots:['lunch','dinner'], diet:'vegan',
    time:35, prep:10, cook:25, skill:2, kcal:545, pro:20, carb:80, fat:15,
    ing:{chickpea:70,atta:70,onion:50,tomato:55,gg:8,oil:11,garam:2,corpowder:2,chpowder:1,chaat:1,salt:2},
    steps:[
      'Soak the chana overnight and pressure-cook with salt until soft.',
      'Knead the atta into a soft dough and rest it while the gravy cooks.',
      'Brown the onion in oil, add ginger-garlic paste and cook out the raw smell.',
      'Add tomato with coriander, chilli powder and salt, and cook until thick and glossy.',
      'Add the chana with a cup of its cooking water and simmer 12 minutes.',
      'Finish with garam masala and chaat masala.',
      'Roll and cook the rotis on a hot tawa, puffing each one briefly over the flame.'
    ],
    tip:'The chana cooking water is full of flavour — use it instead of fresh water in the gravy.' }),

  R({ id:'palak', n:'Palak paneer with roti', cuisine:'north', slots:['lunch','dinner'], diet:'veg',
    time:35, prep:12, cook:23, skill:2, kcal:580, pro:24, carb:52, fat:29,
    ing:{spinach:130,paneer:70,atta:70,onion:35,tomato:30,gg:7,oil:10,garam:2,cream:10,salt:2},
    steps:[
      'Blanch the spinach in boiling water for 90 seconds, then plunge it straight into cold water.',
      'Squeeze out the water and blend to a smooth puree.',
      'Knead and rest the atta dough.',
      'Fry the onion in oil until soft, add ginger-garlic paste, then tomato, and cook until thick.',
      'Add the spinach puree with salt and cook just 4 minutes on medium.',
      'Fold in the cubed paneer, garam masala and cream, and warm through.',
      'Cook the rotis and serve immediately.'
    ],
    tip:'The cold-water plunge locks in the green. Skip it and the palak turns olive-brown.' }),

  R({ id:'panbhurji', n:'Paneer bhurji with roti', cuisine:'north', slots:['lunch','dinner'], diet:'veg',
    time:25, prep:10, cook:15, skill:2, kcal:565, pro:25, carb:50, fat:29,
    ing:{paneer:80,atta:70,onion:45,tomato:45,capsicum:30,oil:10,turmeric:1,garam:2,chpowder:1,coriander:4,salt:2},
    steps:[
      'Crumble the paneer coarsely by hand — a grater makes it too fine.',
      'Knead and rest the atta dough.',
      'Fry onion and capsicum in oil until softened.',
      'Add tomato, turmeric, chilli powder and salt, and cook until the tomato collapses.',
      'Stir in the crumbled paneer and cook just 3 minutes — longer makes it rubbery.',
      'Finish with garam masala and coriander, and serve with fresh rotis.'
    ],
    tip:'Paneer needs warming, not cooking. Three minutes is the limit.' }),

  R({ id:'kadai', n:'Kadai vegetables with roti', cuisine:'north', slots:['lunch','dinner'], diet:'vegan',
    time:30, prep:12, cook:18, skill:2, kcal:500, pro:14, carb:70, fat:17,
    ing:{atta:70,capsicum:60,onion:50,tomato:55,peas:30,gg:7,oil:11,garam:2,corpowder:2,methi:1,salt:2},
    steps:[
      'Coarsely crush the coriander seeds and dried chilli to make a rough kadai masala.',
      'Knead and rest the atta dough.',
      'Sear the capsicum and onion on high heat until the edges char slightly, then lift out.',
      'In the same pan cook ginger-garlic paste and tomato until thick.',
      'Add the crushed masala and peas and cook 3 minutes.',
      'Return the seared vegetables, add garam masala and crushed kasuri methi, and toss on high.',
      'Serve with hot rotis.'
    ],
    tip:'Sear the vegetables separately and add them back at the end so they keep their bite.' }),

  R({ id:'alogobi', n:'Aloo gobi with roti', cuisine:'north', slots:['lunch','dinner'], diet:'vegan',
    time:30, prep:10, cook:20, skill:1, kcal:485, pro:13, carb:70, fat:17,
    ing:{atta:70,cauli:100,potato:70,onion:35,tomato:35,oil:10,turmeric:1,corpowder:2,cumin:1,chpowder:1,salt:2},
    steps:[
      'Cut the cauliflower into even florets and the potato into similar-sized cubes.',
      'Knead and rest the atta dough.',
      'Crackle cumin in hot oil, add onion and fry until golden.',
      'Add turmeric, coriander and chilli powder, then the potato, and cook covered 6 minutes.',
      'Add the cauliflower and salt, cover and cook until both are tender, stirring rarely.',
      'Uncover for the last 3 minutes to drive off moisture and let the edges catch.',
      'Serve with rotis.'
    ],
    tip:'Stir as little as possible — constant stirring breaks the cauliflower into mush.' }),

  R({ id:'khichdi', n:'Moong dal khichdi', cuisine:'north', slots:['lunch','dinner'], diet:'veg',
    time:25, prep:6, cook:19, skill:1, kcal:455, pro:17, carb:72, fat:11,
    ing:{moong:55,rice:65,carrot:35,peas:25,onion:30,oil:9,cumin:1,turmeric:1,ghee:4,hing:1,salt:2},
    steps:[
      'Rinse the rice and moong dal together until the water runs clear.',
      'Crackle cumin and asafoetida in oil, then add onion and cook until soft.',
      'Add carrot and peas and stir for 2 minutes.',
      'Add the drained rice and dal with turmeric, salt and four times their volume in water.',
      'Pressure-cook for 3 whistles, or simmer covered for 20 minutes until soft and porridge-like.',
      'Stir in the ghee just before serving.'
    ],
    tip:'Khichdi should pour, not clump. Add hot water freely if it stiffens on standing.' }),

  R({ id:'chickencurry', n:'Chicken curry with rice', cuisine:'north', slots:['lunch','dinner'], diet:'nonveg',
    time:45, prep:15, cook:30, skill:3, kcal:640, pro:38, carb:72, fat:22,
    ing:{chicken:130,rice:80,onion:60,tomato:55,gg:10,curd:30,oil:12,garam:2,chpowder:2,turmeric:1,coriander:5,salt:2},
    steps:[
      'Marinate the chicken in curd, turmeric, chilli powder and salt for at least 20 minutes.',
      'Cook the rice separately.',
      'Brown the sliced onion in oil slowly — 10 minutes, until genuinely deep gold.',
      'Add ginger-garlic paste and fry until the raw smell goes.',
      'Add tomato and cook until the oil separates at the edges.',
      'Add the marinated chicken and sear on high for 5 minutes.',
      'Pour in a cup of hot water, cover and simmer 20 minutes until tender. Finish with garam masala and coriander.'
    ],
    tip:'The curd marinade does two jobs — it tenderises the meat and thickens the gravy.' }),

  R({ id:'mixveg', n:'Mixed veg curry with roti', cuisine:'north', slots:['lunch','dinner'], diet:'vegan',
    time:30, prep:12, cook:18, skill:1, kcal:470, pro:13, carb:68, fat:16,
    ing:{atta:70,carrot:50,beans:50,potato:60,peas:30,onion:35,tomato:40,oil:10,garam:2,turmeric:1,corpowder:2,salt:2},
    steps:[
      'Dice all the vegetables to roughly the same size so they cook evenly.',
      'Knead and rest the atta dough.',
      'Fry the onion in oil until golden, then add tomato, turmeric and coriander powder.',
      'Cook until the masala thickens and darkens.',
      'Add the vegetables with salt and half a cup of water, cover and cook until tender.',
      'Finish with garam masala and serve with rotis.'
    ],
    tip:'Add the beans and carrot first and the peas last — they need very different times.' }),

  R({ id:'eggcurry', n:'Egg curry with rice', cuisine:'north', slots:['lunch','dinner'], diet:'egg',
    time:35, prep:10, cook:25, skill:2, kcal:560, pro:24, carb:72, fat:20,
    ing:{egg:2,rice:80,onion:50,tomato:50,gg:8,oil:11,garam:2,turmeric:1,chpowder:1,coriander:4,salt:2},
    steps:[
      'Hard-boil the eggs, cool, peel and halve them.',
      'Cook the rice separately.',
      'Brown the onion in oil, add ginger-garlic paste and cook it out.',
      'Add tomato, turmeric, chilli powder and salt and cook to a thick masala.',
      'Add a cup of water and simmer 8 minutes to make a gravy.',
      'Slip in the eggs cut side up, spoon gravy over them and simmer 4 minutes.',
      'Finish with garam masala and coriander.'
    ],
    tip:'Add the eggs at the very end — long simmering turns the yolks chalky and grey.' }),

  R({ id:'chaat', n:'Sprouts chaat', cuisine:'north', slots:['snack'], diet:'vegan',
    time:15, prep:12, cook:3, skill:1, kcal:190, pro:12, carb:26, fat:4,
    ing:{sprouts:120,potato:55,onion:35,tomato:35,lemon:0.3,coriander:5,chaat:2,chpowder:1,salt:1},
    steps:[
      'Steam the sprouts for 3 minutes to take off the raw edge, then spread them out to cool.',
      'Boil the potato until just tender, cool and dice it small — it is what turns a garnish into a snack.',
      'Finely chop the onion, tomato and coriander.',
      'Toss everything with chaat masala, chilli powder and salt.',
      'Squeeze in the lemon just before eating.'
    ],
    tip:'Dress it at the last minute — salt draws water out of the tomato and the whole thing goes soupy.' }),

  R({ id:'chanabanana', n:'Roasted chana and banana', cuisine:'north', slots:['snack'], diet:'vegan',
    time:3, prep:3, cook:0, skill:1, kcal:220, pro:11, carb:36, fat:4,
    ing:{roastchana:40,banana:1},
    steps:[
      'Weigh out the roasted chana.',
      'Peel and slice the banana.',
      'Eat together — the chana brings the protein, the banana the quick energy.'
    ],
    tip:'The cheapest protein hit in the whole plan, and it needs no kitchen at all.' }),

  R({ id:'fruitcurd', n:'Fruit and curd bowl', cuisine:'north', slots:['snack'], diet:'veg',
    time:5, prep:5, cook:0, skill:1, kcal:215, pro:9, carb:32, fat:5,
    ing:{curd:120,banana:0.5,apple:0.5,honey:8},
    steps:[
      'Whisk the curd until smooth and pourable.',
      'Dice the banana and apple.',
      'Fold the fruit through the curd and drizzle with honey.'
    ],
    tip:'Use thick set curd, not the runny kind, or the fruit sinks and sits in whey.' }),

  R({ id:'butterchicken', n:'Butter chicken with roti', cuisine:'north', slots:['lunch','dinner'], diet:'nonveg',
    time:45, prep:18, cook:27, skill:3,
    ing:{chicken:135,atta:70,tomato:75,butter:15,cream:20,curd:30,gg:9,oil:8,garam:2,chpowder:2,methi:1,salt:2},
    steps:[
      'Marinate the chicken in curd, ginger-garlic, chilli powder and salt for at least 30 minutes.',
      'Knead the atta into a soft dough and rest it.',
      'Sear the marinated chicken in a hot pan until charred at the edges, then set aside.',
      'Cook the tomato with butter until completely collapsed, then blend smooth and strain.',
      'Return the puree to the pan with chilli powder and salt and simmer until it darkens.',
      'Add the chicken, cream and crushed kasuri methi and simmer 8 minutes.',
      'Cook the rotis and serve hot.'
    ],
    tip:'Straining the tomato puree is what makes the gravy silky rather than pulpy.' }),

  R({ id:'chickenbiryani', n:'Chicken biryani', cuisine:'north', slots:['lunch','dinner'], diet:'nonveg',
    time:55, prep:20, cook:35, skill:3,
    ing:{chicken:140,rice:90,onion:65,curd:40,gg:10,oil:13,garam:3,chpowder:2,turmeric:1,mint:5,coriander:5,salt:2},
    steps:[
      'Marinate the chicken in curd, ginger-garlic, chilli powder, turmeric and salt for 30 minutes.',
      'Soak the rice 20 minutes, then parboil it in salted water until 70% done and drain.',
      'Fry the sliced onion until deep brown and crisp; keep half back for layering.',
      'Cook the marinated chicken in the same pan until the gravy thickens and clings.',
      'Layer the rice over the chicken, scattering fried onion, mint and coriander between layers.',
      'Cover tightly and cook on the lowest heat for 20 minutes.',
      'Rest 10 minutes before opening, then fold gently from the bottom.'
    ],
    tip:'Parboil the rice to 70% — it finishes cooking in the steam. Fully cooked rice turns to paste.' }),

  R({ id:'keema', n:'Keema matar with roti', cuisine:'north', slots:['lunch','dinner'], diet:'nonveg',
    time:38, prep:12, cook:26, skill:2,
    ing:{chicken:130,atta:70,peas:40,onion:50,tomato:50,gg:9,oil:11,garam:2,chpowder:1,turmeric:1,coriander:4,salt:2},
    steps:[
      'Knead the atta dough and rest it.',
      'Brown the onion in oil, then add ginger-garlic paste.',
      'Add the minced chicken and fry on high, breaking up lumps, until it loses all pink.',
      'Add tomato, turmeric and chilli powder and cook until the oil separates.',
      'Add the peas and half a cup of water, cover and simmer 12 minutes.',
      'Uncover and dry it out, then finish with garam masala and coriander.',
      'Serve with fresh rotis.'
    ],
    tip:'Fry the mince hard before adding liquid — steamed mince stays grey and tastes flat.' }),

  R({ id:'fishtikkamasala', n:'Fish tikka masala with roti', cuisine:'north', slots:['lunch','dinner'], diet:'nonveg',
    time:40, prep:18, cook:22, skill:2,
    ing:{fish:150,atta:70,curd:40,tomato:70,onion:45,cream:15,gg:9,oil:11,garam:2,chpowder:2,turmeric:1,methi:1,lemon:0.4,coriander:4,salt:2},
    steps:[
      'Marinate the fish in curd, ginger-garlic, chilli powder, turmeric, lemon and salt for 20 minutes.',
      'Knead the atta into a soft dough and rest it.',
      'Sear the fish in a very hot pan, 2 minutes a side, until charred at the edges. Lift out and set aside.',
      'In the same pan cook the onion until golden, then the tomato until it collapses and the oil separates.',
      'Blend the sauce smooth if you want it silky, then return it to the pan with a splash of water.',
      'Stir in cream, garam masala and crushed kasuri methi, and simmer 4 minutes.',
      'Slide the fish back in for the last minute only, spooning sauce over it.',
      'Cook the rotis and finish the curry with coriander.'
    ],
    tip:'Char the fish separately and add it at the very end — simmered from raw it breaks into the sauce and disappears.' }),

  R({ id:'omelette', n:'Masala omelette with toast', cuisine:'north', slots:['breakfast','lunch'], diet:'egg',
    time:14, prep:6, cook:8, skill:1,
    ing:{egg:3,bread:2,onion:40,tomato:30,chilli:3,coriander:4,oil:8,turmeric:1,salt:2},
    steps:[
      'Finely chop the onion, tomato, chilli and coriander.',
      'Beat the eggs with salt and turmeric until slightly frothy.',
      'Stir the chopped vegetables into the eggs.',
      'Pour into a hot oiled pan and leave it undisturbed until the edges set.',
      'Fold in half and cook another minute.',
      'Serve with toast.'
    ],
    tip:'Beat air into the eggs and leave the pan alone for the first 30 seconds — that is what makes it fluffy.' }),

  R({ id:'soyabhurji', n:'Soya bhurji with toast', cuisine:'north', slots:['breakfast','lunch'], diet:'vegan',
    time:18, prep:8, cook:10, skill:1,
    ing:{soyagran:40,bread:2,onion:45,tomato:45,capsicum:30,gg:6,oil:9,turmeric:1,chpowder:1,garam:1,coriander:4,salt:2},
    steps:[
      'Soak the soya granules in hot water for 8 minutes, then drain and squeeze out all the water.',
      'Fry the onion and capsicum in oil until soft.',
      'Add ginger-garlic paste, then tomato, turmeric and chilli powder, and cook until thick.',
      'Stir in the squeezed granules and cook 4 minutes so they take up the masala.',
      'Finish with garam masala and coriander, and serve with toast.'
    ],
    tip:'Squeeze the granules properly — waterlogged soya dilutes the masala and tastes of nothing.' }),

  R({ id:'soyacurry', n:'Soya chunk curry with roti', cuisine:'north', slots:['lunch','dinner'], diet:'vegan',
    time:35, prep:12, cook:23, skill:2,
    ing:{soyachunk:50,atta:70,onion:55,tomato:60,gg:9,oil:11,garam:2,chpowder:2,turmeric:1,methi:1,coriander:4,salt:2},
    steps:[
      'Boil the soya chunks 5 minutes, drain, rinse cold and squeeze dry.',
      'Knead the atta into a soft dough and rest it.',
      'Brown the onion in oil, then add ginger-garlic paste and cook out the raw smell.',
      'Add tomato with turmeric and chilli powder and cook until the oil separates.',
      'Add the soya chunks and stir 3 minutes to coat them.',
      'Pour in a cup of water, cover and simmer 12 minutes until the gravy thickens.',
      'Finish with garam masala and crushed kasuri methi, and serve with rotis.'
    ],
    tip:'Soya chunks drink gravy as they sit, so keep it looser than looks right at the pan.' }),

  R({ id:'soyakeema', n:'Soya keema matar with roti', cuisine:'north', slots:['lunch','dinner'], diet:'vegan',
    time:32, prep:12, cook:20, skill:2,
    ing:{soyagran:50,atta:70,peas:40,onion:50,tomato:50,gg:8,oil:11,garam:2,chpowder:1,turmeric:1,coriander:4,salt:2},
    steps:[
      'Soak the soya granules in hot water 8 minutes, drain and squeeze dry.',
      'Knead the atta dough and rest it.',
      'Brown the onion in oil, add ginger-garlic paste.',
      'Add tomato, turmeric and chilli powder and cook until the oil separates.',
      'Add the granules and peas and fry hard for 5 minutes, breaking up any clumps.',
      'Add half a cup of water, cover and simmer 8 minutes, then dry it out.',
      'Finish with garam masala and coriander.'
    ],
    tip:'Fry the granules hard before adding water — it gives the mince-like bite this dish depends on.' }),

  R({ id:'paneerkathi', n:'Paneer kathi roll', cuisine:'north', slots:['lunch','dinner'], diet:'veg',
    time:30, prep:14, cook:16, skill:2,
    ing:{paneer:95,atta:75,onion:45,capsicum:40,curd:35,gg:8,oil:11,chaat:2,garam:2,chpowder:1,lemon:0.4,coriander:5,salt:2},
    steps:[
      'Marinate the paneer strips in curd, ginger-garlic, chilli powder and salt for 15 minutes.',
      'Knead the atta into a soft dough and rest it, then roll and cook thin parathas.',
      'Sear the marinated paneer on high until it catches colour at the edges, then set aside.',
      'In the same pan char the onion and capsicum strips hard and fast so they keep their bite.',
      'Toss the paneer back with garam masala, chaat masala and a squeeze of lemon.',
      'Pile onto a hot paratha, scatter coriander, roll tight and wrap the base in paper.'
    ],
    tip:'Char the onion on the highest heat you have. Softened onion makes a soggy roll; blistered onion makes a great one.' }),

  R({ id:'tofutikka', n:'Tandoori tofu tikka with roti', cuisine:'north', slots:['lunch','dinner'], diet:'vegan',
    time:35, prep:18, cook:17, skill:2,
    ing:{tofu:140,atta:70,capsicum:45,onion:45,besan:10,gg:9,oil:12,chpowder:2,garam:2,chaat:1,lemon:0.4,coriander:4,salt:2},
    steps:[
      'Press the tofu 10 minutes, then cut into thick cubes so they survive the heat.',
      'Whisk besan, ginger-garlic, chilli powder, lemon, oil and salt into a thick marinade.',
      'Coat the tofu and the onion and capsicum chunks, and leave 15 minutes.',
      'Knead and rest the atta dough.',
      'Sear everything in a very hot dry pan, turning only when each face has charred.',
      'Dust with chaat masala and garam masala off the heat.',
      'Cook the rotis and serve with the tikka and a wedge of lemon.'
    ],
    tip:'Besan in the marinade is what makes it cling to tofu — without it the spices slide straight off.' }),

  /* ══════════════════════════ INDO-CHINESE ══════════════════════════ */

  R({ id:'hakka', n:'Veg Hakka noodles', cuisine:'indochinese', slots:['lunch','dinner'], diet:'vegan',
    time:25, prep:12, cook:13, skill:2, kcal:520, pro:14, carb:76, fat:17,
    ing:{noodles:85,cabbage:50,carrot:40,capsicum:35,springonion:20,soy:12,vinegar:5,chillisauce:6,oil:12,pepper:1,salt:1},
    steps:[
      'Boil the noodles until just done, drain, rinse under cold water and toss with a teaspoon of oil.',
      'Shred every vegetable into thin, even matchsticks — this dish is all about the cut.',
      'Heat a wok until it smokes, then add oil.',
      'Throw in the whites of the spring onion, then the carrot, cabbage and capsicum, tossing constantly on the highest heat for 2 minutes.',
      'Add soy sauce, vinegar, chilli sauce, salt and pepper.',
      'Add the noodles and toss with two spatulas to lift and separate rather than stir.',
      'Finish with the spring onion greens.'
    ],
    tip:'Keep the heat brutal and keep everything moving. Vegetables should stay crunchy and slightly charred, never stewed.' }),

  R({ id:'friedrice', n:'Chicken fried rice', cuisine:'indochinese', slots:['lunch','dinner'], diet:'nonveg',
    time:30, prep:12, cook:18, skill:2, kcal:600, pro:32, carb:74, fat:19,
    ing:{chicken:100,rice:85,carrot:35,cabbage:40,capsicum:30,springonion:20,soy:10,oil:12,pepper:1,salt:2},
    steps:[
      'Cook the rice ahead and chill it — day-old rice is genuinely better here.',
      'Dice the chicken small and season with salt and pepper.',
      'Sear the chicken in a smoking-hot wok until cooked through, then remove.',
      'Add more oil and stir-fry the carrot, cabbage and capsicum on high for 2 minutes.',
      'Add the cold rice and press it against the wok to break up clumps.',
      'Return the chicken, add soy sauce, salt and pepper, and toss until every grain is coated.',
      'Finish with spring onion greens.'
    ],
    tip:'Warm rice steams and clumps. Cold rice fries. This is the single thing that separates good from average.' }),

  R({ id:'chillipaneer', n:'Chilli paneer with rice', cuisine:'indochinese', slots:['lunch','dinner'], diet:'veg',
    time:30, prep:12, cook:18, skill:2, kcal:585, pro:24, carb:66, fat:26,
    ing:{paneer:85,rice:80,capsicum:45,onion:40,springonion:15,cornflour:12,soy:12,chillisauce:8,vinegar:5,gg:6,oil:14,pepper:1,salt:2},
    steps:[
      'Cube the paneer and toss in cornflour, salt and pepper until lightly coated.',
      'Cook the rice separately.',
      'Shallow-fry the paneer until golden on all sides, then drain on paper.',
      'In a hot wok fry the ginger-garlic paste, then the onion and capsicum in large square pieces, for 2 minutes.',
      'Add soy sauce, chilli sauce and vinegar and let it bubble.',
      'Slake a teaspoon of cornflour in cold water and stir in to thicken to a glaze.',
      'Return the paneer, toss to coat and finish with spring onion.'
    ],
    tip:'Add the paneer back at the very last moment so the crust survives the sauce.' }),

  R({ id:'manchurian', n:'Veg Manchurian with rice', cuisine:'indochinese', slots:['lunch','dinner'], diet:'vegan',
    time:40, prep:20, cook:20, skill:3, kcal:560, pro:14, carb:78, fat:20,
    ing:{cabbage:80,carrot:50,rice:80,maida:25,cornflour:15,springonion:20,soy:12,chillisauce:8,vinegar:5,gg:8,oil:16,pepper:1,salt:2},
    steps:[
      'Grate the cabbage and carrot very finely, salt them and leave 10 minutes, then squeeze out all the water.',
      'Mix the squeezed vegetables with maida, cornflour and pepper into a stiff mixture that just holds together.',
      'Roll into tight balls and deep- or shallow-fry until deep golden and firm. Drain.',
      'Cook the rice separately.',
      'Fry ginger-garlic paste in a hot wok, add soy, chilli sauce and vinegar with a cup of water.',
      'Thicken with cornflour slurry until the sauce coats a spoon.',
      'Add the balls just before serving so they keep some crispness.'
    ],
    tip:'Squeezing the vegetables dry is the difference between balls that hold and balls that disintegrate in the oil.' }),

  R({ id:'tofunoodle', n:'Tofu noodle stir-fry', cuisine:'indochinese', slots:['lunch','dinner'], diet:'vegan',
    time:25, prep:10, cook:15, skill:2, kcal:520, pro:24, carb:66, fat:17,
    ing:{tofu:100,noodles:80,cabbage:50,carrot:40,capsicum:35,soy:12,oil:11,gg:6,vinegar:4,pepper:1,salt:1},
    steps:[
      'Press the tofu between two plates with a weight for 10 minutes to drive out water.',
      'Cube it and pan-fry in hot oil until golden on at least two sides, then set aside.',
      'Boil the noodles, drain and rinse cold.',
      'Stir-fry ginger-garlic paste, then the carrot, cabbage and capsicum on high for 2 minutes.',
      'Add soy sauce, vinegar, salt and pepper.',
      'Add noodles and tofu and toss until everything is coated and hot.'
    ],
    tip:'Unpressed tofu will not brown — it just steams in its own water and falls apart.' }),

  R({ id:'chillichicken', n:'Chilli chicken with rice', cuisine:'indochinese', slots:['lunch','dinner'], diet:'nonveg',
    time:35, prep:15, cook:20, skill:3, kcal:625, pro:36, carb:68, fat:23,
    ing:{chicken:120,rice:80,capsicum:45,onion:40,springonion:15,cornflour:14,soy:12,chillisauce:8,vinegar:5,gg:8,oil:14,pepper:1,salt:2},
    steps:[
      'Cut the chicken into bite-sized pieces and marinate 15 minutes in soy, pepper and cornflour.',
      'Cook the rice separately.',
      'Fry the chicken in hot oil until browned and just cooked, then remove.',
      'Fry ginger-garlic paste, then onion and capsicum cut into squares, on the highest heat.',
      'Add soy, chilli sauce and vinegar with a splash of water and bring to a bubble.',
      'Thicken with cornflour slurry, return the chicken and toss to glaze.',
      'Finish with spring onion.'
    ],
    tip:'Fry the chicken in two batches. Crowding the pan drops the heat and it stews instead of searing.' }),

  R({ id:'schezwanrice', n:'Schezwan fried rice', cuisine:'indochinese', slots:['lunch','dinner'], diet:'vegan',
    time:22, prep:10, cook:12, skill:2, kcal:505, pro:11, carb:78, fat:16,
    ing:{rice:90,cabbage:45,carrot:40,capsicum:35,springonion:20,chillisauce:12,soy:10,vinegar:4,gg:6,oil:12,pepper:1,salt:2},
    steps:[
      'Use cold, cooked rice with separate grains.',
      'Heat the wok until it smokes and add oil.',
      'Fry ginger-garlic paste for a few seconds, then add all the shredded vegetables.',
      'Toss on the highest heat for 2 minutes so they char slightly but stay crisp.',
      'Add chilli sauce, soy and vinegar and stir once.',
      'Add the rice and toss hard until every grain is coated and steaming.',
      'Finish with spring onion greens and cracked pepper.'
    ],
    tip:'Everything must be chopped and within reach before the wok goes on. There is no time to chop mid-stir-fry.' }),

  R({ id:'chillimushroom', n:'Chilli mushroom', cuisine:'indochinese', slots:['snack'], diet:'vegan',
    time:20, prep:8, cook:12, skill:2, kcal:210, pro:7, carb:22, fat:11,
    ing:{mushroom:110,capsicum:30,onion:25,cornflour:10,soy:8,chillisauce:6,gg:5,oil:9,springonion:10,pepper:1,salt:1},
    steps:[
      'Wipe the mushrooms clean rather than washing them, and halve them.',
      'Toss in cornflour, salt and pepper.',
      'Fry in hot oil until browned at the edges, then set aside.',
      'Fry ginger-garlic paste, onion and capsicum on high for a minute.',
      'Add soy and chilli sauce, return the mushrooms and toss to coat.',
      'Finish with spring onion.'
    ],
    tip:'Washed mushrooms hold water and refuse to brown. A damp cloth is all they need.' }),

  R({ id:'honeypotato', n:'Honey chilli potato', cuisine:'indochinese', slots:['snack'], diet:'veg',
    time:25, prep:10, cook:15, skill:2, kcal:255, pro:4, carb:40, fat:9,
    ing:{potato:130,cornflour:14,honey:10,chillisauce:6,soy:6,vinegar:3,sesame:3,gg:4,oil:10,salt:1},
    steps:[
      'Cut the potato into finger-sized batons and soak in cold water 10 minutes to wash off starch.',
      'Dry them thoroughly and toss in cornflour and salt.',
      'Fry until pale, rest 5 minutes, then fry again until deep golden and crisp.',
      'In a separate pan warm ginger-garlic paste with honey, chilli sauce, soy and vinegar.',
      'Toss the hot potatoes through the glaze and finish with toasted sesame.'
    ],
    tip:'Frying twice is the trick — the first fry cooks, the second crisps. One fry gives you soggy chips.' }),

  R({ id:'eggfriedrice', n:'Egg fried rice', cuisine:'indochinese', slots:['breakfast','lunch','dinner'], diet:'egg',
    time:20, prep:8, cook:12, skill:2, kcal:520, pro:20, carb:72, fat:16,
    ing:{rice:85,egg:2,carrot:35,cabbage:35,springonion:20,soy:10,oil:11,pepper:1,salt:2},
    steps:[
      'Use cold cooked rice with separate grains.',
      'Beat the eggs with a pinch of salt.',
      'Heat the wok until smoking, add oil and scramble the eggs quickly, then push them to one side.',
      'Add the carrot and cabbage and toss on high for 90 seconds.',
      'Add the rice, breaking up any clumps against the wok.',
      'Season with soy, salt and pepper, fold the egg back through and finish with spring onion.'
    ],
    tip:'Scramble the egg first and set it aside — cooking it into the rice makes everything claggy.' }),

  R({ id:'chilligarlicnoodles', n:'Chilli garlic noodles', cuisine:'indochinese', slots:['breakfast','lunch'], diet:'vegan',
    time:18, prep:8, cook:10, skill:1, kcal:470, pro:12, carb:70, fat:16,
    ing:{noodles:80,cabbage:40,springonion:20,gg:8,chillisauce:8,soy:10,vinegar:4,oil:11,pepper:1,salt:1},
    steps:[
      'Boil the noodles until just done, drain and rinse under cold water.',
      'Heat oil and fry the ginger-garlic paste for a few seconds until fragrant but not brown.',
      'Add the shredded cabbage and toss on high for a minute.',
      'Add chilli sauce, soy and vinegar and let it bubble.',
      'Add the noodles and toss until evenly coated and hot through.',
      'Finish with spring onion and cracked pepper.'
    ],
    tip:'Garlic burns in seconds and turns bitter — get the sauces in fast behind it.' }),

  R({ id:'chickenmanchurian', n:'Chicken Manchurian with rice', cuisine:'indochinese', slots:['lunch','dinner'], diet:'nonveg',
    time:40, prep:18, cook:22, skill:3,
    ing:{chicken:130,rice:80,cornflour:15,maida:10,onion:35,capsicum:35,springonion:15,soy:12,chillisauce:8,vinegar:4,gg:9,oil:14,pepper:1,salt:2},
    steps:[
      'Cut the chicken small and coat in cornflour, maida, pepper and salt.',
      'Cook the rice separately.',
      'Fry the coated chicken in hot oil until golden and cooked through, then drain.',
      'In a hot wok fry ginger-garlic paste, then onion and capsicum for a minute.',
      'Add soy, chilli sauce and vinegar with a splash of water and bring to a bubble.',
      'Thicken with a cornflour slurry until the sauce coats a spoon.',
      'Toss the chicken back in and finish with spring onion.'
    ],
    tip:'Sauce the chicken at the last second — sitting in it turns the coating soft.' }),

  R({ id:'chanamanchurian', n:'Crispy chana Manchurian with rice', cuisine:'indochinese', slots:['lunch','dinner'], diet:'vegan',
    time:35, prep:15, cook:20, skill:2,
    ing:{chickpea:75,rice:80,cornflour:15,capsicum:40,onion:35,springonion:15,soy:12,chillisauce:8,vinegar:4,gg:8,oil:13,pepper:1,salt:2},
    steps:[
      'Soak the chana overnight and pressure-cook with salt until soft but still holding shape, then drain very well.',
      'Pat them dry and toss in cornflour, pepper and salt until evenly dusted.',
      'Cook the rice separately.',
      'Shallow-fry the coated chana in hot oil until crisp and blistered, then drain.',
      'In a hot wok fry ginger-garlic paste, then onion and capsicum in squares for a minute.',
      'Add soy, chilli sauce and vinegar with a splash of water and thicken with a cornflour slurry.',
      'Toss the crisp chana through the glaze off the heat and finish with spring onion.'
    ],
    tip:'Dry the chana thoroughly before the cornflour — any moisture and they steam in the oil instead of crisping.' }),

  R({ id:'prawnnoodles', n:'Prawn hakka noodles', cuisine:'indochinese', slots:['lunch','dinner'], diet:'nonveg',
    time:28, prep:14, cook:14, skill:2,
    ing:{prawns:120,noodles:80,cabbage:40,carrot:35,springonion:20,soy:12,vinegar:4,oil:12,gg:7,pepper:1,salt:1},
    steps:[
      'Boil the noodles until just done, drain, rinse cold and toss with a little oil.',
      'Clean the prawns and pat them completely dry.',
      'Sear the prawns in a smoking wok for 90 seconds, then lift them out.',
      'Fry ginger-garlic paste, then the shredded carrot and cabbage on the highest heat for 2 minutes.',
      'Add soy, vinegar, salt and pepper.',
      'Add the noodles and prawns and toss with two spatulas until hot through.',
      'Finish with spring onion.'
    ],
    tip:'Wet prawns steam instead of searing. Dry them properly before they hit the wok.' }),

  R({ id:'chillisoya', n:'Chilli soya chunks', cuisine:'indochinese', slots:['lunch','dinner','snack'], diet:'vegan',
    time:28, prep:12, cook:16, skill:2,
    ing:{soyachunk:55,rice:70,cornflour:12,capsicum:40,onion:35,springonion:15,soy:12,chillisauce:8,vinegar:4,gg:8,oil:13,pepper:1,salt:2},
    steps:[
      'Boil the soya chunks 5 minutes, drain, rinse cold and squeeze completely dry.',
      'Toss the squeezed chunks in cornflour, pepper and salt.',
      'Cook the rice separately.',
      'Shallow-fry the coated chunks until golden and crisp at the edges, then drain.',
      'In a hot wok fry ginger-garlic paste, then onion and capsicum in large squares.',
      'Add soy, chilli sauce and vinegar and let it bubble, then thicken with a cornflour slurry.',
      'Toss the soya back in and finish with spring onion.'
    ],
    tip:'They must be bone dry before the cornflour goes on, or nothing crisps.' }),

  R({ id:'soyafriedrice', n:'Soya fried rice', cuisine:'indochinese', slots:['lunch','dinner'], diet:'vegan',
    time:24, prep:10, cook:14, skill:2,
    ing:{soyachunk:45,rice:85,carrot:35,cabbage:40,capsicum:30,springonion:20,soy:11,oil:12,gg:6,pepper:1,salt:2},
    steps:[
      'Boil the soya chunks 5 minutes, drain, squeeze dry and chop them small.',
      'Use cold cooked rice with separate grains.',
      'Heat the wok until smoking and add oil.',
      'Fry ginger-garlic paste, then the chopped soya, on high until the edges brown.',
      'Add carrot, cabbage and capsicum and toss for 2 minutes.',
      'Add the rice, breaking up clumps, then soy sauce, salt and pepper.',
      'Toss hard until everything is coated and finish with spring onion.'
    ],
    tip:'Chop the soya small. Whole chunks in fried rice never pick up enough sauce.' }),

  R({ id:'tofusatay', n:'Peanut satay tofu bowl', cuisine:'indochinese', slots:['lunch','dinner'], diet:'vegan',
    time:28, prep:14, cook:14, skill:2,
    ing:{tofu:130,rice:80,peanut:28,cabbage:45,carrot:40,springonion:15,soy:12,vinegar:4,chillisauce:6,gg:7,oil:11,salt:1},
    steps:[
      'Press and cube the tofu, then pan-fry in hot oil until golden and firm.',
      'Cook the rice separately.',
      'Crush the peanuts coarsely, keeping a few whole for the top.',
      'Warm the crushed peanuts with ginger-garlic paste, soy, chilli sauce, vinegar and a splash of water into a loose satay sauce.',
      'Shred the cabbage and carrot raw and keep them cold and crunchy.',
      'Build the bowl: rice, the raw slaw, then the tofu, and spoon the warm satay over.',
      'Finish with the reserved peanuts and spring onion.'
    ],
    tip:'Keep the slaw raw and cold against the warm sauce — the temperature contrast is the whole point of the bowl.' }),

  /* ══════════════════════════ CONTINENTAL ══════════════════════════ */

  R({ id:'oats', n:'Masala oats', cuisine:'continental', slots:['breakfast'], diet:'vegan',
    time:15, prep:5, cook:10, skill:1, kcal:300, pro:10, carb:44, fat:9,
    ing:{oats:60,onion:30,carrot:30,peas:20,tomato:30,oil:7,turmeric:1,chpowder:1,pepper:1,salt:2},
    steps:[
      'Heat oil and soften the onion, then add carrot and peas.',
      'Add tomato, turmeric, chilli powder and salt and cook until the tomato breaks down.',
      'Pour in two-and-a-half times the oats\' volume in water and bring to the boil.',
      'Stir in the oats and cook 4 minutes, stirring so they do not catch.',
      'Rest 2 minutes off the heat — they thicken as they stand — and finish with cracked pepper.'
    ],
    tip:'Take them off looser than you want them. Oats keep drinking water after the heat goes off.' }),

  R({ id:'pbtoast', n:'Peanut banana toast', cuisine:'continental', slots:['breakfast','snack'], diet:'vegan',
    time:6, prep:6, cook:0, skill:1, kcal:380, pro:13, carb:52, fat:14,
    ing:{bread:3,peanut:30,banana:1,sugar:5},
    steps:[
      'Toast the bread until firm enough to hold a topping.',
      'Crush or blitz the peanuts into a rough butter, or use it whole and chopped.',
      'Spread over the toast, top with sliced banana and dust with a little sugar.'
    ],
    tip:'Toast it properly. Soft bread collapses under the weight of the topping.' }),

  R({ id:'frenchtoast', n:'French toast', cuisine:'continental', slots:['breakfast'], diet:'egg',
    time:15, prep:5, cook:10, skill:1, kcal:420, pro:18, carb:50, fat:17,
    ing:{bread:3,egg:2,milk:60,sugar:8,butter:8},
    steps:[
      'Whisk the eggs with milk and sugar until completely smooth.',
      'Soak each slice for about 20 seconds a side — long enough to wet through, short enough to hold together.',
      'Melt butter in a pan on medium-low heat.',
      'Cook each slice 2–3 minutes a side until deep golden and set in the middle.'
    ],
    tip:'Medium-low, not high. Hot pans brown the outside while the custard inside stays raw.' }),

  R({ id:'scramble', n:'Scrambled eggs on toast', cuisine:'continental', slots:['breakfast'], diet:'egg',
    time:12, prep:4, cook:8, skill:1, kcal:410, pro:22, carb:32, fat:21,
    ing:{egg:3,bread:2,butter:8,milk:20,pepper:1,salt:2},
    steps:[
      'Beat the eggs with milk, salt and pepper.',
      'Melt butter in a cold pan, then add the eggs and put it on low heat.',
      'Stir slowly and constantly with a spatula, scraping the base.',
      'Pull the pan off the heat while the eggs still look slightly wet.',
      'Serve immediately on hot toast.'
    ],
    tip:'Low and slow gives soft curds. High heat gives rubber.' }),

  R({ id:'muesli', n:'Fruit and oat muesli', cuisine:'continental', slots:['breakfast','snack'], diet:'veg',
    time:8, prep:8, cook:0, skill:1, kcal:390, pro:15, carb:56, fat:12,
    ing:{oats:55,curd:120,banana:1,apple:0.5,almond:12,honey:10},
    steps:[
      'Soak the oats in a little water or milk for 5 minutes to soften.',
      'Whisk the curd smooth and fold it through the oats.',
      'Dice the banana and apple and chop the almonds roughly.',
      'Layer everything together and finish with honey.'
    ],
    tip:'Make it the night before and it becomes overnight oats — better texture, zero morning effort.' }),

  R({ id:'pastared', n:'Pasta in tomato sauce', cuisine:'continental', slots:['lunch','dinner'], diet:'veg',
    time:25, prep:8, cook:17, skill:1, kcal:545, pro:18, carb:76, fat:18,
    ing:{pasta:90,tomato:120,onion:40,capsicum:35,cheese:20,oil:11,gg:6,oregano:1,pepper:1,salt:2},
    steps:[
      'Boil the pasta in well-salted water until al dente, and save a cup of the cooking water.',
      'Fry the onion and ginger-garlic paste in oil until soft.',
      'Add chopped tomato and capsicum with salt and cook down for 8 minutes until thick.',
      'Add herbs and pepper.',
      'Toss the drained pasta through the sauce with a splash of the pasta water to bind it.',
      'Finish with grated cheese.'
    ],
    tip:'That starchy pasta water is what makes the sauce cling instead of sliding off.' }),

  R({ id:'grillchick', n:'Grilled chicken salad', cuisine:'continental', slots:['lunch','dinner'], diet:'nonveg',
    time:25, prep:12, cook:13, skill:2, kcal:430, pro:42, carb:22, fat:20,
    ing:{chicken:150,cabbage:60,carrot:50,capsicum:40,tomato:50,cucumber:50,lemon:0.5,oil:10,pepper:1,oregano:1,salt:2},
    steps:[
      'Flatten the chicken to an even thickness and marinate in oil, lemon, pepper, herbs and salt for 15 minutes.',
      'Grill or pan-sear on high for 4–5 minutes a side until cooked through and well coloured.',
      'Rest the chicken 5 minutes before slicing — this keeps the juices in.',
      'Shred the cabbage and slice the other vegetables thin.',
      'Dress the salad with oil, lemon, salt and pepper.',
      'Slice the chicken across the grain and lay it over the top.'
    ],
    tip:'Resting is not optional. Cut it straight off the heat and the juice ends up on the board.' }),

  R({ id:'vegsandwich', n:'Grilled vegetable sandwich', cuisine:'continental', slots:['lunch','snack'], diet:'veg',
    time:15, prep:8, cook:7, skill:1, kcal:400, pro:14, carb:52, fat:16,
    ing:{bread:4,potato:60,cucumber:40,tomato:40,onion:25,cheese:20,butter:10,chaat:1,pepper:1,salt:1},
    steps:[
      'Boil and slice the potato; slice the cucumber, tomato and onion thinly.',
      'Butter the bread on the outside faces.',
      'Layer the vegetables inside with cheese, sprinkling chaat masala, salt and pepper between layers.',
      'Grill or pan-press until the outside is crisp and the cheese has melted.'
    ],
    tip:'Salt the cucumber and tomato separately and pat them dry, or the sandwich goes soggy in minutes.' }),

  R({ id:'vegbake', n:'Cheesy vegetable bake', cuisine:'continental', slots:['lunch','dinner'], diet:'veg',
    time:40, prep:15, cook:25, skill:2, kcal:520, pro:20, carb:58, fat:23,
    ing:{potato:120,broccoli:70,carrot:50,capsicum:40,cheese:40,milk:80,maida:15,butter:12,pepper:1,oregano:1,salt:2},
    steps:[
      'Parboil the potato, carrot and broccoli for 5 minutes and drain well.',
      'Melt the butter, stir in the flour and cook 1 minute to a paste.',
      'Whisk in the milk gradually over low heat until you have a smooth, thick sauce.',
      'Season with salt, pepper and herbs, then stir in half the cheese.',
      'Fold the vegetables through the sauce and transfer to a baking dish.',
      'Top with the rest of the cheese and bake at 200°C for 20 minutes until browned and bubbling.'
    ],
    tip:'Drain the parboiled vegetables thoroughly — trapped water thins the sauce into soup.' }),

  R({ id:'tomatosoup', n:'Tomato soup with toast', cuisine:'continental', slots:['dinner','snack'], diet:'veg',
    time:25, prep:8, cook:17, skill:1, kcal:330, pro:10, carb:44, fat:13,
    ing:{tomato:180,onion:35,carrot:30,bread:2,butter:10,cream:15,gg:5,pepper:1,oregano:1,salt:2},
    steps:[
      'Roughly chop the tomato, onion and carrot.',
      'Soften them in butter with ginger-garlic paste for 5 minutes.',
      'Add two cups of water and simmer 12 minutes until everything is soft.',
      'Blend smooth and pass through a sieve if you want it silky.',
      'Return to the heat, season, and stir in the cream off the boil.',
      'Serve with toast fingers.'
    ],
    tip:'Add the cream off the heat. Boiling it after will split the soup.' }),

  R({ id:'cheesetoast', n:'Chilli cheese toast', cuisine:'continental', slots:['snack'], diet:'veg',
    time:10, prep:5, cook:5, skill:1, kcal:245, pro:11, carb:26, fat:11,
    ing:{bread:2,cheese:35,capsicum:20,onion:15,chilli:2,butter:6,oregano:1,pepper:1},
    steps:[
      'Finely chop the capsicum, onion and green chilli.',
      'Mix them into the grated cheese with herbs and pepper.',
      'Butter the bread and pile the mixture on thickly.',
      'Grill or bake at 200°C until the cheese melts and browns in patches.'
    ],
    tip:'Grate the cheese rather than slicing it — it melts evenly instead of sliding off in one sheet.' }),

  R({ id:'shakshuka', n:'Shakshuka with crusty toast', cuisine:'continental', slots:['lunch','dinner','breakfast'], diet:'egg',
    time:30, prep:10, cook:20, skill:2,
    ing:{egg:3,bread:3,tomato:180,capsicum:60,onion:50,gg:8,oil:12,chpowder:1,cumin:2,oregano:1,pepper:1,coriander:5,salt:2},
    steps:[
      'Soften the onion and capsicum in oil until they start to catch colour.',
      'Add ginger-garlic paste, cumin and chilli powder and fry 30 seconds.',
      'Add the chopped tomato with salt and cook down 10 minutes into a thick, jammy sauce.',
      'Make three wells in the sauce with the back of a spoon.',
      'Crack an egg into each well, cover the pan and cook on low 6–8 minutes until the whites set but the yolks still wobble.',
      'Scatter coriander and cracked pepper over the top and take the whole pan to the table with toast.'
    ],
    tip:'Cover the pan and keep the heat low — that steams the tops of the eggs without turning the yolks solid.' }),

  R({ id:'creamypasta', n:'Creamy chicken pasta', cuisine:'continental', slots:['lunch','dinner'], diet:'nonveg',
    time:30, prep:10, cook:20, skill:2, kcal:610, pro:36, carb:70, fat:22,
    ing:{pasta:90,chicken:110,milk:100,maida:12,butter:12,capsicum:35,onion:30,cheese:20,gg:6,pepper:1,oregano:1,salt:2},
    steps:[
      'Boil the pasta in salted water until al dente and reserve a cup of the water.',
      'Dice the chicken, season, and sear in butter until browned and cooked through. Remove.',
      'In the same pan soften the onion and capsicum with ginger-garlic paste.',
      'Stir in the flour and cook a minute, then whisk in the milk slowly to a smooth sauce.',
      'Season with salt, pepper and herbs, and melt in the cheese.',
      'Return the chicken, add the pasta, and loosen with pasta water until it coats properly.'
    ],
    tip:'Whisk the milk in a little at a time. Dumping it all at once guarantees lumps.' }),

  R({ id:'bakedfish', n:'Herb baked fish with potato', cuisine:'continental', slots:['lunch','dinner'], diet:'nonveg',
    time:35, prep:12, cook:23, skill:2, kcal:520, pro:38, carb:52, fat:18,
    ing:{fish:140,potato:150,carrot:50,beans:40,lemon:0.5,butter:12,oil:8,gg:6,pepper:1,oregano:1,salt:2},
    steps:[
      'Marinate the fish in lemon, ginger-garlic, herbs, pepper and salt for 15 minutes.',
      'Parboil the potato wedges for 6 minutes and drain.',
      'Toss the potato, carrot and beans in oil, salt and herbs and spread on a tray.',
      'Roast at 200°C for 12 minutes.',
      'Lay the fish on top, dot with butter and bake another 10–12 minutes until it flakes.',
      'Finish with a squeeze of lemon.'
    ],
    tip:'Fish is done when it flakes at a gentle push. Past that it dries out fast.' }),

  R({ id:'mushroomrice', n:'Mushroom and corn rice', cuisine:'continental', slots:['lunch','dinner'], diet:'veg',
    time:28, prep:10, cook:18, skill:2, kcal:520, pro:15, carb:74, fat:18,
    ing:{rice:85,mushroom:100,babycorn:50,onion:35,capsicum:35,cheese:20,butter:12,gg:6,milk:40,pepper:1,oregano:1,salt:2},
    steps:[
      'Cook the rice and spread it out to stop it clumping.',
      'Wipe and slice the mushrooms; halve the baby corn lengthways.',
      'Sear the mushrooms in butter on high until browned — do not crowd the pan.',
      'Add onion, capsicum, baby corn and ginger-garlic paste and cook 3 minutes.',
      'Pour in the milk, season with salt, pepper and herbs, and let it thicken slightly.',
      'Fold the rice through and finish with grated cheese.'
    ],
    tip:'Mushrooms release water before they brown. Wait through the wet stage on high heat.' }),

  R({ id:'chickpeasalad', n:'Chickpea and vegetable salad bowl', cuisine:'continental', slots:['lunch','snack'], diet:'vegan',
    time:18, prep:15, cook:3, skill:1, kcal:420, pro:17, carb:56, fat:14,
    ing:{chickpea:70,cucumber:60,tomato:60,onion:30,capsicum:35,lemon:0.5,oil:10,pepper:1,oregano:1,chaat:1,salt:1},
    steps:[
      'Soak the chana overnight and pressure-cook with salt until soft but still holding shape.',
      'Drain and cool completely.',
      'Dice the cucumber, tomato, onion and capsicum to roughly the size of the chana.',
      'Whisk oil, lemon, salt, pepper, herbs and chaat masala into a dressing.',
      'Toss everything together and rest 5 minutes before eating.'
    ],
    tip:'Dress it just before serving — sitting in lemon turns the vegetables limp and watery.' }),

  R({ id:'chickensandwich', n:'Grilled chicken sandwich', cuisine:'continental', slots:['lunch','snack'], diet:'nonveg',
    time:20, prep:10, cook:10, skill:1,
    ing:{chicken:110,bread:4,cheese:20,cucumber:30,tomato:35,onion:20,butter:8,pepper:1,oregano:1,salt:1},
    steps:[
      'Flatten the chicken to an even thickness and season with salt, pepper and herbs.',
      'Sear in butter 4 minutes a side until cooked through, then rest and slice.',
      'Butter the bread on the outside faces.',
      'Layer the chicken with cheese, cucumber, tomato and onion.',
      'Grill or pan-press until crisp outside and the cheese has melted.'
    ],
    tip:'Rest the chicken before slicing or the juice runs into the bread and softens it.' }),

  R({ id:'soyapasta', n:'Soya mince pasta', cuisine:'continental', slots:['lunch','dinner'], diet:'vegan',
    time:28, prep:10, cook:18, skill:1,
    ing:{soyagran:45,pasta:85,tomato:120,onion:40,capsicum:35,gg:7,oil:11,oregano:1,chpowder:1,pepper:1,salt:2},
    steps:[
      'Soak the soya granules in hot water 8 minutes, drain and squeeze dry.',
      'Boil the pasta in well-salted water until al dente and save a cup of the water.',
      'Fry the onion and ginger-garlic paste in oil, then add the granules and brown them.',
      'Add chopped tomato and capsicum with salt and herbs and cook down 8 minutes.',
      'Toss the pasta through with a splash of the cooking water to bind the sauce.',
      'Finish with cracked pepper.'
    ],
    tip:'Brown the soya before the tomato goes in — it is the difference between meaty and mushy.' }),

  R({ id:'soyasalad', n:'Soya and vegetable salad bowl', cuisine:'continental', slots:['lunch','snack'], diet:'vegan',
    time:20, prep:15, cook:5, skill:1,
    ing:{soyachunk:45,cucumber:60,tomato:55,onion:30,capsicum:35,lemon:0.5,oil:10,pepper:1,oregano:1,chaat:1,salt:1},
    steps:[
      'Boil the soya chunks 5 minutes, drain, rinse cold and squeeze dry.',
      'Chop them roughly and let them cool completely.',
      'Dice the cucumber, tomato, onion and capsicum to a similar size.',
      'Whisk oil, lemon, salt, pepper, herbs and chaat masala into a dressing.',
      'Toss everything together and rest 5 minutes before eating.'
    ],
    tip:'Cool the soya before dressing it — warm chunks wilt the vegetables around them.' }),

  R({ id:'tofuscramble', n:'Turmeric tofu scramble on toast', cuisine:'continental', slots:['breakfast','lunch'], diet:'vegan',
    time:16, prep:7, cook:9, skill:1,
    ing:{tofu:140,bread:2,onion:40,tomato:40,capsicum:30,oil:9,turmeric:1,pepper:1,chilli:2,coriander:4,salt:2},
    steps:[
      'Press the tofu briefly, then crumble it by hand into rough curds — a fork makes it too fine.',
      'Fry the onion and capsicum in oil until soft.',
      'Add tomato, turmeric and chilli and cook until the tomato collapses.',
      'Fold in the crumbled tofu and cook 3 minutes, stirring gently so the curds stay chunky.',
      'Season hard with salt and pepper, finish with coriander and pile onto hot toast.'
    ],
    tip:'Crumble by hand and stir gently. Over-stirred tofu turns to paste and stops looking like scramble.' }),

  R({ id:'paneerwrap', n:'Paneer and mint yoghurt wrap', cuisine:'continental', slots:['lunch','snack'], diet:'veg',
    time:20, prep:12, cook:8, skill:1,
    ing:{paneer:90,bread:2,atta:60,curd:45,cucumber:40,tomato:35,onion:25,mint:6,oil:9,chaat:2,pepper:1,lemon:0.3,salt:1},
    steps:[
      'Cut the paneer into fingers and toss with chaat masala, pepper, lemon and salt.',
      'Sear them in a hot pan until browned on two sides — no longer, or they toughen.',
      'Blitz or finely chop the mint into the curd with a pinch of salt to make the dressing.',
      'Roll and cook a thin flatbread from the atta.',
      'Spread the mint yoghurt, add cucumber, tomato and onion, then the hot paneer.',
      'Roll tight and cut on the diagonal.'
    ],
    tip:'Dress the salad and the paneer separately — mixing them early makes the wrap leak before you eat it.' }),

  R({ id:'boiledegg', n:'Boiled eggs with salt and pepper', cuisine:'continental', slots:['snack'], diet:'egg',
    time:10, prep:2, cook:8, skill:1, kcal:160, pro:13, carb:1, fat:11,
    ing:{egg:2,pepper:1,salt:1},
    steps:[
      'Lower the eggs into already-boiling water rather than starting them cold.',
      'Boil 8 minutes for firm yolks, 6 for soft.',
      'Move straight into cold water and leave 2 minutes.',
      'Peel under running water, then season.'
    ],
    tip:'The cold plunge stops the cooking and makes them peel cleanly.' }),

  R({ id:'prawnrice', n:'Garlic prawn rice', cuisine:'continental', slots:['lunch','dinner'], diet:'nonveg',
    time:28, prep:12, cook:16, skill:2, kcal:540, pro:34, carb:68, fat:16,
    ing:{prawns:110,rice:85,capsicum:40,onion:35,tomato:40,gg:8,butter:10,oil:8,lemon:0.4,pepper:1,oregano:1,salt:2},
    steps:[
      'Clean and devein the prawns, pat them dry and season with salt and pepper.',
      'Cook the rice separately and keep warm.',
      'Sear the prawns in hot butter and oil for 90 seconds a side, then lift them out immediately.',
      'In the same pan cook ginger-garlic paste, onion and capsicum until soft.',
      'Add tomato and herbs and cook to a loose sauce.',
      'Fold the rice through, return the prawns, and finish with lemon.'
    ],
    tip:'Prawns need about three minutes total. Any longer and they tighten into rubber.' })
];

/* ---------------------- derived recipe metadata ---------------------- */

/**
 * Macros are COMPUTED from the ingredient list, never taken on trust from the
 * recipe entry. A dish with no protein source cannot report a high protein
 * figure, because nothing in the sum puts it there.
 */
function macrosOf(r) {
  let kcal = 0, pro = 0, carb = 0, fat = 0;
  for (const k in r.ing) {
    const g = ING[k];
    if (!g) continue;
    // `pc` ingredients are priced and counted per piece; everything else per 100 units.
    const mult = g.u === 'pc' ? r.ing[k] : r.ing[k] / 100;
    kcal += g.nut[0] * mult;
    pro  += g.nut[1] * mult;
    carb += g.nut[2] * mult;
    fat  += g.nut[3] * mult;
  }
  return { kcal: Math.round(kcal), pro: Math.round(pro),
           carb: Math.round(carb), fat: Math.round(fat) };
}


const recipeAllergens = r => {
  const s = new Set();
  for (const k in r.ing) (ING[k]?.al || []).forEach(a => s.add(a));
  return s;
};

RECIPES.forEach(r => {
  r.allerg = [...recipeAllergens(r)];

  const m = macrosOf(r);
  r.kcal = m.kcal; r.pro = m.pro; r.carb = m.carb; r.fat = m.fat;
  // Ingredients that do not exist in the pantry are a data bug, not a runtime
  // condition — surface them loudly during development.
  for (const k in r.ing) {
    if (!ING[k]) console.error(`Recipe "${r.id}" uses unknown ingredient "${k}"`);
  }
});

const dietOK = (r, user) => DIET_RANK[r.diet] <= DIET_RANK[user];

/* --------------------------------------------------------------------------
   Dominant protein source
   --------------------------------------------------------------------------
   Which ingredient actually carries the dish. Computed, not declared, so it
   cannot drift from the recipe: whichever ingredient contributes the most
   protein names the family. This is what lets the planner rotate between
   paneer, soya, tofu and the rest instead of leaning on whichever is cheapest.
   -------------------------------------------------------------------------- */
const PROTEIN_FAMILY = {
  chicken:'meat',
  fish:'fish', prawns:'fish',
  egg:'egg',
  paneer:'paneer', cheese:'paneer',
  curd:'dairy', milk:'dairy', cream:'dairy',
  tofu:'tofu',
  soyachunk:'soya', soyagran:'soya',
  toor:'legume', moong:'legume', urad:'legume', chana:'legume', rajma:'legume',
  chickpea:'legume', sprouts:'legume', roastchana:'legume', besan:'legume',
  peanut:'nut', cashew:'nut', almond:'nut', coconut:'nut'
};

RECIPES.forEach(r => {
  let bestKey = null, bestPro = 0;
  for (const k in r.ing) {
    const g = ING[k];
    if (!g) continue;
    const pro = g.nut[1] * (g.u === 'pc' ? r.ing[k] : r.ing[k] / 100);
    if (pro > bestPro) { bestPro = pro; bestKey = k; }
  }
  // A dish whose biggest protein contributor is rice or atta has no real
  // protein source, and is labelled as such rather than being credited to one.
  r.psrc = (bestKey && PROTEIN_FAMILY[bestKey]) ? PROTEIN_FAMILY[bestKey] : 'grain';
  r.psrcPro = Math.round(bestPro * 10) / 10;
});
