# Project split into two parts:

- backend/: FastAPI app (run on localhost:8000)
- plugin/: Chrome extension (manifest v3). popup.html contains an iframe to http://localhost:8000/genTitle

# How to run

1. Backend

cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python app.py

Or use uvicorn directly:

uvicorn app:app --host 0.0.0.0 --port 5000 --reload

2. Load extension in Chrome

Open chrome://extensions, enable Developer mode, click "Load unpacked" and select the `plugin/` folder.