let videoElement = document.getElementById('video');
let canvasElement = document.getElementById('output');
let canvasCtx = canvasElement.getContext('2d');
let predictionDiv = document.getElementById('prediction');
let fpsDiv = document.getElementById('fps');
let confBar = document.getElementById('confidence-fill');
let camera = null;
let themes = {};
let currentTheme = "dark";

let camWidth = 1280, camHeight = 720; // default resolution

// Detect if mobile → lower resolution for performance
if (/Mobi|Android/i.test(navigator.userAgent)) {
  camWidth = 640;
  camHeight = 480;
  window.addEventListener("load", () => {
    document.getElementById("resolutionSelector").value = "640x480";
  });
}

// FPS calculation
let lastFrameTime = Date.now();

// Load config and apply default theme
fetch("/static/config.json")
  .then(response => response.json())
  .then(config => {
    themes = config.themes;
    currentTheme = config.defaultTheme;
    applyTheme(currentTheme);
    document.getElementById("themeSelector").value = currentTheme;
  });

function applyTheme(themeName) {
    let theme = themes[themeName];
    if (!theme) return;
    document.body.style.background = theme.backgroundGradient;
    document.body.style.color = theme.textColor;
    videoElement.style.borderColor = theme.videoBorderColor;
    canvasElement.style.borderColor = theme.canvasBorderColor;
    fpsDiv.style.color = theme.textColor;
}

function switchTheme(themeName) {
    currentTheme = themeName;
    applyTheme(themeName);
}

// Send landmarks to backend
async function sendLandmarks(landmarks) {
    let formData = new FormData();
    formData.append("landmarks", landmarks.join(","));
    try {
        let response = await fetch("/predict", {
            method: "POST",
            body: formData
        });
        let result = await response.json();

        let conf = result.confidence ?? 1.0;
        let label = result.prediction || "None";

        predictionDiv.innerText = `Prediction: ${label} (${Math.round(conf * 100)}%)`;

        predictionDiv.classList.remove("low-confidence");

        if (conf > 0.8) {
            predictionDiv.style.color = "limegreen";
            confBar.style.backgroundColor = "limegreen";
        } else if (conf > 0.5) {
            predictionDiv.style.color = "gold";
            confBar.style.backgroundColor = "gold";
        } else {
            predictionDiv.style.color = "red";
            confBar.style.backgroundColor = "red";
            if (conf < 0.3) predictionDiv.classList.add("low-confidence");
        }

        confBar.style.width = `${conf * 100}%`;
    } catch (error) {
        console.error("Error sending landmarks:", error);
    }
}

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks) {
        let allCoords = [];
        for (const landmarks of results.multiHandLandmarks) {
            let baseX = landmarks[0].x;
            let baseY = landmarks[0].y;
            let baseZ = landmarks[0].z;
            for (let lm of landmarks) {
                allCoords.push((lm.x - baseX).toFixed(5));
                allCoords.push((lm.y - baseY).toFixed(5));
                allCoords.push((lm.z - baseZ).toFixed(5));
            }
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00db0bff', lineWidth: 2});
            drawLandmarks(canvasCtx, landmarks, {color: '#ff0000ff', lineWidth: 1, radius: 2});
        }
        if (allCoords.length > 0) sendLandmarks(allCoords);
    }

    canvasCtx.restore();

    let now = Date.now();
    let fps = Math.round(1000 / (now - lastFrameTime));
    lastFrameTime = now;
    fpsDiv.innerText = `FPS: ${fps}`;
}

// Mediapipe Hands
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.7
});
hands.onResults(onResults);

function startCamera() {
    camera = new Camera(videoElement, {
        onFrame: async () => await hands.send({image: videoElement}),
        width: camWidth,
        height: camHeight
    });
    camera.start();
}

function stopCamera() {
    if (camera) camera.stop();
}

function changeResolution(value) {
    let [w, h] = value.split("x").map(Number);
    camWidth = w;
    camHeight = h;
    if (camera) {
        stopCamera();
        startCamera();
    }
}

function toggleFullscreen() {
    let container = document.getElementById("video-container");
    if (!document.fullscreenElement) {
        container.requestFullscreen?.() || container.webkitRequestFullscreen?.();
    } else {
        document.exitFullscreen?.() || document.webkitExitFullscreen?.();
    }
}

// 🆕 Handle responsive resizing
window.addEventListener('resize', () => {
  const rect = videoElement.getBoundingClientRect();
  canvasElement.width = rect.width;
  canvasElement.height = rect.height;
});


