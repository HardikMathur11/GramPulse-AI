import datetime

def evaluate_enterprise_risk(enterprise, forecast, weather_data, market_data):
    """
    Evaluates an enterprise's risk indicators based on transactional forecast,
    weather data, and market mandi prices.
    Returns a dict with:
      - risk_level: 'green' | 'yellow' | 'red'
      - reasons_en: list of str
      - reasons_hi: list of str
      - advice_en: list of str
      - advice_hi: list of str
      - cash_runway_days: int
      - emi_status: dict
    """
    reasons_en = []
    reasons_hi = []
    advice_en = []
    advice_hi = []
    
    current_balance = float(enterprise.get("current_balance", 0))
    emi_amount = float(enterprise.get("emi_amount", 0))
    emi_due_date_str = enterprise.get("emi_due_date") # YYYY-MM-DD
    sector = enterprise.get("sector", "").lower()
    district = enterprise.get("district", "")
    commodity = enterprise.get("commodity", "")
    
    # 1. Cash Runway calculation
    avg_daily_expense = float(enterprise.get("avg_daily_expense", 100))
    if avg_daily_expense > 0:
        runway = current_balance / avg_daily_expense
    else:
        runway = 90
        
    # 2. Check EMI coverage
    emi_covered = True
    days_to_emi = -1
    forecasted_balance_at_emi = current_balance
    
    if emi_due_date_str:
        try:
            emi_due = datetime.datetime.strptime(emi_due_date_str, "%Y-%m-%d").date()
            today = datetime.date.today()
            days_to_emi = (emi_due - today).days
            
            # Find the balance on that specific date in the forecast
            for f in forecast:
                f_date = datetime.datetime.strptime(f["date"], "%Y-%m-%d").date()
                if f_date == emi_due:
                    forecasted_balance_at_emi = f["balance"]
                    break
            
            if forecasted_balance_at_emi < emi_amount:
                emi_covered = False
        except Exception:
            pass

    # 3. Weather check (from weather_data)
    high_temp_risk = False
    drought_risk = False
    
    if weather_data:
        temp = weather_data.get("temp", 0)
        rainfall = weather_data.get("rainfall", 0)
        
        if temp > 40:
            high_temp_risk = True
        if rainfall < 10:
            drought_risk = True

    # 4. Market trend check
    market_price_dropped = False
    price_drop_pct = 0.0
    if market_data:
        curr = market_data.get("current_price", 0)
        prev = market_data.get("previous_price", 0)
        if prev > 0 and curr < prev:
            price_drop_pct = ((prev - curr) / prev) * 100
            if price_drop_pct >= 5.0:
                market_price_dropped = True

    # Accumulate reasons
    # Runway warning
    if runway < 10:
        reasons_en.append("Critical cash runway: less than 10 days of expenses covered.")
        reasons_hi.append("अत्यंत कम नकद रनवे: 10 दिनों से कम के खर्चों के लिए नकद उपलब्ध है।")
    elif runway < 25:
        reasons_en.append("Low cash runway: less than 25 days of expenses covered.")
        reasons_hi.append("कम नकद रनवे: 25 दिनों से कम के खर्चों के लिए नकद उपलब्ध है।")

    # EMI warning
    if days_to_emi >= 0 and days_to_emi <= 30:
        if not emi_covered:
            reasons_en.append(f"EMI due in {days_to_emi} days is at risk. Forecasted cash (₹{forecasted_balance_at_emi:,.2f}) will not cover EMI (₹{emi_amount:,.2f}).")
            reasons_hi.append(f"{days_to_emi} दिनों में देय EMI जोखिम में है। अनुमानित नकद (₹{forecasted_balance_at_emi:,.2f}) EMI राशि (₹{emi_amount:,.2f}) से कम है।")
        elif days_to_emi <= 7:
            reasons_en.append(f"Upcoming EMI of ₹{emi_amount:,.2f} due in {days_to_emi} days.")
            reasons_hi.append(f"₹{emi_amount:,.2f} की EMI {days_to_emi} दिनों में देय है।")

    # Sector specific alerts
    if sector == "dairy":
        if high_temp_risk:
            reasons_en.append("Extreme temperature stress detected (above 40°C), likely to reduce cattle milk yield.")
            reasons_hi.append("अत्यधिक तापमान (40°C से ऊपर) दर्ज, जिससे पशुओं के दूध उत्पादन में कमी की आशंका है।")
            advice_en.append("Provide continuous cool water, ventilation, and adjust dairy feed timings.")
            advice_hi.append("पशुओं को ठंडा पानी और पर्याप्त हवा दें, और चारा खिलाने के समय में बदलाव करें।")
    elif sector == "agricultural trader":
        if drought_risk:
            reasons_en.append("Severe regional dry spell (low rainfall) might reduce local crop arrivals.")
            reasons_hi.append("क्षेत्र में गंभीर शुष्क मौसम (कम बारिश), जिससे फसलों की आवक प्रभावित हो सकती है।")
            advice_en.append("Conserve cash; delay non-essential warehouse or logistics expansions.")
            advice_hi.append("नकद बचाएं; गोदाम या रसद के अनावश्यक खर्चों को अभी टालें।")
            
    if market_price_dropped:
        reasons_en.append(f"Mandi price of {commodity or 'commodity'} has dropped by {price_drop_pct:.1f}% recently, squeezing profit margins.")
        reasons_hi.append(f"{commodity or 'उत्पाद'} की मंडी कीमत हाल ही में {price_drop_pct:.1f}% गिर गई है, जिससे मुनाफा कम हो सकता है।")
        advice_en.append("Avoid immediate panic selling if storage permits; renegotiate procurement rates.")
        advice_hi.append("यदि भंडारण की सुविधा हो तो तुरंत औने-पौने दामों पर बेचने से बचें; खरीद दरों पर फिर से बातचीत करें।")

    # Add general advice based on risk
    if not emi_covered:
        advice_en.append("Reduce inventory purchase immediately and collect outstanding dues from customers.")
        advice_hi.append("माल की खरीद तुरंत कम करें और ग्राहकों से लंबित बकाये की वसूली तेज करें।")
        advice_en.append("Contact your loan field officer to discuss restructuring or temporary deferment options.")
        advice_hi.append("ऋण का पुनर्गठन या अस्थायी छूट के लिए अपने ऋण अधिकारी से संपर्क करें।")
    elif runway < 25:
        advice_en.append("Defer non-essential operating expenses to maintain liquid cash reserves.")
        advice_hi.append("नकद संचय बनाए रखने के लिए गैर-जरूरी परिचालन खर्चों को टालें।")

    # Default action tips if empty
    if not advice_en:
        advice_en.append("Maintain existing cash reserves; business metrics are stable.")
        advice_hi.append("नकद भंडार बनाए रखें; व्यावसायिक संकेतक स्थिर हैं।")

    # Determine risk level
    if runway < 10 or not emi_covered:
        risk_level = "red"
    elif runway < 25 or high_temp_risk or market_price_dropped:
        risk_level = "yellow"
    else:
        risk_level = "green"

    return {
        "risk_level": risk_level,
        "reasons_en": reasons_en,
        "reasons_hi": reasons_hi,
        "advice_en": advice_en[:3],
        "advice_hi": advice_hi[:3],
        "cash_runway_days": int(runway),
        "days_to_emi": days_to_emi,
        "emi_covered": emi_covered,
        "forecasted_balance_at_emi": forecasted_balance_at_emi
    }
