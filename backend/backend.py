import os
import torch
import logging
from collections import OrderedDict
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# ---------- Configuration ----------
MODELS_DIR = Path(os.getenv("MODELS_DIR", "C:\\Users\\redpl\\models"))
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
CACHE_SIZE = 8

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fnd-backend")

# ---------- LRU Cache ----------
class LRUCache:
    def __init__(self, max_size):
        self.cache = OrderedDict()
        self.max_size = max_size

    def get(self, key):
        if key not in self.cache:
            return None
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            del self.cache[key]
        elif len(self.cache) >= self.max_size:
            evicted = next(iter(self.cache))
            del self.cache[evicted]
            logger.info(f"Evicted model {evicted}")
        self.cache[key] = value

    def clear(self):
        self.cache.clear()

model_cache = LRUCache(CACHE_SIZE)

def get_model_path(model_id: str) -> Path:
    """Manual mapping from frontend ID to folder name inside MODELS_DIR."""
    mapping = {
        # Tagalog-BERT models
        "Tagalog-BERT-A-100:0":  "bert__HR100-AIR0-HF100-AIF0",
        "Tagalog-BERT-A-67:33":  "bert__HR100-AIR0-HF67-AIF33",
        "Tagalog-BERT-A-50:50":  "bert__HR100-AIR0-HF50-AIF50",
        "Tagalog-BERT-A-33:67":  "bert__HR100-AIR0-HF33-AIF67",
        "Tagalog-BERT-A-0:100":  "bert__HR100-AIR0-HF0-AIF100",

        "Tagalog-BERT-B-100:0":  "bert__HR67-AIR33-HF100-AIF0",
        "Tagalog-BERT-B-67:33":  "bert__HR67-AIR33-HF67-AIF33",
        "Tagalog-BERT-B-50:50":  "bert__HR67-AIR33-HF50-AIF50",
        "Tagalog-BERT-B-33:67":  "bert__HR67-AIR33-HF33-AIF67",
        "Tagalog-BERT-B-0:100":  "bert__HR67-AIR33-HF0-AIF100",

        "Tagalog-BERT-C-100:0":  "bert__HR50-AIR50-HF100-AIF0",
        "Tagalog-BERT-C-67:33":  "bert__HR50-AIR50-HF67-AIF33",
        "Tagalog-BERT-C-50:50":  "bert__HR50-AIR50-HF50-AIF50",
        "Tagalog-BERT-C-33:67":  "bert__HR50-AIR50-HF33-AIF67",
        "Tagalog-BERT-C-0:100":  "bert__HR50-AIR50-HF0-AIF100",

        # Tagalog-DistilBERT models
        "Tagalog-DistilBERT-A-100:0":  "distilbert__HR100-AIR0-HF100-AIF0",
        "Tagalog-DistilBERT-A-67:33":  "distilbert__HR100-AIR0-HF67-AIF33",
        "Tagalog-DistilBERT-A-50:50":  "distilbert__HR100-AIR0-HF50-AIF50",
        "Tagalog-DistilBERT-A-33:67":  "distilbert__HR100-AIR0-HF33-AIF67",
        "Tagalog-DistilBERT-A-0:100":  "distilbert__HR100-AIR0-HF0-AIF100",

        "Tagalog-DistilBERT-B-100:0":  "distilbert__HR67-AIR33-HF100-AIF0",
        "Tagalog-DistilBERT-B-67:33":  "distilbert__HR67-AIR33-HF67-AIF33",
        "Tagalog-DistilBERT-B-50:50":  "distilbert__HR67-AIR33-HF50-AIF50",
        "Tagalog-DistilBERT-B-33:67":  "distilbert__HR67-AIR33-HF33-AIF67",
        "Tagalog-DistilBERT-B-0:100":  "distilbert__HR67-AIR33-HF0-AIF100",

        "Tagalog-DistilBERT-C-100:0":  "distilbert__HR50-AIR50-HF100-AIF0",
        "Tagalog-DistilBERT-C-67:33":  "distilbert__HR50-AIR50-HF67-AIF33",
        "Tagalog-DistilBERT-C-50:50":  "distilbert__HR50-AIR50-HF50-AIF50",
        "Tagalog-DistilBERT-C-33:67":  "distilbert__HR50-AIR50-HF33-AIF67",
        "Tagalog-DistilBERT-C-0:100":  "distilbert__HR50-AIR50-HF0-AIF100",
    }
    folder = mapping.get(model_id)
    if folder is None:
        raise ValueError(f"Unknown model ID: {model_id}")
    return MODELS_DIR / folder / "final"

