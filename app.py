from fastapi import FastAPI, Form
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import joblib, numpy as np
import uvicorn

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

model = joblib.load("asl_rf_model_63.pkl")
EXPECTED = 63

@app.get("/")
async def root():
    return FileResponse("static/index.html")

@app.post("/predict")
async def predict(landmarks: str = Form(...)):
    data = np.array([float(x) for x in landmarks.split(",")], dtype=np.float32)
    print("🟡 Received:", len(data))

    if len(data) != EXPECTED:
        return {"prediction": "Invalid features"}

    prediction = model.predict([data])[0]
    print("✅ Prediction:", prediction)
    return {"prediction": str(prediction)}

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
