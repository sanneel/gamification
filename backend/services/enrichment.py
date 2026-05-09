import json
import os
import logging
from openai import AsyncOpenAI

log = logging.getLogger(__name__)

async def enrich_product(title: str, description: str) -> dict:
    """
    Prompts the LLM to return a Georgian Instagram caption and relevant hashtags.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        log.warning("OPENAI_API_KEY not set. Using fallback mock data for enrichment.")
        return {
            "caption": f"✨ {title}\n\nიდეალური საჩუქარი საყვარელი ადამიანისთვის.",
            "hashtags": ["#წყვილი", "#საჩუქარი", "#სიყვარული", "#couplegoals", "#giftideas"]
        }

    client = AsyncOpenAI(api_key=api_key)
    prompt = (
        f"შექმენი Instagram-ის პოსტის კაფსი ქართულ ენაზე შემდეგი პროდუქტისთვის:\n"
        f"სათაური: {title}\n"
        f"აღწერა: {description}\n\n"
        "დააბრუნე ᲛᲮᲝᲚᲝᲓ JSON ობიექტი ორი გასაღებით:\n"
        "1. 'caption': მიმზიდველი, ემოციური ქართული კაფსი (2-3 წინადადება, ემოჯი).\n"
        "2. 'hashtags': მასივი 5 ჰეშთეგით (ნაზავი ქართული და ინგლისური).\n"
        "სხვა ტექსტი არ დაამატო."
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "შენ ხარ ექსპერტი სოციალური მედიის მენეჯერი. წერ ქართულ Instagram კაფსებს წყვილების სასაჩუქრე მაღაზიისთვის 'წყვილი'."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        return {
            "caption": data.get("caption", ""),
            "hashtags": data.get("hashtags", [])
        }
    except Exception as e:
        log.error(f"Failed to enrich product: {e}", exc_info=True)
        return {"caption": title, "hashtags": []}
