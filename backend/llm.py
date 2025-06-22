import asyncio
from typing import List, Optional, Dict, Any
from litellm import acompletion
import litellm
import os
import json
from pydantic import BaseModel, RootModel
from loguru import logger
# Configure LiteLLM
litellm.set_verbose = False

FOCUS_PROMPT_TEMPLATE = """You are an expert assistant that helps users focus on their tasks.
Your goal is to generate a curated allowlist and blocklist of websites based on the user's stated objective.
The user's goal might include what they want to do and what they want to avoid. You must consider both.

For example, if a user says "I want to write an essay about AI and stop procrastinating on Twitter", you should:
1. Identify the core task: "write an essay about AI". This means you should allow websites for research and writing.
2. Identify the explicit distraction: "procrastinating on Twitter". This means you should block Twitter.
3. Infer other potential distractions and block them as well (e.g., other social media, video streaming sites).

Here is an example of a good response for the goal: "I want to program for the next two hours and avoid getting distracted by news sites":

{{
    "allowlist": [
        {{"website": "github.com", "intent": "all"}},
        {{"website": "stackoverflow.com", "intent": "all"}},
        {{"website": "developer.mozilla.org", "intent": "all"}},
        {{"website": "chatgpt.com", "intent": "all"}},
        {{"website": "gemini.com", "intent": "all"}}
    ],
    "blocklist": [
        {{"website": "youtube.com", "intent": "non-programming videos"}},
        {{"website": "instagram.com", "intent": "all"}},
        {{"website": "reddit.com", "intent": "non-programming subreddits"}},
        {{"website": "cnn.com", "intent": "all"}},
        {{"website": "bbc.com/news", "intent": "all"}}
    ]
}}

User's goal: {text}

Here is the schema for the response: {schema}

Provide a JSON response with "allowlist" and "blocklist". Each list should contain objects with "website" and "intent". The intent is crucial. For blocklist items, "all" is a valid intent.
"""

STATUS_PROMPT_TEMPLATE = """You are a compliance checker. You MUST return a JSON object with a "result" key containing ALL websites from the provided lists.

**Your Task:**
1. You will receive an allowlist and blocklist of websites
2. You MUST return a compliance status (true/false) for EVERY SINGLE website in both lists
3. Do NOT analyze what's in the screenshot - just return all websites with their status

**Rules:**
- Allowlist websites: {allowlist}
- Blocklist websites: {blocklist}

**Compliance Logic:**
- Allowlist websites should be `true` (compliant) unless you see them being misused
- Blocklist websites should be `false` (non-compliant) if visible, `true` if not visible

**MANDATORY:** Your response must include every website from both the allowlist AND blocklist. Count them:
- Allowlist has websites that need status
- Blocklist has websites that need status
- Your result object must have entries for ALL of them

**Required JSON Format:**
```json
{{
  "result": {{
    "github.com": true,
    "stackoverflow.com": true,
    "facebook.com": false,
    "youtube.com": true
  }}
}}
```

**Schema:** {schema}

Return the JSON with ALL websites from the allowlist and blocklist included in the result object.
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
        
        raw_content = response.choices[0].message.content
        logger.debug(f"Raw LLM response content: {raw_content}")

        return {
            "content": json.loads(raw_content),
            "model": response.model
        }
            
    except Exception as e:
        logger.error(f"Error in generate_list_client: {str(e)}", exc_info=True)
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
        print(content)
        # Assume JPEG if no format specified
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
            # Remove response_format to avoid schema issues
        )
        
        raw_content = response.choices[0].message.content
        logger.debug(f"Raw LLM response content: {raw_content}")

        # Parse the JSON response, extracting and decoding any JSON code block if present
        try:
            # Try to extract JSON from a code block if present
            if raw_content.strip().startswith("```json"):
                # Remove the code block markers
                json_str = raw_content.strip()
                json_str = json_str.lstrip("`").lstrip("json").strip()
                if json_str.endswith("```"):
                    json_str = json_str[:-3].strip()
            else:
                json_str = raw_content

            parsed_response = json.loads(json_str)
            return {
                "content": parsed_response.get('result', {}),
                "model": response.model,
            }
        except json.JSONDecodeError:
            # If it's not valid JSON, return empty result
            logger.warning(f"Failed to parse JSON response: {raw_content}")
            return {
                "content": {},
                "model": response.model,
            }
            
    except Exception as e:
        logger.error(f"Error in get_status_client: {str(e)}", exc_info=True)
        raise e


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