def load_model(model_id: str):
    """Load model and tokenizer from local disk, with LRU cache."""
    cached = model_cache.get(model_id)
    if cached:
        logger.info(f"Cache hit for {model_id}")
        return cached

    model_path = get_model_path(model_id)
    if not model_path.exists():
        raise FileNotFoundError(f"Model directory not found: {model_path}")

    logger.info(f"Loading model {model_id} from {model_path} ...")
    tokenizer = AutoTokenizer.from_pretrained(str(model_path))
    model = AutoModelForSequenceClassification.from_pretrained(
        str(model_path),
        torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32
    )
    model.to(DEVICE)
    model.eval()

    model_cache.put(model_id, (model, tokenizer))
    return model, tokenizer

# ---------- Request/Response Models ----------
class ClassificationRequest(BaseModel):
    text: str = Field(..., min_length=1)
    model_ids: list[str] = Field(..., min_length=1)

class ModelResult(BaseModel):
    model_id: str
    architecture: str
    condition: str
    ratio: str
    prediction: str
    confidence: float
    accuracy: str = "XXX"
    f1Score: str = "XXX"

class ClassificationResponse(BaseModel):
    results: list[ModelResult]

# ---------- FastAPI App ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    model_cache.clear()

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # or restrict to "http://localhost:3000" for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def parse_model_id(fid: str):
    """Extract architecture, condition letter, and ratio from ID like 'Tagalog-BERT-A-100:0'."""
    parts = fid.rsplit("-", 2)
    if len(parts) != 3:
        raise ValueError(f"Invalid model ID: {fid}")
    arch = "-".join(parts[:-2])
    cond = parts[-2]
    ratio = parts[-1]
    return arch, cond, ratio

def condition_label(cond: str) -> str:
    return {
        "A": "Human-Only Real News (100% HR)",
        "B": "Moderate AI-Augmented Real News (67% HR, 33% AI-R)",
        "C": "Balanced AI-Augmented Real News (50% HR, 50% AI-R)"
    }.get(cond, f"Unknown condition {cond}")

@app.post("/classify", response_model=ClassificationResponse)
async def classify(request: ClassificationRequest):
    results = []
    for model_id in request.model_ids:
        try:
            model, tokenizer = load_model(model_id)
            inputs = tokenizer(
                request.text,
                truncation=True,
                padding=True,
                max_length=512,
                return_tensors="pt"
            ).to(DEVICE)

            with torch.no_grad():
                outputs = model(**inputs)
                if outputs.logits.shape[-1] == 1:
                    prob_fake = torch.sigmoid(outputs.logits).squeeze(-1).item()
                else:
                    prob_fake = torch.softmax(outputs.logits, -1)[0, 1].item()

            pred = "FAKE" if prob_fake >= 0.5 else "REAL"
            conf = round(prob_fake * 100, 1)
            arch, cond, ratio = parse_model_id(model_id)
            results.append(ModelResult(
                model_id=model_id,
                architecture=arch,
                condition=condition_label(cond),
                ratio=ratio,
                prediction=pred,
                confidence=conf
            ))
        except Exception as e:
            logger.error(f"Error on model {model_id}: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    return ClassificationResponse(results=results)

@app.get("/")
async def root():
    return {"message": "Filipino Fake News Detection API is running."}