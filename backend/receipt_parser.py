import os
from google import genai
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
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
    category: Literal["Food", "Transportation", "Shopping", "Entertainment", "Groceries", "Utilities", "Health", "Education", "Personal"] = Field(description="Accurately classify the category. E.g. Burger King -> Food, JIBZ/Uber -> Transportation, Supermarket -> Groceries. 'Other' IS NOT ALLOWED.")
    items: List[ReceiptItem] = Field(description="List of items purchased")

# 2. Setup the Client
# Replace 'YOUR_API_KEY' with the key you got from AI Studio
client = genai.Client(api_key='AIzaSyCH3Ino-KoaCuMXk8VlKUq5Q-UjzpbBbdY')


# ... (keep your existing imports and Pydantic classes)

def analyze_receipt(image_path, retries=3):
    client = genai.Client(api_key='AIzaSyCH3Ino-KoaCuMXk8VlKUq5Q-UjzpbBbdY')
    raw_image = Image.open(image_path)
    
    # NEW: Using the requested 2.5 flash model
    MODEL_ID = 'gemini-2.5-flash'

    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model=MODEL_ID,
                contents=[
                    "Extract receipt details into JSON. Fix spelling. Date format YYYY-MM-DD. CRITICAL: You must accurately classify the `category` into one of the exact allowed ENUM choices based on the merchant and items (e.g., Burger King -> Food, Supermarket -> Groceries, Hospital -> Health). Do NOT default to 'Other' if a better fit exists.",
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
    
    raise Exception("Max retries exceeded. Check your Google AI Studio quota.")
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
