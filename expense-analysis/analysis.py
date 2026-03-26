import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np
import sys
import json

def load_data(filepath):
    try:
        df = pd.read_json(filepath)
        if df.empty:
            return None
        # Ensure date format is standard
        df["date"] = pd.to_datetime(df["date"], errors='coerce')
        # Drop rows where date is completely unparseable (extremely rare but safe)
        df = df.dropna(subset=['date'])
        
        # If amount doesn't exist, default to 0
        if "amount" not in df.columns:
            df["amount"] = 0
            
        return df
    except Exception as e:
        return None

def categorize_type(df):
    # Front-end already assigns categories like Food, Travel. We want to map these to 'essential' vs 'discretionary' intelligently.
    essential_categories = ["Groceries", "Utilities", "Health", "Healthcare", "Education", "Transport"]
    
    types = []
    for cat in df["category"]:
        if pd.isna(cat):
            types.append("discretionary")
        elif str(cat) in essential_categories:
            types.append("essential")
        else:
            types.append("discretionary")
            
    df["type"] = types
    return df

def risk_level(df):
    essential = df[df["type"] == "essential"]["amount"].sum()
    discretionary = df[df["type"] == "discretionary"]["amount"].sum()

    if discretionary > essential:
        return "High"
    elif discretionary > essential * 0.5:
        return "Medium"
    else:
        return "Low"

def generate_insights(df):
    insights = []
    total = df["amount"].sum()
    discretionary = df[df["type"] == "discretionary"]["amount"].sum()
    essential = df[df["type"] == "essential"]["amount"].sum()

    # Insight 1: Spending Habit (Wants vs Needs)
    if discretionary > essential and discretionary > total * 0.4:
        insights.append({
            "type": "danger", 
            "title": "Habit Warning", 
            "message": "You are spending significantly more on discretionary wants than essential needs.",
            "icon": "🚨"
        })
    elif discretionary > total * 0.4:
        insights.append({
            "type": "warning", 
            "title": "Discretionary Alert", 
            "message": "A high portion of your overall volume is mapped to discretionary spending.",
            "icon": "⚠️"
        })

    # Insight 2: Anomalies / Spikes
    daily = df.groupby("date")["amount"].sum()
    if not daily.empty and daily.max() > daily.mean() * 2 and len(daily) > 2:
        insights.append({
            "type": "danger", 
            "title": "Anomaly Detected", 
            "message": "An unusual daily spike in spending was traced. Review recent high-volume days.",
            "icon": "📈"
        })

    # Insight 3: Category Dominance
    if not df.empty:
        top_category = df.groupby("category")["amount"].sum().idxmax()
        insights.append({
            "type": "info", 
            "title": "Category Dominance", 
            "message": f"Your current highest volume purchasing sector is {top_category}.",
            "icon": "💡"
        })

    # Insight 4: High Value Txn
    high_txn = df[df["amount"] > 2000]
    if not high_txn.empty and len(insights) < 3:
        insights.append({
            "type": "warning", 
            "title": "High-Value Transfer", 
            "message": "The engine detected individual macro-transactions exceeding ₹2,000.",
            "icon": "💎"
        })

    # Insight 5: Frequent Platform
    if "merchant" in df.columns and not df.empty:
        top_merchant = df["merchant"].value_counts().iloc[0]
        if top_merchant > 2 and len(insights) < 4:
            insights.append({
                "type": "success", 
                "title": "Merchant Loyalty", 
                "message": "Recurring spending detected continuously on a single platform.",
                "icon": "🔁"
            })

    return insights

def analyze_trend(daily_spending):
    if len(daily_spending) < 2:
        return "STABLE", 0.0

    values = daily_spending.values
    trend_counts = {"up": 0, "down": 0, "stable": 0}

    for i in range(1, len(values)):
        if values[i] > values[i-1]:
            trend_counts["up"] += 1
        elif values[i] < values[i-1]:
            trend_counts["down"] += 1
        else:
            trend_counts["stable"] += 1

    if trend_counts["up"] > trend_counts["down"]:
        overall_trend = "INCREASING"
    elif trend_counts["down"] > trend_counts["up"]:
        overall_trend = "DECREASING"
    else:
        overall_trend = "STABLE"

    if values[0] == 0:
        growth = 0.0
    else:
        growth = ((values[-1] - values[0]) / values[0]) * 100

    return overall_trend, growth

def predict_future_spending(daily_spending):
    if len(daily_spending) == 0:
        return 0
    elif len(daily_spending) == 1:
        # One day of data: predicting the exact same amount is the safest assumption mathematically
        return int(daily_spending.iloc[0])

    y = daily_spending.values
    X = np.arange(len(y)).reshape(-1, 1)

    model = LinearRegression()
    model.fit(X, y)

    next_day = np.array([[len(y)]])
    prediction = int(model.predict(next_day)[0])
    
    # Linear Regression can point negative if spending drops severely over a few days!
    if prediction <= 0:
        # Fallback to the recent average rather than telling the user "0"
        return max(10, int(daily_spending.tail(3).mean()))
        
    return prediction

def category_intelligence(df):
    intel = []
    if df.empty:
        return intel
        
    category_data = df.groupby("category")["amount"].sum()
    total = df["amount"].sum()

    if total == 0:
        return intel

    for cat, value in category_data.items():
        percent = (value / total) * 100

        if percent > 30:
            tag = "Dominant"
            status = "danger"
        elif percent < 10:
            tag = "Controlled"
            status = "success"
        else:
            tag = "Moderate"
            status = "warning"

        intel.append({
            "category": str(cat),
            "amount": float(value),
            "percentage": float(percent),
            "tag": tag,
            "status": status
        })
    return intel

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No data file provided"}))
        sys.exit(1)
        
    filepath = sys.argv[1]
    df = load_data(filepath)
    
    # If no data or just empty array, return base structure
    if df is None or df.empty:
        print(json.dumps({
            "status": "empty",
            "risk_level": "Low",
            "insights": [{"type": "info", "message": "Add transactions to see AI ML Insights."}],
            "trend": "STABLE",
            "growth": 0,
            "prediction": 0,
            "category_intel": [],
            "history": []
        }))
        sys.exit(0)

    # Process and analyze
    df = categorize_type(df)
    
    # Sort and group by date
    df_sorted = df.sort_values("date")
    daily_spending = df_sorted.groupby("date")["amount"].sum()
    
    trend, growth = analyze_trend(daily_spending)
    prediction = predict_future_spending(daily_spending)
    intel = category_intelligence(df)
    insights = generate_insights(df)
    risk = risk_level(df)

    # Build trailing history for visualization
    history_arr = []
    if not daily_spending.empty:
        recent = daily_spending.tail(10) # last 10 days for graph
        for date_val, amt in recent.items():
            if isinstance(date_val, pd.Timestamp):
                date_str = date_val.strftime('%d %b')
            else:
                date_str = str(date_val)
            history_arr.append({
                "date": date_str,
                "amount": float(amt)
            })

    # Compile the final structured JSON payload
    response = {
        "status": "success",
        "total_amount": float(df["amount"].sum()),
        "risk_level": risk,
        "insights": insights,
        "trend": trend,
        "growth": round(float(growth), 2),
        "prediction": float(prediction),
        "category_intel": intel,
        "history": history_arr
    }
    
    print(json.dumps(response))

if __name__ == "__main__":
    main()