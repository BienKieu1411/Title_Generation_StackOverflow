Project split into two parts:

- backend/: FastAPI app (run on localhost:5000)
- plugin/: Chrome extension (manifest v3). popup.html contains an iframe to http://localhost:5000/so

How to run (macOS, zsh):

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

Notes
- Ensure internet access; `gradio_client` will load the model `BienKieu/Title_Generation_SO`.
- If model is private, set HUGGINGFACE_HUB_TOKEN environment variable before running backend.
- popup.html iframe points to http://localhost:5000/so; backend must be running.
