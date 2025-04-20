const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Replace with your actual Gemini API key
const GEMINI_API_KEY = 'AIzaSyDpNGBJDbBWhqREWm2kUFso7uqXws2FScU';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`;

app.use(express.json());

app.get('/edit', async (req, res) => {
  const { text, url } = req.query;

  if (!text || !url) {
    return res.status(400).json({ error: 'Missing required query parameters: text and url' });
  }

  try {
    // Fetch the image from the provided URL
    const imageResponse = await axios.get(url, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary');
    const imageBase64 = imageBuffer.toString('base64');

    // Determine the image MIME type (default to 'image/jpeg' if unknown)
    const contentType = imageResponse.headers['content-type'] || 'image/jpeg';

    // Construct the request payload for the Gemini API
    const payload = {
      contents: [
        {
          parts: [
            { text: text },
            {
              inline_data: {
                mime_type: contentType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "image/png"
      }
    };

    // Send the request to the Gemini API
    const geminiResponse = await axios.post(GEMINI_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
    });

    // Convert the response to base64
    const editedImageBase64 = Buffer.from(geminiResponse.data, 'binary').toString('base64');

    // Send the edited image as a base64-encoded string
    res.json({ image: `data:image/png;base64,${editedImageBase64}` });
  } catch (error) {
    console.error('Error processing /edit request:', error.message);
    res.status(500).json({ error: 'Failed to process the request' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});