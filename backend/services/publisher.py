import os
import logging
import asyncio
import httpx
from datetime import datetime

log = logging.getLogger(__name__)

async def publish_to_instagram(image_url: str, caption: str) -> str:
    """
    Publishes an image and caption to Instagram via the Graph API (v22.0).
    Steps:
      1. Create a media container.
      2. Poll until container status is FINISHED.
      3. Publish the media container.
      4. Fetch the permalink.
    """
    ig_access_token = os.getenv("IG_ACCESS_TOKEN")
    ig_account_id = os.getenv("IG_ACCOUNT_ID")

    if not ig_access_token or not ig_account_id:
        log.info(f"Mock Publish Success: [image_url={image_url}] [caption={caption[:30]}...]")
        # Return a mock permalink
        return f"https://www.instagram.com/p/mock_{int(datetime.now().timestamp())}/"

    base_url = "https://graph.facebook.com/v22.0"

    async with httpx.AsyncClient() as client:
        # Step 1: Create media container
        create_url = f"{base_url}/{ig_account_id}/media"
        create_params = {
            "image_url": image_url,
            "caption": caption,
            "access_token": ig_access_token
        }
        
        create_res = await client.post(create_url, params=create_params)
        create_data = create_res.json()
        
        if create_res.status_code != 200:
            log.error(f"Failed to create media container: {create_data}")
            raise Exception(f"Graph API Error (create): {create_data}")
            
        container_id = create_data.get("id")
        log.info(f"Created media container: {container_id}. Polling for FINISHED status...")

        # Step 2: Poll container status
        status_url = f"{base_url}/{container_id}"
        status_params = {
            "fields": "status_code",
            "access_token": ig_access_token
        }
        
        max_attempts = 12  # up to ~1 minute
        for attempt in range(max_attempts):
            await asyncio.sleep(5)
            status_res = await client.get(status_url, params=status_params)
            status_data = status_res.json()
            
            status_code = status_data.get("status_code", "UNKNOWN")
            if status_code == "FINISHED":
                log.info(f"Container {container_id} is FINISHED.")
                break
            elif status_code == "ERROR":
                log.error(f"Container {container_id} encountered an ERROR: {status_data}")
                raise Exception(f"Container Processing Error: {status_data}")
            
            log.info(f"Container {container_id} status: {status_code}. Retrying...")
        else:
            log.error(f"Container {container_id} timed out waiting for FINISHED status.")
            raise Exception(f"Container Timeout: {container_id}")

        # Step 3: Publish media
        publish_url = f"{base_url}/{ig_account_id}/media_publish"
        publish_params = {
            "creation_id": container_id,
            "access_token": ig_access_token
        }
        
        publish_res = await client.post(publish_url, params=publish_params)
        publish_data = publish_res.json()
        
        if publish_res.status_code != 200:
            log.error(f"Failed to publish media: {publish_data}")
            raise Exception(f"Graph API Error (publish): {publish_data}")
            
        media_id = publish_data.get("id")
        log.info(f"Successfully published media: {media_id}")

        # Step 4: Get permalink
        try:
            permalink_url = f"{base_url}/{media_id}"
            permalink_params = {
                "fields": "permalink",
                "access_token": ig_access_token
            }
            permalink_res = await client.get(permalink_url, params=permalink_params)
            permalink_data = permalink_res.json()
            return permalink_data.get("permalink", f"https://www.instagram.com/p/{media_id}/")
        except Exception as e:
            log.warning(f"Failed to fetch permalink for {media_id}: {e}")
            return f"https://www.instagram.com/p/{media_id}/"
