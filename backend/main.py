from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict
import httpx
import os
from pathlib import Path
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
    allow_origins=["*"],  # Allow all origins for production deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    # Mount static files for CSS, JS, images, etc.
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

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

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Screen Shock API is running"}

@app.get("/api/")
async def api_root():
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

# Serve React app for all non-API routes (SPA routing) - MUST BE LAST
@app.get("/{path:path}")
async def serve_frontend_routes(path: str = ""):
    """Serve React app for all non-API routes (SPA routing)"""
    # Don't serve SPA for API routes or static assets
    if path.startswith("api/") or path.startswith("static/"):
        raise HTTPException(status_code=404, detail="Not found")
    
    static_file = static_dir / "index.html"
    if static_file.exists():
        return FileResponse(static_file, media_type="text/html")
    else:
        # Debug: show what files are actually available
        files = list(static_dir.glob("*")) if static_dir.exists() else []
        return {
            "error": "Frontend not found", 
            "static_dir": str(static_dir),
            "static_dir_exists": static_dir.exists(),
            "files": [str(f) for f in files]
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
