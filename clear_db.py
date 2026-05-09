import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def clear_database():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL not found in environment.")
        return

    print(f"Connecting to database...")
    conn = await asyncpg.connect(db_url)
    
    tables = [
        "products",
        "products_raw",
        "pipeline_products",
        "jobs",
        "post_log"
    ]
    
    try:
        for table in tables:
            print(f"Clearing table: {table}...")
            # We use CASCADE to handle any foreign key relationships if they exist
            await conn.execute(f"TRUNCATE TABLE {table} CASCADE;")
        
        print("\nSuccess! All product data, jobs, and logs have been erased.")
        print("Your backoffice should now be empty.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(clear_database())
