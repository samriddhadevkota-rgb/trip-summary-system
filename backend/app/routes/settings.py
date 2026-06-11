from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
import os
import shutil

router = APIRouter(prefix="/settings", tags=["settings"])

LOGO_PATH = "assets/logo.png"
os.makedirs("assets", exist_ok=True)


@router.post("/logo")
async def upload_logo(file: UploadFile = File(...)):
    with open(LOGO_PATH, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"message": "Logo uploaded successfully", "path": LOGO_PATH}


@router.get("/logo")
def get_logo():
    if os.path.exists(LOGO_PATH):
        return FileResponse(LOGO_PATH)
    return {"error": "No logo uploaded"}


@router.get("/logo/exists")
def logo_exists():
    return {"exists": os.path.exists(LOGO_PATH)}
