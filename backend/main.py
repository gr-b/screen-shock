from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

from llm import (
    generate_list_client,
    get_status_client,
    Website,
    ResponseSchema
)

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
    result = await generate_list_client(text=payload.description)
    
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
    Deliver stimulus via Pavlok device.
    """
    # TODO: Implement actual Pavlok API integration
    # For now, just simulate the stimulus delivery
    
    try:
        # Validate token format (basic check)
        if not payload.pavlok_token or len(payload.pavlok_token) < 10:
            raise HTTPException(status_code=400, detail="Invalid Pavlok token")
        
        # Here you would integrate with the actual Pavlok API
        # import requests
        # pavlok_response = requests.post(
        #     "https://pavlok-mvp.herokuapp.com/api/v1/stimuli/shock/",
        #     headers={"Authorization": f"Bearer {payload.pavlok_token}"},
        #     json={"value": 50}  # Shock intensity
        # )
        
        # For now, simulate success
        return DeliverStimulusResponse(
            success=True,
            message="Stimulus delivered successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to deliver stimulus: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
