import datetime
import random
import logging
from database import get_db

logger = logging.getLogger(__name__)

def seed_all_data():
    db = get_db()
    
    # Clear collections
    logger.info("Clearing collections...")
    db.profiles.delete_many({})
    db.transactions.delete_many({})
    db.mandi_prices.delete_many({})
    db.weather.delete_many({})
    db.emi.delete_many({})
    db.alerts.delete_many({})
    db.field_visits.delete_many({})

    # 1. Seed Business Profiles (15 micro-enterprises)
    logger.info("Seeding 15 business profiles...")
    profiles = [
        {
            "id": "ramesh_dairy",
            "ownerName": "Ramesh Patel",
            "businessName": "Patel Dairy & Milk Collection",
            "businessType": "Dairy Farm",
            "village": "Kalyanpur",
            "district": "Anand",
            "preferredLanguage": "gu",
            "loanDetails": "SBI Agri-Infrastructure Loan: ₹1,50,000 remaining",
            "upiLinked": True,
            "smsPermission": True,
            "consentSettings": { "sms": True, "upi": True, "mandi": True, "weather": True },
            "phone": "9876543210",
            "aadharLast4": "4521",
            "estimatedMonthlyIncome": 28000,
            "yearsInOperation": 7,
            "primaryIncomeSource": "Amul Dairy Collection",
            "initialCashBuffer": 20000,
            "healthScore": 84,
            "cashRunwayDays": 45,
            "riskLevel": "YELLOW"
        },
        {
            "id": "sunita_kirana",
            "ownerName": "Sunita Sharma",
            "businessName": "Sharma Kirana & General Store",
            "businessType": "Kirana Store",
            "village": "Rampur",
            "district": "Patna",
            "preferredLanguage": "hi",
            "loanDetails": "MUDRA Shishu Loan: ₹28,000 remaining",
            "upiLinked": True,
            "smsPermission": True,
            "consentSettings": { "sms": True, "upi": True, "mandi": False, "weather": True },
            "phone": "9812345678",
            "aadharLast4": "7834",
            "estimatedMonthlyIncome": 18000,
            "yearsInOperation": 3,
            "primaryIncomeSource": "Kirana Retail Sales",
            "initialCashBuffer": 8000,
            "healthScore": 62,
            "cashRunwayDays": 18,
            "riskLevel": "RED"
        },
        {
            "id": "gopi_poultry",
            "ownerName": "Gopi Krishna",
            "businessName": "Sri Krishna Poultry Farm",
            "businessType": "Poultry Farm",
            "village": "Guntakal",
            "district": "Anantapur",
            "preferredLanguage": "te",
            "loanDetails": "NABARD Poultry Scheme: ₹2,10,000 remaining",
            "upiLinked": True,
            "smsPermission": True,
            "consentSettings": { "sms": True, "upi": True, "mandi": True, "weather": True },
            "phone": "9765432109",
            "aadharLast4": "2267",
            "estimatedMonthlyIncome": 42000,
            "yearsInOperation": 5,
            "primaryIncomeSource": "Egg & Broiler Sales",
            "initialCashBuffer": 32000,
            "healthScore": 91,
            "cashRunwayDays": 75,
            "riskLevel": "GREEN"
        },
        {
            "id": "anil_tailor",
            "ownerName": "Anil Verma",
            "businessName": "Verma Tailoring & Boutique",
            "businessType": "Tailoring Shop",
            "village": "Pipariya",
            "district": "Indore",
            "preferredLanguage": "hi",
            "loanDetails": "MUDRA Kishor Loan: ₹85,000 remaining",
            "upiLinked": True,
            "smsPermission": True,
            "consentSettings": { "sms": True, "upi": True, "mandi": False, "weather": True },
            "phone": "9823456789",
            "aadharLast4": "1098",
            "estimatedMonthlyIncome": 22000,
            "yearsInOperation": 4,
            "primaryIncomeSource": "Custom Apparel Stitching",
            "initialCashBuffer": 12000,
            "healthScore": 86,
            "cashRunwayDays": 50,
            "riskLevel": "GREEN"
        },
        {
            "id": "radha_weaving",
            "ownerName": "Radha Subramaniam",
            "businessName": "Laxmi Handloom Weavers",
            "businessType": "Handloom Weaving",
            "village": "Elampillai",
            "district": "Salem",
            "preferredLanguage": "ta",
            "loanDetails": "TNHDC Weaver Loan: ₹60,000 remaining",
            "upiLinked": True,
            "smsPermission": True,
            "consentSettings": { "sms": True, "upi": False, "mandi": True, "weather": True },
            "phone": "9442345678",
            "aadharLast4": "5532",
            "estimatedMonthlyIncome": 20000,
            "yearsInOperation": 10,
            "primaryIncomeSource": "Saree Wholesale Sales",
            "initialCashBuffer": 15000,
            "healthScore": 78,
            "cashRunwayDays": 38,
            "riskLevel": "YELLOW"
        },
        {
            "id": "mohan_tea",
            "ownerName": "Mohan Joshi",
            "businessName": "Joshi Tea Stall & Snacks",
            "businessType": "Tea Stall",
            "village": "Loni Kalbhor",
            "district": "Pune",
            "preferredLanguage": "mr",
            "loanDetails": "Co-operative Bank Loan: ₹20,000 remaining",
            "upiLinked": True,
            "smsPermission": True,
            "consentSettings": { "sms": True, "upi": True, "mandi": False, "weather": True },
            "phone": "9552345678",
            "aadharLast4": "8871",
            "estimatedMonthlyIncome": 16000,
            "yearsInOperation": 6,
            "primaryIncomeSource": "Daily Food & Beverage Sales",
            "initialCashBuffer": 6000,
            "healthScore": 68,
            "cashRunwayDays": 22,
            "riskLevel": "YELLOW"
        },
        {
            "id": "kamla_handicraft",
            "ownerName": "Kamla Devi",
            "businessName": "Mewar Wooden Toys & Art",
            "businessType": "Wooden Handicrafts",
            "village": "Shilpgram",
            "district": "Udaipur",
            "preferredLanguage": "hi",
            "loanDetails": "SIDBI Micro-Finance: ₹45,000 remaining",
            "upiLinked": True,
            "smsPermission": True,
            "consentSettings": { "sms": True, "upi": True, "mandi": True, "weather": False },
            "phone": "9662345678",
            "aadharLast4": "3321",
            "estimatedMonthlyIncome": 24000,
            "yearsInOperation": 5,
            "primaryIncomeSource": "Tourist Craft Sales",
            "initialCashBuffer": 14000,
            "healthScore": 82,
            "cashRunwayDays": 42,
            "riskLevel": "YELLOW"
        },
        {
            "id": "vikram_fertilizer",
            "ownerName": "Vikram Singh",
            "businessName": "Singh Kisan Agri-Inputs",
            "businessType": "Agri-Input Store",
            "village": "Sahnewal",
            "district": "Ludhiana",
            "preferredLanguage": "pa",
            "loanDetails": "PFC Fertilizer Credit: ₹3,50,000 remaining",
            "upiLinked": True,
            "smsPermission": True,
            "consentSettings": { "sms": True, "upi": True, "mandi": True, "weather": True },
            "phone": "9772345678",
            "aadharLast4": "9982",
            "estimatedMonthlyIncome": 65000,
            "yearsInOperation": 12,
            "primaryIncomeSource": "Seeds & Chemical Sales",
            "initialCashBuffer": 50000,
            "healthScore": 94,
            "cashRunwayDays": 90,
            "riskLevel": "GREEN"
        },
        {
            "id": "savita_beauty",
            "ownerName": "Savita Patel",
            "businessName": "Savita Ladies Beauty Parlour",
            "businessType": "Beauty Parlour",
            "village": "Visnagar",
            "district": "Mehsana",
            "preferredLanguage": "gu",
            "loanDetails": "Dena Gujarat Gramin Bank: ₹25,000 remaining",
            "upiLinked": True,
            "smsPermission": True,
            "consentSettings": { "sms": True, "upi": True, "mandi": False, "weather": True },
            "phone": "9882345678",
            "aadharLast4": "4439",
            "estimatedMonthlyIncome": 19000,
            "yearsInOperation": 3,
            "primaryIncomeSource": "Salon & Makeup Services",
            "initialCashBuffer": 9000,
            "healthScore": 79,
            "cashRunwayDays": 30,
            "riskLevel": "YELLOW"
        },
        {
            "id": "rajesh_repair",
            "ownerName": "Rajesh Goud",
            "businessName": "Sri Sai Mobile & Electronic Services",
            "businessType": "Electronics Repair",
            "village": "Hanamkonda",
            "district": "Warangal",
            "preferredLanguage": "te",
            "loanDetails": "MUDRA Shishu Loan: ₹15,000 remaining",
            "upiLinked": True,
            "smsPermission": True,
            "consentSettings": { "sms": True, "upi": True, "mandi": False, "weather": True },
            "phone": "9992345678",
            "aadharLast4": "6671",
            "estimatedMonthlyIncome": 21000,
            "yearsInOperation": 4,
            "primaryIncomeSource": "Device Repairs & Accessories",
            "initialCashBuffer": 11000,
            "healthScore": 81,
            "cashRunwayDays": 40,
            "riskLevel": "YELLOW"
        },
        {
            "id": "harish_pottery",
            "ownerName": "Harish Mohanty",
            "businessName": "Kalinga Clay Art & Pottery",
            "businessType": "Pottery Workshop",
            "village": "Balakati",
            "district": "Khurda",
            "preferredLanguage": "or",
            "loanDetails": "Khadi Gramodyog (KVIC): ₹35,000 remaining",
            "upiLinked": False,
            "smsPermission": True,
            "consentSettings": { "sms": True, "upi": False, "mandi": True, "weather": True },
            "phone": "9112345678",
            "aadharLast4": "2289",
            "estimatedMonthlyIncome": 13000,
            "yearsInOperation": 8,
            "primaryIncomeSource": "Traditional Pottery Sales",
            "initialCashBuffer": 7000,
            "healthScore": 71,
            "cashRunwayDays": 25,
            "riskLevel": "YELLOW"
        },
        {
            "id": "fatima_bakery",
            "ownerName": "Fatima Bi",
            "businessName": "Fatima Home Bakery",
            "businessType": "Home Bakery",
            "village": "Malihabad",
            "district": "Lucknow",
            "preferredLanguage": "ur",
            "loanDetails": "Co-operative Mahila Bank: ₹30,000 remaining",
            "upiLinked": True,
            "smsPermission": True,
            "consentSettings": { "sms": True, "upi": True, "mandi": False, "weather": True },
            "phone": "9222345678",
            "aadharLast4": "7712",
            "estimatedMonthlyIncome": 17000,
            "yearsInOperation": 2,
            "primaryIncomeSource": "Cookies & Bread Retail",
            "initialCashBuffer": 8000,
            "healthScore": 74,
            "cashRunwayDays": 28,
            "riskLevel": "YELLOW"
        },
        {
            "id": "samir_carpenter",
            "ownerName": "Samir Das",
            "businessName": "Das Wooden Furniture Maker",
            "businessType": "Carpentry Shop",
            "village": "Katwa",
            "district": "Burdwan",
            "preferredLanguage": "bn",
            "loanDetails": "SBI Business Loan: ₹1,20,000 remaining",
            "upiLinked": True,
            "smsPermission": True,
            "consentSettings": { "sms": True, "upi": True, "mandi": True, "weather": False },
            "phone": "9332345678",
            "aadharLast4": "9933",
            "estimatedMonthlyIncome": 34000,
            "yearsInOperation": 9,
            "primaryIncomeSource": "Custom Furniture Sales",
            "initialCashBuffer": 25000,
            "healthScore": 88,
            "cashRunwayDays": 55,
            "riskLevel": "GREEN"
        },
        {
            "id": "dev_sweet",
            "ownerName": "Dev Dutt",
            "businessName": "Ganga Mishthan Bhandar",
            "businessType": "Sweet Shop",
            "village": "Sarnath",
            "district": "Varanasi",
            "preferredLanguage": "hi",
            "loanDetails": "Union Bank Loan: ₹80,000 remaining",
            "upiLinked": True,
            "smsPermission": True,
            "consentSettings": { "sms": True, "upi": True, "mandi": True, "weather": True },
            "phone": "9442345612",
            "aadharLast4": "1144",
            "estimatedMonthlyIncome": 45000,
            "yearsInOperation": 15,
            "primaryIncomeSource": "Traditional Sweets Retail",
            "initialCashBuffer": 30000,
            "healthScore": 90,
            "cashRunwayDays": 64,
            "riskLevel": "GREEN"
        },
        {
            "id": "laxmi_fishery",
            "ownerName": "Laxmi Nair",
            "businessName": "Nair Fish Farming Pond",
            "businessType": "Inland Fishery",
            "village": "Angamaly",
            "district": "Ernakulam",
            "preferredLanguage": "ml",
            "loanDetails": "Kerala Fisheries Credit: ₹1,80,000 remaining",
            "upiLinked": True,
            "smsPermission": True,
            "consentSettings": { "sms": True, "upi": True, "mandi": True, "weather": True },
            "phone": "9552345612",
            "aadharLast4": "6688",
            "estimatedMonthlyIncome": 38000,
            "yearsInOperation": 5,
            "primaryIncomeSource": "Fish Harvest Payout",
            "initialCashBuffer": 24000,
            "healthScore": 83,
            "cashRunwayDays": 48,
            "riskLevel": "GREEN"
        }
    ]
    db.profiles.insert_many(profiles)

    # 2. Seed Transactions dynamically to ensure dense, realistic history (15+ per profile)
    logger.info("Seeding dense transaction logs...")
    txns = []
    
    # Base templates for generating realistic transactions
    tx_templates = {
        "Dairy Farm": [
            ("Milk Payout (Amul Co-op)", "Income", [7000, 8500], "UPI"),
            ("Cattle Feed Purchase", "Expense", [2500, 3500], "UPI"),
            ("Veterinary Services", "Expense", [800, 1500], "SMS"),
            ("Fodder Grass Subsidy", "Income", [1500, 2500], "Bank"),
            ("Barn Power/Water Bill", "Expense", [1000, 1800], "SMS"),
            ("Retail Milk Sales", "Income", [3000, 4800], "Cash"),
        ],
        "Kirana Store": [
            ("Daily Kirana Sales UPI", "Income", [2500, 4000], "UPI"),
            ("Bulk Grocery Refill", "Expense", [6000, 9500], "UPI"),
            ("Customer Cash Sales", "Income", [1500, 3000], "Cash"),
            ("Premises Rent Payout", "Expense", [2500, 3500], "Bank"),
            ("Shop Electric Bill", "Expense", [800, 1400], "SMS"),
            ("Supplier Payment (Unilever)", "Expense", [4000, 6000], "UPI"),
        ],
        "Poultry Farm": [
            ("Egg Batch Payout", "Income", [12000, 16000], "UPI"),
            ("Feed Stocks Order", "Expense", [8000, 11000], "UPI"),
            ("Bird Vaccination Lot", "Expense", [2000, 3000], "SMS"),
            ("Broiler Sale (Cash)", "Income", [6000, 9000], "Cash"),
            ("Coop Power & Heating Bill", "Expense", [1500, 2500], "SMS"),
            ("Poultry Hatchery Supply", "Expense", [5000, 7500], "Bank"),
        ],
        "Tailoring Shop": [
            ("Boutique Order Advance", "Income", [4000, 6500], "UPI"),
            ("Fabric Rolls Purchase", "Expense", [3000, 5000], "UPI"),
            ("Stitching Thread & Needles", "Expense", [400, 900], "Cash"),
            ("Custom Dress Commission", "Income", [2500, 4500], "UPI"),
            ("Sewing Machine AMC Fee", "Expense", [1000, 1500], "Bank"),
            ("Fitting Alteration Cash", "Income", [1000, 2000], "Cash"),
        ],
        "Handloom Weaving": [
            ("Saree Lot Consignment", "Income", [9000, 13000], "UPI"),
            ("Raw Silk & Cotton Yarn", "Expense", [5000, 8000], "UPI"),
            ("Weaving Dyes & Starch", "Expense", [600, 1200], "Cash"),
            ("Handloom Cooperative Bonus", "Income", [3000, 5000], "Bank"),
            ("Loom Shed Power Bill", "Expense", [1200, 2000], "SMS"),
            ("Exhibition Stall Direct Sale", "Income", [4000, 7000], "Cash"),
        ],
        "Tea Stall": [
            ("Daily Tea Stall UPI", "Income", [1200, 2200], "UPI"),
            ("Milk & Sugar Daily Stock", "Expense", [600, 1100], "Cash"),
            ("LPG Gas Cylinder Refill", "Expense", [900, 1250], "SMS"),
            ("Snack Wholesale Order", "Expense", [1500, 2500], "UPI"),
            ("Stall Stall Rent Payout", "Expense", [1000, 1500], "Bank"),
            ("Daily Cash Tea Receipts", "Income", [1000, 1800], "Cash"),
        ],
        "Wooden Handicrafts": [
            ("Wooden Toy Batch Sale", "Income", [6000, 9500], "UPI"),
            ("Teak & Rosewood logs", "Expense", [4000, 7000], "UPI"),
            ("Wood Polish & Sandpaper", "Expense", [500, 1100], "Cash"),
            ("Artisan Guild Subsidy", "Income", [2000, 4000], "Bank"),
            ("Workshop Electric Bill", "Expense", [1000, 1600], "SMS"),
            ("Retail Tourist Cash Sale", "Income", [3000, 5000], "Cash"),
        ],
        "Agri-Input Store": [
            ("Seed/Urea Retail Sale", "Income", [15000, 25000], "UPI"),
            ("Wholesale Supply Restock", "Expense", [25000, 40000], "UPI"),
            ("Government Dealer License", "Expense", [3000, 6000], "Bank"),
            ("Pesticide Bulk Consignment", "Expense", [10000, 18000], "UPI"),
            ("Cash Sale Fertilisers", "Income", [8000, 14000], "Cash"),
            ("Store Power & Warehouse Bill", "Expense", [2000, 3500], "SMS"),
        ],
        "Beauty Parlour": [
            ("Bridal Makeup Advance", "Income", [5000, 8500], "UPI"),
            ("Cosmetics Product Lot", "Expense", [3000, 5000], "UPI"),
            ("Salon Towels & Hygiene", "Expense", [500, 1000], "Cash"),
            ("Hair styling & Facials UPI", "Income", [2000, 3800], "UPI"),
            ("Parlour Shop Rent", "Expense", [2500, 4000], "Bank"),
            ("Regular Customer Cash", "Income", [1500, 2500], "Cash"),
        ],
        "Electronics Repair": [
            ("Mobile Screen Repairs", "Income", [3000, 5500], "UPI"),
            ("Spare Screens & IC Parts", "Expense", [2000, 4000], "UPI"),
            ("Repair Tools Solder", "Expense", [400, 900], "Cash"),
            ("Second-hand Phone Sale", "Income", [4000, 7000], "UPI"),
            ("Shop High-speed Internet", "Expense", [500, 1000], "SMS"),
            ("Accessory Cash Sales", "Income", [1200, 2500], "Cash"),
        ],
        "Pottery Workshop": [
            ("Clay Pot Consignment", "Income", [4000, 7500], "UPI"),
            ("Natural Clay Soil Truck", "Expense", [2000, 4000], "Cash"),
            ("Kiln Charcoal & Fuel", "Expense", [800, 1500], "SMS"),
            ("Pottery Workshop Fee", "Income", [2000, 3500], "UPI"),
            ("KVIC Scheme Bonus Pay", "Income", [1500, 3000], "Bank"),
            ("Mandi Exhibition Cash Sales", "Income", [2500, 4500], "Cash"),
        ],
        "Home Bakery": [
            ("Birthday Cake Payout", "Income", [3000, 5500], "UPI"),
            ("Maida Sugar Butter Lot", "Expense", [2000, 3500], "UPI"),
            ("Paper Box & Ribbons Lot", "Expense", [400, 800], "Cash"),
            ("Bread Supply to Local Shop", "Income", [2000, 3800], "UPI"),
            ("Oven Electric Bill", "Expense", [1000, 1800], "SMS"),
            ("Home Walk-in Cookie Sales", "Income", [1000, 2000], "Cash"),
        ],
        "Carpentry Shop": [
            ("Dining Table Deposit", "Income", [10000, 16000], "UPI"),
            ("Teak Plywood & Varnish", "Expense", [6000, 10000], "UPI"),
            ("Nails Screws Repair kit", "Expense", [500, 1200], "Cash"),
            ("Custom Wardrobe Instalment", "Income", [8000, 14000], "UPI"),
            ("Wood Cutting Machine Rent", "Expense", [2000, 3500], "Bank"),
            ("Small Stool Cash Sales", "Income", [2000, 4000], "Cash"),
        ],
        "Sweet Shop": [
            ("Mawa Sweets Bulk Order", "Income", [12000, 18000], "UPI"),
            ("Raw Sugar & Pure Ghee Lot", "Expense", [8000, 13000], "UPI"),
            ("Milk Boiling Gas Refill", "Expense", [1000, 1800], "SMS"),
            ("Festival Pack Box Deposit", "Income", [6000, 10000], "UPI"),
            ("Shop Assistant Wages", "Expense", [3000, 5000], "Bank"),
            ("Walk-in Daily Sweets Cash", "Income", [4000, 7500], "Cash"),
        ],
        "Inland Fishery": [
            ("Fresh Catch Fish Payout", "Income", [11000, 16000], "UPI"),
            ("Fingerlings Stock Purchase", "Expense", [5000, 8000], "Bank"),
            ("Probiotic Water Chemicals", "Expense", [1000, 2200], "SMS"),
            ("Fish Netting Wages Pay", "Expense", [2000, 3500], "Cash"),
            ("Retail Direct Fish Cash", "Income", [3000, 5500], "Cash"),
            ("Fish Pond Pump Power Bill", "Expense", [1200, 2000], "SMS"),
        ],
    }

    start_date = datetime.date(2026, 6, 15)
    
    for prof in profiles:
        pid = prof["id"]
        btype = prof["businessType"]
        templates = tx_templates.get(btype, tx_templates["Dairy Farm"])
        
        # Generate 16 transactions per profile
        for i in range(16):
            date_val = start_date + datetime.timedelta(days=i*2)
            temp = random.choice(templates)
            desc, cat, amt_range, src = temp
            amount = random.randint(amt_range[0], amt_range[1])
            
            txns.append({
                "profile_id": pid,
                "id": f"tx_{pid}_{i}",
                "date": date_val.strftime("%Y-%m-%d"),
                "description": desc,
                "category": cat,
                "amount": amount,
                "source": src
            })
            
    db.transactions.insert_many(txns)

    # 3. Seed Mandi Prices
    logger.info("Seeding Mandi Prices...")
    mandi_prices = [
        {
            "id": "m_1",
            "commodity": "Raw Milk (4.5% Fat)",
            "currentPrice": 42,
            "unit": "Litre",
            "yesterdayPrice": 44,
            "trend": "DOWN",
            "weeklyTrend": [46, 45, 44.5, 44, 42],
            "aiAdvice": "HOLD",
            "expectedTrend": "Expected to drop further next week due to high seasonal supply. Consider processing into Paneer/Ghee to preserve value.",
            "nearbyMarkets": [
                { "marketName": "Anand APMC", "price": 42 },
                { "marketName": "Nadiad Mandi", "price": 43.5 },
                { "marketName": "Vadodara Cooperatives", "price": 41 }
            ]
        },
        {
            "id": "m_2",
            "commodity": "Wheat (Kalyan Sona)",
            "currentPrice": 2450,
            "unit": "Quintal",
            "yesterdayPrice": 2420,
            "trend": "UP",
            "weeklyTrend": [2380, 2400, 2410, 2420, 2450],
            "aiAdvice": "SELL",
            "expectedTrend": "Strong post-harvest demand. Prices have hit a 30-day peak. Excellent time to liquidate current grain stock.",
            "nearbyMarkets": [
                { "marketName": "Patna APMC", "price": 2450 },
                { "marketName": "Rajkot Market Yard", "price": 2430 }
            ]
        },
        {
            "id": "m_3",
            "commodity": "Silk Weaving Yarn",
            "currentPrice": 380,
            "unit": "Kg",
            "yesterdayPrice": 375,
            "trend": "UP",
            "weeklyTrend": [360, 365, 370, 375, 380],
            "aiAdvice": "BUY NOW",
            "expectedTrend": "Rising yarn input costs. Procure silk threads now before next week's predicted 5% handloom dye tariff takes effect.",
            "nearbyMarkets": [
                { "marketName": "Salem Cooperatives", "price": 380 },
                { "marketName": "Kanchipuram Guild", "price": 395 }
            ]
        },
        {
            "id": "m_4",
            "commodity": "Teak Wood Logs",
            "currentPrice": 1800,
            "unit": "Cubic Feet",
            "yesterdayPrice": 1800,
            "trend": "STABLE",
            "weeklyTrend": [1800, 1800, 1800, 1800, 1800],
            "aiAdvice": "BUY LATER",
            "expectedTrend": "Logistics are stable. Prices will remain flat. Delay timber purchases until new stocks arrive in mid-August.",
            "nearbyMarkets": [
                { "marketName": "Udaipur Timber Yard", "price": 1800 },
                { "marketName": "Burdwan Depot", "price": 1850 }
            ]
        }
    ]
    db.mandi_prices.insert_many(mandi_prices)

    # 4. Seed Weather Data
    logger.info("Seeding Weather Data...")
    districts = [
        "Anand", "Patna", "Anantapur", "Indore", "Salem", 
        "Pune", "Udaipur", "Ludhiana", "Mehsana", "Warangal",
        "Khurda", "Lucknow", "Burdwan", "Varanasi", "Ernakulam"
    ]
    
    weather_data = []
    for d in districts:
        temp = random.randint(28, 38)
        humidity = random.randint(45, 90)
        desc = "Partly Cloudy with Breeze" if temp < 32 else "Intense Summer Heatwave" if temp > 36 else "Monsoon Showers Expected"
        icon = "cloudy" if temp < 32 else "sunny" if temp > 36 else "rainy"
        
        weather_data.append({
            "district": d,
            "temp": temp,
            "humidity": humidity,
            "rainfall": f"{random.randint(0, 45)}mm",
            "windSpeed": f"{random.randint(10, 25)} km/h",
            "description": desc,
            "icon": icon,
            "forecast7Days": [
                { "day": "Sun", "temp": temp, "icon": icon, "impact": "Standard yield expected." },
                { "day": "Mon", "temp": temp + 1, "icon": icon, "impact": "Normal operations." },
                { "day": "Tue", "temp": temp - 2, "icon": "rainy" if temp > 32 else "cloudy", "impact": "Logistics delays likely." },
                { "day": "Wed", "temp": temp - 3, "icon": "rainy", "impact": "Prepare cover for feed and inventory." },
                { "day": "Thu", "temp": temp - 1, "icon": "cloudy", "impact": "Cool temperature recovery." },
                { "day": "Fri", "temp": temp, "icon": "sunny", "impact": "Regular retail footfall returns." },
                { "day": "Sat", "temp": temp + 1, "icon": "sunny", "impact": "Clear sky." }
            ],
            "aiBusinessImpact": [
                f"Climate indicator: Temperature peaks at {temp}°C causing moderate thermal stress on resources.",
                "Upcoming mid-week rain showers will likely slow down transit routes. Keep storage barns waterproofed.",
                "Humidity levels are elevated. Regular sanitation of raw materials is advised to prevent fungal decay."
            ]
        })
    db.weather.insert_many(weather_data)

    # 5. Seed EMI Details (EMI Strategies)
    logger.info("Seeding Loan obligations...")
    emi_details = [
        {
            "profile_id": "ramesh_dairy", "id": "emi_r1", "lenderName": "HDFC Bank",
            "loanType": "Tractor Loan", "totalOutstanding": 185000, "monthlyEMI": 7500,
            "dueDate": "2026-07-26", "daysRemaining": 8, "riskStatus": "YELLOW",
            "cashAvailable": 6200, "expectedIncomingBeforeDue": 8200, "safeToPay": True
        },
        {
            "profile_id": "sunita_kirana", "id": "emi_s1", "lenderName": "Canara Bank",
            "loanType": "MUDRA Shishu Loan", "totalOutstanding": 28000, "monthlyEMI": 1500,
            "dueDate": "2026-07-24", "daysRemaining": 6, "riskStatus": "RED",
            "cashAvailable": 1100, "expectedIncomingBeforeDue": 600, "safeToPay": False
        },
        {
            "profile_id": "gopi_poultry", "id": "emi_g1", "lenderName": "Andhra Bank",
            "loanType": "Poultry Infrastructure Credit", "totalOutstanding": 210000, "monthlyEMI": 5000,
            "dueDate": "2026-08-02", "daysRemaining": 15, "riskStatus": "GREEN",
            "cashAvailable": 32000, "expectedIncomingBeforeDue": 12000, "safeToPay": True
        },
        {
            "profile_id": "anil_tailor", "id": "emi_a1", "lenderName": "SBI Bank",
            "loanType": "Sewing Equipment Finance", "totalOutstanding": 85000, "monthlyEMI": 2200,
            "dueDate": "2026-07-30", "daysRemaining": 12, "riskStatus": "GREEN",
            "cashAvailable": 12000, "expectedIncomingBeforeDue": 5000, "safeToPay": True
        },
        {
            "profile_id": "radha_weaving", "id": "emi_w1", "lenderName": "Salem Weaver Co-op",
            "loanType": "Handloom Modernization Debt", "totalOutstanding": 60000, "monthlyEMI": 1800,
            "dueDate": "2026-07-25", "daysRemaining": 7, "riskStatus": "YELLOW",
            "cashAvailable": 1500, "expectedIncomingBeforeDue": 3500, "safeToPay": True
        },
        {
            "profile_id": "mohan_tea", "id": "emi_t1", "lenderName": "Pune Gramin Co-op",
            "loanType": "Stall Commercial Micro-Credit", "totalOutstanding": 20000, "monthlyEMI": 1200,
            "dueDate": "2026-07-22", "daysRemaining": 4, "riskStatus": "YELLOW",
            "cashAvailable": 800, "expectedIncomingBeforeDue": 1000, "safeToPay": True
        },
        {
            "profile_id": "kamla_handicraft", "id": "emi_h1", "lenderName": "Udaipur Grameen Bank",
            "loanType": "SIDBI Handicraft Loan", "totalOutstanding": 45000, "monthlyEMI": 2000,
            "dueDate": "2026-07-29", "daysRemaining": 11, "riskStatus": "YELLOW",
            "cashAvailable": 1400, "expectedIncomingBeforeDue": 3000, "safeToPay": True
        },
        {
            "profile_id": "vikram_fertilizer", "id": "emi_v1", "lenderName": "Punjab National Bank",
            "loanType": "Agri-Business Working Capital", "totalOutstanding": 350000, "monthlyEMI": 8500,
            "dueDate": "2026-08-10", "daysRemaining": 23, "riskStatus": "GREEN",
            "cashAvailable": 50000, "expectedIncomingBeforeDue": 25000, "safeToPay": True
        },
        {
            "profile_id": "savita_beauty", "id": "emi_b1", "lenderName": "DGB Gramin Bank",
            "loanType": "Parlour Styling Loan", "totalOutstanding": 25000, "monthlyEMI": 1400,
            "dueDate": "2026-07-28", "daysRemaining": 10, "riskStatus": "YELLOW",
            "cashAvailable": 1100, "expectedIncomingBeforeDue": 2000, "safeToPay": True
        },
        {
            "profile_id": "rajesh_repair", "id": "emi_e1", "lenderName": "Canara Bank",
            "loanType": "Electronics Equipment Fund", "totalOutstanding": 15000, "monthlyEMI": 900,
            "dueDate": "2026-07-27", "daysRemaining": 9, "riskStatus": "GREEN",
            "cashAvailable": 2500, "expectedIncomingBeforeDue": 1500, "safeToPay": True
        },
        {
            "profile_id": "harish_pottery", "id": "emi_p1", "lenderName": "KVIC Gramodyog",
            "loanType": "Pottery Wheel Modernization", "totalOutstanding": 35000, "monthlyEMI": 1100,
            "dueDate": "2026-07-24", "daysRemaining": 6, "riskStatus": "YELLOW",
            "cashAvailable": 800, "expectedIncomingBeforeDue": 1200, "safeToPay": True
        },
        {
            "profile_id": "fatima_bakery", "id": "emi_f1", "lenderName": "Co-operative Mahila Bank",
            "loanType": "Oven Infrastructure Loan", "totalOutstanding": 30000, "monthlyEMI": 1300,
            "dueDate": "2026-07-26", "daysRemaining": 8, "riskStatus": "YELLOW",
            "cashAvailable": 950, "expectedIncomingBeforeDue": 1500, "safeToPay": True
        },
        {
            "profile_id": "samir_carpenter", "id": "emi_c1", "lenderName": "State Bank of India",
            "loanType": "Carpentry Machinery Loan", "totalOutstanding": 120000, "monthlyEMI": 4200,
            "dueDate": "2026-08-05", "daysRemaining": 18, "riskStatus": "GREEN",
            "cashAvailable": 15000, "expectedIncomingBeforeDue": 8000, "safeToPay": True
        },
        {
            "profile_id": "dev_sweet", "id": "emi_d1", "lenderName": "Union Bank of India",
            "loanType": "Sweet Shop Refurbishment Fund", "totalOutstanding": 80000, "monthlyEMI": 3500,
            "dueDate": "2026-08-01", "daysRemaining": 14, "riskStatus": "GREEN",
            "cashAvailable": 22000, "expectedIncomingBeforeDue": 11000, "safeToPay": True
        },
        {
            "profile_id": "laxmi_fishery", "id": "emi_fi1", "lenderName": "Kerala Fisheries Board",
            "loanType": "Fish Pond Excavation Loan", "totalOutstanding": 180000, "monthlyEMI": 5200,
            "dueDate": "2026-07-31", "daysRemaining": 13, "riskStatus": "GREEN",
            "cashAvailable": 12000, "expectedIncomingBeforeDue": 9000, "safeToPay": True
        }
    ]
    db.emi.insert_many(emi_details)

    # 6. Seed Alerts Log
    logger.info("Seeding Alerts Log...")
    alerts = [
        {
            "profile_id": "ramesh_dairy",
            "id": "alert_r1",
            "category": "payment",
            "risk": "YELLOW",
            "message": "AI Alert: Tractor EMI auto-debit of ₹7,500 due in 8 days. Remaining cash buffer is low. Confirm Amul collection sync.",
            "description": "Auto-debit for SBI EMI on 26th July is pre-allocated. Liquid cash in account is secure. Avoid any secondary loan inquiries this month.",
            "voiceAudioText": "Chhabis july ki tractor kist surakshit hai. Bank balance paryapt hai. Naya karj abhi na lein.",
            "date": "2026-07-18"
        },
        {
            "profile_id": "sunita_kirana",
            "id": "alert_s1",
            "category": "weather",
            "risk": "RED",
            "message": "IMD Alert: Heavy monsoon warnings in Patna for next 48 hrs. Shop footfall will drop by 40%. Store dry grains on wood logs.",
            "description": "High moisture forecast. Grain bags must be elevated off the floor. Keep shop shutters tight to prevent rain splashes.",
            "voiceAudioText": "Patna me bhaari baarish ki chetavni hai. Graahak kam aayenge. Anaaj ko oonche sthan par rakhein.",
            "date": "2026-07-18"
        }
    ]
    db.alerts.insert_many(alerts)

    # 7. Seed Field Visits
    logger.info("Seeding Field Audit Visits...")
    field_visits = [
        {
            "profile_id": "ramesh_dairy",
            "id": "fv_r1",
            "officerName": "Anoop Verma (NABARD Audits)",
            "purpose": "Verify Agri-Infrastructure Assets & barn chiller log",
            "date": "2026-07-10",
            "notes": "Chiller unit is fully operational. Ramesh is keeping cow records up to date on GramPulse."
        }
    ]
    db.field_visits.insert_many(field_visits)

    logger.info("Database seeded successfully with 15 dense micro-enterprise profiles.")

if __name__ == "__main__":
    seed_all_data()
