import { NextResponse } from "next/server";

async function fetchFredSeries(seriesId, apiKey) {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&sort_order=desc&limit=2&file_type=json`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.observations || data.observations.length === 0) return null;
  const latest = parseFloat(data.observations[0].value);
  const prior = parseFloat(data.observations[1].value);
  const change = (((latest - prior) / prior) * 100).toFixed(1);
  return { latest: latest.toFixed(1), change, date: data.observations[0].date };
}

export async function POST() {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const fredKey = process.env.FRED_API_KEY;
    const elevenKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured." }, { status: 500 });
    if (!fredKey) return NextResponse.json({ error: "FRED_API_KEY not configured." }, { status: 500 });

    const [retail, food, ecomm] = await Promise.all([
      fetchFredSeries("RSXFS", fredKey),
      fetchFredSeries("RSFSDP", fredKey),
      fetchFredSeries("ECOMSA", fredKey),
    ]);

    const retailData = `
Live FRED Retail Data:
- Total Retail & Food Services Sales: $${retail?.latest}B (${retail?.change > 0 ? "+" : ""}${retail?.change}% vs prior period) as of ${retail?.date}
- Food Services & Drinking Places: $${food?.latest}B (${food?.change > 0 ? "+" : ""}${food?.change}% vs prior period) as of ${food?.date}
- E-Commerce Sales: $${ecomm?.latest}B (${ecomm?.change > 0 ? "+" : ""}${ecomm?.change}% vs prior period) as of ${ecomm?.date}
`;

    const scriptRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `You are a professional radio news anchor for a financial news station called Retail Radio. Write a 60-90 second broadcast script (approximately 150-200 words) analyzing the latest U.S. retail sales data below.

Write in a conversational, broadcast style as if speaking live on air. Start with a strong opening line that hooks the listener. Include 2-3 key insights with context. End with a forward-looking statement about what to watch next. Do NOT include stage directions, sound effects, anchor names, or any formatting — just the spoken words as plain paragraphs.

Data:
${retailData}`
        }]
      }),
    });

    const scriptData = await scriptRes.json();
    if (scriptData.error) return NextResponse.json({ error: scriptData.error.message }, { status: 500 });
    const script = scriptData.content.map((b) => b.text || "").join("\n");

if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      return NextResponse.json({ script, audio: null, ttsError: errText });
    }

    const ttsRes = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": elevenKey,
      },
      body: JSON.stringify({
        text: script,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!ttsRes.ok) {
      return NextResponse.json({ script, audio: null });
    }

    const audioBuffer = await ttsRes.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");
    return NextResponse.json({ script, audio: audioBase64, ttsError: null });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
