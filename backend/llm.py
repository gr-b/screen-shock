import asyncio
from typing import List, Optional, Dict, Any
from litellm import acompletion
import litellm
import os
import json
from pydantic import BaseModel

# Configure LiteLLM
litellm.set_verbose = False

FOCUS_PROMPT_TEMPLATE = """You are an expert assistant that helps users focus on their tasks.
Based on the user's goal, you need to generate a list of websites to allow and a list of websites to block and partical topic you want to block or allow.

Here is an example of a request about " I want to program for the next two hours":

{
    "allowlist": [
        {"website": "github.com", "intent": "all"},
        {"website": "stackoverflow.com", "intent": "all"},
        {"website": "chatgpt.com", "intent": "all"},
        {"website": "gemini.com", "intent": "all"}
    ],
    "blocklist": [
        {"website": "youtube.com", "intent": "music videos, gaming"},
        {"website": "instagram.com", "intent": "all"},
        {"website": "reddit.com", "intent": "non-programming related content"}
    ]
]

User's goal: "{text}"

Here is the schema for the reponse: {schema}
"""

STATUS_PROMPT_TEMPLATE = """You are an expert at analyzing user activity from a screenshot.
Your task is to determine if the user's activity in the screenshot complies with their stated focus goals, defined by an allowlist and a blocklist of websites and their intents.

Here are the lists:
Allowlist: {allowlist}
Blocklist: {blocklist}

Analyze the provided screenshot and identify all websites being visited and all user activities.
For each website and activity, determine if it is allowed according to the lists.
The primary value is the intent. e.g. if the user is on youtube.com, but the intent is "listening to study music" and "youtube.com" is on the allowlist with "study music" as intent, then it should be allowed.

Return a JSON object where keys are the identified websites or activities (e.g., "youtube.com", "watching videos", "scrolling social media") and values are booleans (true for allowed, false for blocked).

Here is the JSON schema for the response: {schema}
"""


class Website(BaseModel):
    website: str
    intent: str

class ResponseSchema(BaseModel):
    allowlist: List[Website]
    blocklist: List[Website]


class StatusResponseSchema(BaseModel):
    result: Dict[str, bool]


class CheckSchema(BaseModel):
    is_allowed: bool


async def generate_list_client(
    text: str, 
    model: str = "gpt-4o",
    temperature: float = 0.2,
) -> Dict[str, Any]:
    """
    Generate an allowlist and blocklist for a focus task.
    
    Args:
        text: Input text prompt describing the user's task
        model: The model to use (default: gpt-4o)
        temperature: Sampling temperature (0-1)
        
    Returns:
        Dictionary containing the response and metadata
    """
    try:
            
        messages = []
        # Add user message
        prompt = FOCUS_PROMPT_TEMPLATE.format(text=text, schema=ResponseSchema.model_json_schema())
        messages.append({"role": "user", "content": prompt})
        
        response = await acompletion(
            model=model,
            messages=messages,
            temperature=temperature,
            response_format=ResponseSchema
        )
        
        return {
            "content": json.loads(response.choices[0].message.content),
            "model": response.model
        }
            
    except Exception as e:
        return {
            "error": str(e),
            "content": None,
            "model": model,
            "usage": None
        }

async def get_status_client(
    image_base64: str,
    allowlist: List[Dict[str, str]],
    blocklist: List[Dict[str, str]],
    model: str = "gpt-4o",
) -> Dict[str, Any]:
    """
    Get status analysis from image and text input using vision models
    
    Args:
        image_base64: Base64 encoded image string
        allowlist: A list of dictionaries with "website" and "intent" for allowed sites.
        blocklist: A list of dictionaries with "website" and "intent" for blocked sites.
        model: The model to use (default: gpt-4o for vision support)
        system_prompt: Optional system prompt for context
        temperature: Sampling temperature (0-1)
        max_tokens: Maximum tokens to generate
        api_key: API key (will use environment variable if not provided)
        
    Returns:
        Dictionary containing the response and metadata
    """
    try:
        messages = []
        
        prompt = STATUS_PROMPT_TEMPLATE.format(
            allowlist=json.dumps(allowlist),
            blocklist=json.dumps(blocklist),
            schema=StatusResponseSchema.model_json_schema()
        )
        # Prepare content with text and image
        content = [{"type": "text", "text": prompt}]
        
        # Use provided base64 image
        # Assume JPEG if no format specified
        if not image_base64.startswith('data:'):
            image_base64 = f"data:image/jpeg;base64,{image_base64}"
        
        content.append({
            "type": "image_url",
            "image_url": {"url": image_base64}
        })
        
        # Add user message with text and image content
        messages.append({"role": "user", "content": content})
        
        response = await acompletion(
            model=model,
            messages=messages,
            response_format=StatusResponseSchema
        )
        try:
            content = json.loads(response.choices[0].message.content)["result"]
        except Exception as e:
            raise Exception(f"Error parsing response: {e}")
        
        return {
            "content": content,
            "model": response.model,
            "usage": response.usage.dict() if response.usage else None
        }
            
    except Exception as e:
        return {
            "error": str(e),
            "content": None,
            "model": model,
            "usage": None
        }

# Example usage
async def example_usage():
    """
    Example usage of both functions
    """
    # Example 1: Generate list from text
    list_result = await generate_list_client(
        text="I want to program for the next two hours",
        model="gpt-4o"
    )
    print("List Generation Result:", json.dumps(list_result, indent=2))
    
    # Example 2: Analyze image with text (using base64)
    # Replace with actual base64 image data
    sample_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    
    allowlist_example = [
        {"website": "github.com", "intent": "all"},
        {"website": "stackoverflow.com", "intent": "all"}
    ]
    blocklist_example = [
        {"website": "youtube.com", "intent": "music videos, gaming"},
        {"website": "instagram.com", "intent": "all"}
    ]
    
    status_result = await get_status_client(
        image_base64=sample_base64,
        allowlist=allowlist_example,
        blocklist=blocklist_example,
        model="gpt-4o"
    )
    print("Image Status Result:", json.dumps(status_result, indent=2))

if __name__ == "__main__":
    # Run example usage
    asyncio.run(example_usage())
