# 🎤 Speech-to-Text Server

A lightweight, open-source **Speech-to-Text API server** powered by OpenAI's Whisper model. Convert audio files to text with ease using this simple REST API.

## ✨ Features

- 🔄 **Audio Format Support**: Accepts multiple audio formats (MP3, WAV, OGG, M4A, etc.)
- 🚀 **Fast Transcription**: Uses Whisper-tiny model for rapid processing
- 🌐 **REST API**: Simple HTTP endpoints for easy integration
- 🛡️ **CORS Enabled**: Cross-origin requests supported
- 🐳 **Docker Ready**: Containerized for easy deployment
- 📦 **Zero Dependencies**: Minimal resource footprint
- ✅ **Health Check**: Built-in endpoint to verify server status
- 🗑️ **Auto Cleanup**: Automatic temporary file cleanup

## 📋 What You Can Do

- Convert audio files to text transcriptions
- Build voice-to-text applications
- Create voice command systems
- Develop accessibility features
- Process meeting/lecture recordings
- Integrate with chatbots or voice assistants

## 🛠️ Installation

### Prerequisites

- **Node.js** v16 or higher
- **FFmpeg** (required for audio conversion)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/amitkr79/speech-to-text.git
   cd speech-to-text
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install FFmpeg** (if not already installed)
   - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html) or use `choco install ffmpeg`
   - **macOS**: `brew install ffmpeg`
   - **Linux**: `sudo apt-get install ffmpeg`

4. **Start the server**
   ```bash
   npm start
   ```

   Server will run at `http://localhost:3000`

### Docker Setup

1. **Build the Docker image**
   ```bash
   docker build -t stt-server .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 stt-server
   ```

## 🚀 API Endpoints

### 1. **Transcribe Audio**

**POST** `/transcribe`

Converts an audio file to text.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**: Audio file (max 20MB)

**Example using cURL:**
```bash
curl -X POST \
  -F "audio=@/path/to/audio.mp3" \
  http://localhost:3000/transcribe
```

**Example using JavaScript/Fetch:**
```javascript
const formData = new FormData();
formData.append('audio', audioFile); // File from input

const response = await fetch('http://localhost:3000/transcribe', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.text); // Transcribed text
```

**Example using Python:**
```python
import requests

files = {'audio': open('audio.mp3', 'rb')}
response = requests.post('http://localhost:3000/transcribe', files=files)
print(response.json())
```

**Response:**
```json
{
  "text": "Hello, this is a sample transcription."
}
```

**Error Response:**
```json
{
  "error": "No audio file provided"
}
```

### 2. **Health Check**

**GET** `/health`

Checks if the server is running and the model is loaded.

**Example:**
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "model": "whisper-tiny.en"
}
```

## 📊 API Parameters & Limits

| Parameter | Value |
|-----------|-------|
| **Max File Size** | 20MB |
| **Supported Formats** | MP3, WAV, OGG, M4A, FLAC, AAC, and more |
| **Audio Quality** | Auto-converted to 16kHz mono PCM |
| **Model** | Whisper-tiny (lightweight & fast) |

## 👨‍💻 Developer Guide

### Environment Variables

```bash
# Optional: Set custom port (default: 3000)
PORT=8080
```

### Project Structure

```
.
├── server.js           # Main server file
├── package.json        # Dependencies
├── Dockerfile          # Container configuration
├── uploads/            # Temporary audio files
└── README.md          # This file
```

### Key Technologies

- **Express.js** - Web framework
- **Xenova Transformers.js** - Whisper model (runs on CPU)
- **FFmpeg** - Audio conversion
- **Multer** - File upload handling
- **CORS** - Cross-origin support

### Modifying the Server

#### Change the Whisper Model

In `server.js`, line 26, replace the model:
```javascript
transcriber = await pipeline(
  "automatic-speech-recognition",
  "Xenova/whisper-tiny.en"  // Change to whisper-base.en, whisper-small.en, etc.
);
```

**Available Models:**
- `whisper-tiny.en` - Fastest, smallest (lightweight)
- `whisper-base.en` - Balanced
- `whisper-small.en` - Better accuracy
- `whisper-medium.en` - High accuracy
- `whisper-large.en` - Best accuracy (slowest)

#### Change File Size Limit

In `server.js`, line 22:
```javascript
limits: { fileSize: 20 * 1024 * 1024 } // Change 20 to your size in MB
```

#### Change Port

In `server.js`, line 125:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your port
```

### Adding Custom Endpoints

Example - Adding a batch transcription endpoint:
```javascript
app.post('/transcribe-batch', upload.array('audio', 10), async (req, res) => {
  try {
    const results = [];
    for (const file of req.files) {
      // Process each file
      const result = await transcriber(audioData);
      results.push({ filename: file.originalname, text: result.text });
    }
    res.json({ transcriptions: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 📝 Example Usage

### JavaScript/Node.js Client

```javascript
async function transcribeAudio(filePath) {
  const fs = require('fs');
  const FormData = require('form-data');
  
  const form = new FormData();
  form.append('audio', fs.createReadStream(filePath));

  const response = await fetch('http://localhost:3000/transcribe', {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
  });

  const data = await response.json();
  return data.text;
}
```

### Python Client

```python
import requests

def transcribe_audio(file_path):
    with open(file_path, 'rb') as f:
        files = {'audio': f}
        response = requests.post('http://localhost:3000/transcribe', files=files)
    return response.json()['text']
```

### cURL

```bash
curl -X POST -F "audio=@recording.mp3" http://localhost:3000/transcribe
```

## 🚀 Deployment

### Deploy to Render

1. Push your code to GitHub
2. Connect your GitHub repo to [Render](https://render.com)
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Deploy!

### Deploy to Heroku

```bash
git push heroku master
```

### Deploy to Railway

```bash
railway up
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **FFmpeg not found** | Install FFmpeg on your system |
| **Model loading takes too long** | First load caches the model. Subsequent requests are faster |
| **Audio file not accepted** | Ensure file format is supported and under 20MB |
| **CORS errors** | Server has CORS enabled by default |
| **Port already in use** | Change PORT environment variable or kill process using the port |

## 📄 License

ISC License - Feel free to use, modify, and distribute

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📧 Support

For issues, questions, or feature requests, please open an issue on GitHub.

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Batch processing endpoint
- [ ] Streaming transcription
- [ ] Confidence scores
- [ ] Speaker diarization
- [ ] Real-time transcription
- [ ] Audio preprocessing options

---

**Happy Transcribing! 🎤✨**
