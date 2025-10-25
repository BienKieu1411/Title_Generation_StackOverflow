import warnings
import time
import decimal
import json
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from gradio_client import Client
from pydantic.json import pydantic_encoder
from pydantic import BaseModel

app = FastAPI(title="Title Generation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def custom_json_encoder(obj):
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    return pydantic_encoder(obj)

client = Client("BienKieu/Title_Generation_SO")

class TitleRequest(BaseModel):
    description: str = ""
    code: str = ""
    tag: str = ""

@app.post("/genTitle")
def generate_title(request: TitleRequest):
    time_start = time.time()
    warnings.filterwarnings("ignore")

    result = client.predict(
        request.tag,
        request.description,
        request.code,
        api_name="/predict"
    )

    summaries = [row[1] for row in result["data"]]
    time_end = time.time()

    return {
        "title_list": summaries,
        "processing_time": round(time_end - time_start, 2)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app", 
        host="0.0.0.0",
        port=8000,
        reload=True
    )
