import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageBase64, imageType } = req.body;

  if (!imageBase64 || !imageType) {
    return res.status(400).json({ error: "Missing image data" });
  }

  // Detailed analysis + prompt generation request
  const question = `
    Analyze this image in detail:
    - Describe everything visible from top to bottom.
    - Include objects, subjects, background, and colors.
    - Describe textures, lighting, and style.
    - Provide a structured summary of the image (like JSON: objects, colors, positions, sizes).
    - Generate a creative prompt that could be used to generate a similar image with AI.
  `;

  const payload = {
    model: "openai",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: question },
          { type: "image_url", image_url: { url: `data:${imageType};base64,${imageBase64}` } }
        ]
      }
    ],
    max_tokens: 800
  };

  try {
    const response = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content || "No description found";

    // Split into detailed analysis + generated prompt (if possible)
    // Optional: you can parse or format JSON here if OpenAI returns JSON
    res.status(200).json({
      analysis: description,
      generatedPrompt: description // in future, you can separate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
