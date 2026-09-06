from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from PIL import Image
from model import predict_image
import io

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

class PredictionResponse(BaseModel):
    prediction:str
    confidence:float

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )

@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=415,
            detail="Only JPG and PNG images are allowed"
        )

    contents = await file.read()

    try:
        image = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted image"
        )

    result = predict_image(image)

    return result