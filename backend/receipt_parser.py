import os
import sys
import json
import time
from typing import List, Literal
from pydantic import BaseModel, Field
from PIL import Image
from google import genai

# 1. Define the Schema for structured receipt extraction
class ReceiptItem(BaseModel):
    name: str = Field(description="Name of the item")
    price: float = Field(description="Price of a single unit")

class ReceiptData(BaseModel):
    merchant_name: str = Field(description="The name of the store (e.g., Starbucks)")
    date: str = Field(description="Date in YYYY-MM-DD format")
    total_amount: float = Field(description="Final total paid")
    currency: str = Field(description="Currency code like USD, INR, or EUR")
    category: Literal[
        "Food",
        "Transportation",
        "Shopping",
        "Entertainment",
        "Groceries",
        "Utilities",
        "Health",
        "Education",
        "Personal",
    ] = Field(
        description="Accurately classify the category. E.g. Burger King -> Food, Uber -> Transportation, Supermarket -> Groceries."
    )
    items: List[ReceiptItem] = Field(description="List of items purchased")


def analyze_receipt(image_path: str, retries: int = 3):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set on the server.")

    if not os.path.exists(image_path):
        raise FileNotFoundError("Uploaded receipt image file was not found.")

    client = genai.Client(api_key=api_key)
    raw_image = Image.open(image_path)

    model_id = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model=model_id,
                contents=[
                    "Extract receipt details into JSON. Fix spelling. Date format YYYY-MM-DD. "
                    "CRITICAL: You must accurately classify the `category` into one of the exact allowed ENUM choices "
                    "based on the merchant and items (e.g., Burger King -> Food, Supermarket -> Groceries, Hospital -> Health). "
                    "Do NOT default to 'Other' if a better fit exists.",
                    raw_image,
                ],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": ReceiptData,
                },
            )
            if not response or not response.parsed:
                raise ValueError("Could not extract structured receipt data from this image. Please try a clearer photo.")
            return response.parsed

        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                if attempt < retries - 1:
                    wait_time = (attempt + 1) * 5
                    print(f"Quota busy. Waiting {wait_time}s...", file=sys.stderr)
                    time.sleep(wait_time)
                    continue
                raise RuntimeError("AI rate limit reached. Please wait a moment and try again.")
            raise e

    raise RuntimeError("Unable to process receipt right now. Please try again later.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python receipt_parser.py <image_path>"}))
        sys.exit(1)

    target_image_path = sys.argv[1]
    try:
        data = analyze_receipt(target_image_path)
        payload = data.model_dump() if hasattr(data, "model_dump") else data.dict()
        print(json.dumps(payload, default=str))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

