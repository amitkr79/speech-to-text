import express from 'express';
import cors from 'cors';
import { pipeline } from '@xenova/transformers';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import wav from 'node-wav';

// Set ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Upload handler
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// Whisper model instance
let transcriber;

// Load Whisper model on server start
(async () => {
  console.log("⏳ Loading Whisper model... (first load takes time)");
  transcriber = await pipeline(
    "automatic-speech-recognition",
    "Xenova/whisper-tiny.en"
  );
  console.log("✅ Whisper model loaded!");
})();

// Convert audio → WAV PCM 16-bit 16kHz mono
function convertAudioToWav(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioChannels(1)
      .audioFrequency(16000)
      .audioCodec('pcm_s16le')
      .format('wav')
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
}

// Read file buffer
function readFileBuffer(filepath) {
  return fs.readFileSync(filepath);
}

// Decode WAV → Float32Array
function decodeWavToFloat32(buffer) {
  const decoded = wav.decode(buffer);
  return decoded.channelData[0]; // Float32Array PCM samples
}

// Transcription endpoint
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  let tempFiles = [];

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    console.log(`📥 Received: ${req.file.originalname}, size: ${req.file.size}`);

    const inputFilePath = req.file.path;
    tempFiles.push(inputFilePath);

    // Convert to WAV
    const wavFilePath = path.join(
      'uploads',
      `converted_${Date.now()}.wav`
    );
    tempFiles.push(wavFilePath);

    await convertAudioToWav(inputFilePath, wavFilePath);

    // Read WAV file
    const wavBuffer = readFileBuffer(wavFilePath);

    // Decode → Float32 PCM
    const audioData = decodeWavToFloat32(wavBuffer);

    console.log("🔊 Transcribing audio...");

    // Run Whisper
    const result = await transcriber(audioData);

    console.log("✅ Transcription:", result.text);

    res.json({ text: result.text });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    // Cleanup temporary files
    tempFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      } catch {}
    });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', model: 'whisper-tiny.en' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎤 Server running at http://localhost:${PORT}`);
  console.log(`📍 POST /transcribe`);
});
