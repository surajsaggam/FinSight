import os
from google import genai
from pydantic import BaseModel, Field
from typing import List, Optional
from PIL import Image
import time
from google import genai

# 1. Define the "Brain" of your project (The Schema)
# This forces the AI to fix spelling and format dates properly.
class ReceiptItem(BaseModel):
    name: str = Field(description="Name of the item")
    price: float = Field(description="Price of a single unit")

class ReceiptData(BaseModel):
    merchant_name: str = Field(description="The name of the store (e.g., Starbucks)")
    date: str = Field(description="Date in YYYY-MM-DD format")
    total_amount: float = Field(description="Final total paid")
    currency: str = Field(description="Currency code like USD, INR, or EUR")
    category: str = Field(description="Strictly ONE of: Food, Travel, Shopping, Entertainment, Groceries, Utilities, Health, Education, Other")
    items: List[ReceiptItem] = Field(description="List of items purchased")

# 2. Setup the Client
# Replace 'YOUR_API_KEY' with the key you got from AI Studio
client = genai.Client(api_key='AIzaSyCcDcNHmM3QBNHueY_f1Nvt6iiyE1EqJLA')


# ... (keep your existing imports and Pydantic classes)

def analyze_receipt(image_path, retries=3):
    client = genai.Client(api_key='AIzaSyCcDcNHmM3QBNHueY_f1Nvt6iiyE1EqJLA')
    raw_image = Image.open(image_path)
    
    # NEW: Using the stable 2026 free-tier model
    MODEL_ID = 'gemini-3-flash-preview'

    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model=MODEL_ID,
                contents=[
                    "Extract receipt details into JSON. Fix spelling. Date format YYYY-MM-DD.",
                    raw_image
                ],
                config={
                    'response_mime_type': 'application/json',
                    'response_schema': ReceiptData,
                }
            )
            return response.parsed
            
        except Exception as e:
            if "429" in str(e):
                wait_time = (attempt + 1) * 5 # Exponential backoff
                print(f"Quota busy. Waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise e
    
    raise Exception("Server error, please try later")
# 3. Execution Block (command-line mode)
if __name__ == "__main__":
    import sys, json

    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python receipt_parser.py <image_path>"}))
        sys.exit(1)

    image_path = sys.argv[1]
    try:
        data = analyze_receipt(image_path)
        print(json.dumps(data.dict(), default=str))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
