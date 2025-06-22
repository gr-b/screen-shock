from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import httpx
import os
from dotenv import load_dotenv

from llm import (
    generate_list_client,
    get_status_client,
    Website,
    ResponseSchema
)

load_dotenv()




app = FastAPI(title="Screen Shock API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateConfigRequest(BaseModel):
    description: str

class EvaluateCaptureRequest(BaseModel):
    screenshot: str
    allowlist: List[Website]
    blocklist: List[Website]

class DeliverStimulusRequest(BaseModel):
    pavlok_token: str

class DeliverStimulusResponse(BaseModel):
    success: bool
    message: str

@app.get("/")
async def root():
    return {"message": "Screen Shock API is running"}

@app.post("/api/generate-config", response_model=ResponseSchema)
async def generate_config(payload: GenerateConfigRequest):
    """
    Generate allowlist and blocklist based on user's description.
    """
    result = await generate_list_client(text=payload.description, model="openrouter/google/gemini-2.5-flash")

    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    
    if not result.get("content"):
        raise HTTPException(status_code=500, detail="Failed to generate configuration from LLM.")

    return result["content"]

@app.post("/api/evaluate-capture-for-trigger", response_model=Dict[str, bool])
async def evaluate_capture_for_trigger(payload: EvaluateCaptureRequest):
    """
    Evaluate a screenshot against an allowlist and blocklist.
    """
    allowlist_dicts = [w.model_dump() for w in payload.allowlist]
    blocklist_dicts = [b.model_dump() for b in payload.blocklist]
    
    result = await get_status_client(
        model="openrouter/google/gemini-2.5-flash-lite-preview-06-17",
        image_base64=payload.screenshot,
        allowlist=allowlist_dicts,
        blocklist=blocklist_dicts
    )
    
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
        
    if result.get("content") is None:
        raise HTTPException(status_code=500, detail="Failed to evaluate capture from LLM.")

    return result["content"]

@app.post("/api/deliver-stimulus", response_model=DeliverStimulusResponse)
async def deliver_stimulus(payload: DeliverStimulusRequest):
    """
    Deliver stimulus via Pavlok device using the real Pavlok API.
    """
    try:
        # Validate token format (basic check)
        if not payload.pavlok_token or len(payload.pavlok_token) < 10:
            raise HTTPException(status_code=400, detail="Invalid Pavlok token")
        
        # Call the real Pavlok API
        async with httpx.AsyncClient() as client:
            pavlok_response = await client.post(
                "https://api.pavlok.com/api/v5/stimulus/send",
                headers={
                    "Authorization": f"Bearer {payload.pavlok_token}",
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                json={
                    "stimulus": {
                        "stimulusType": "beep",  # Can be "beep", "vibration", or "shock"
                        "stimulusValue": 100    # Intensity (1-255)
                    }
                },
                timeout=10.0
            )
            
            if pavlok_response.status_code == 200:
                return DeliverStimulusResponse(
                    success=True,
                    message="Stimulus delivered successfully"
                )
            else:
                # Log the error for debugging
                error_detail = f"Pavlok API error: {pavlok_response.status_code}"
                try:
                    error_data = pavlok_response.json()
                    error_detail += f" - {error_data}"
                except:
                    error_detail += f" - {pavlok_response.text}"
                
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to deliver stimulus: {error_detail}"
                )
        
    except HTTPException:
        raise
    except httpx.TimeoutException:
        raise HTTPException(status_code=500, detail="Timeout connecting to Pavlok API")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to deliver stimulus: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
