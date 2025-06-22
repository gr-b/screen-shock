from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict

from llm import (
    generate_list_client,
    get_status_client,
    Website,
    ResponseSchema
)

app = FastAPI(title="Screen Shock API", version="1.0.0")

class GenerateConfigRequest(BaseModel):
    description: str

class EvaluateCaptureRequest(BaseModel):
    screenshot: str
    allowlist: List[Website]
    blocklist: List[Website]

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
    allowlist_dicts = [w.dict() for w in payload.allowlist]
    blocklist_dicts = [b.dict() for b in payload.blocklist]
    
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
