const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are an expert web developer specializing in creating beautiful, modern websites using HTML and Tailwind CSS. 

When given a description, generate a COMPLETE, SINGLE-FILE HTML website that:
1. Uses Tailwind CSS via CDN (include <script src="https://cdn.tailwindcss.com"></script>)
2. Is fully responsive (mobile-first)
3. Has beautiful, professional design with modern aesthetics
4. Includes realistic placeholder content that matches the request
5. Uses Google Fonts via CDN for typography
6. Has smooth CSS animations and hover effects
7. Is production-ready and visually impressive

CRITICAL RULES:
- Return ONLY the complete HTML code, nothing else
- Start with <!DOCTYPE html> and end with </html>
- No markdown, no explanation, no code blocks - just raw HTML
- Include ALL styles inline or in <style> tags + Tailwind classes
- Make it visually stunning with gradients, shadows, and modern design patterns
- Add Font Awesome icons via CDN: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
`;

export async function generateWebsite(prompt: string): Promise<{ html: string; name: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Create a website for: ${prompt}\n\nReturn only the complete HTML code.`,
        },
      ],
      max_tokens: 8000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const html = data.choices?.[0]?.message?.content?.trim() || "";

  if (!html.includes("<!DOCTYPE") && !html.includes("<html")) {
    throw new Error("Invalid HTML generated");
  }

  // Generate a project name from the prompt
  const name = generateProjectName(prompt);

  return { html, name };
}

function generateProjectName(prompt: string): string {
  const words = prompt.trim().split(/\s+/).slice(0, 4);
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
