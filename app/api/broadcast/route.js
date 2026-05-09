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
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const fredKey = process.env.FRED_API_KEY;
    const elevenKey = process.env.ELEVENLABS_API_KEY;

    if (!anthropicKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured." }, { status: 500 });
    if (!fredKey) return NextResponse.json({ error: "FRED_API_KEY not configured." }, { status: 500 });

    const [retail, food, ecomm, gas, grocery, clothing, electronics, unemployment, credit, spending, confidence, cpi, savings] = await Promise.all([
      fetchFredSeries("RSXFS", fredKey),
      fetchFredSeries("RSFSDP", fredKey),
      fetchFredSeries("ECOMSA", fredKey),
      fetchFredSeries("RSGASS", fredKey),
      fetchFredSeries("RSGCSN", fredKey),
      fetchFredSeries("RSCCASN", fredKey),
      fetchFredSeries("RSBPBSN", fredKey),
      fetchFredSeries("UNRATE", fredKey),
      fetchFredSeries("REVOLSL", fredKey),
      fetchFredSeries("PCE", fredKey),
      fetchFredSeries("UMCSENT", fredKey),
      fetchFredSeries("CPIAUCSL", fredKey),
      fetchFredSeries("PSAVERT", fredKey),
    ]);

    const retailData = `
Live Economic Data from FRED:

RETAIL SALES (Census Bureau):
- Total Retail & Food Services: $${retail?.latest}B (${parseFloat(retail?.change) > 0 ? "+" : ""}${retail?.change}% vs prior period) as of ${retail?.date}
- Food Services & Drinking Places: $${food?.latest}B (${parseFloat(food?.change) > 0 ? "+" : ""}${food?.change}%) as of ${food?.date}
- E-Commerce: $${ecomm?.latest}B (${parseFloat(ecomm?.change) > 0 ? "+" : ""}${ecomm?.change}%) as of ${ecomm?.date}
- Gasoline Stations: $${gas?.latest}B (${parseFloat(gas?.change) > 0 ? "+" : ""}${gas?.change}%) as of ${gas?.date}
- Grocery Stores: $${grocery?.latest}B (${parseFloat(grocery?.change) > 0 ? "+" : ""}${grocery?.change}%) as of ${grocery?.date}
- Clothing & Accessories: $${clothing?.latest}B (${parseFloat(clothing?.change) > 0 ? "+" : ""}${clothing?.change}%) as of ${clothing?.date}
- Electronics & Appliances: $${electronics?.latest}B (${parseFloat(electronics?.change) > 0 ? "+" : ""}${electronics?.change}%) as of ${electronics?.date}

CONSUMER HEALTH:
- Unemployment Rate: ${unemployment?.latest}% (${parseFloat(unemployment?.change) > 0 ? "+" : ""}${unemployment?.change}%) as of ${unemployment?.date}
- Revolving Consumer Credit (credit cards): $${credit?.latest}B (${parseFloat(credit?.change) > 0 ? "+" : ""}${credit?.change}%) as of ${credit?.date}
- Personal Consumption Expenditures: $${spending?.latest}B (${parseFloat(spending?.change) > 0 ? "+" : ""}${spending?.change}%) as of ${spending?.date}
- Consumer Sentiment Index: ${confidence?.latest} (${parseFloat(confidence?.change) > 0 ? "+" : ""}${confidence?.change}%) as of ${confidence?.date}
- Inflation (CPI): ${cpi?.latest} (${parseFloat(cpi?.change) > 0 ? "+" : ""}${cpi?.change}%) as of ${cpi?.date}
- Personal Savings Rate: ${savings?.latest}% (${parseFloat(savings?.change) > 0 ? "+" : ""}${savings?.change}%) as of ${savings?.date}
`;

    const scriptRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: `You are a professional radio news anchor for a financial news station called Retail Radio. Write a 2-minute broadcast script (approximately 280-320 words) analyzing the latest U.S. retail and consumer economic data below.

Structure the broadcast in 4 clear segments:
1. Strong opening headline (2-3 sentences) — hook the listener with the biggest story
2. Retail deep dive (3-4 sentences) — cover total retail, standout categories, winners and losers
3. Consumer health check (3-4 sentences) — weave together unemployment, inflation, savings rate, credit card debt, and sentiment into a narrative about the American consumer
4. Forward look (2-3 sentences) — what should listeners watch for next and what it means for their wallets

Write in a conversational, broadcast style as if speaking live on air. Be specific with numbers. Draw connections between data points — for example, if inflation is high but spending is up, say what that means. Do NOT include stage directions, segment labels, sound effects, anchor names, or any formatting — just the spoken words as flowing paragraphs.

Data:
${retailData}`
        }]
      }),
    });

    const scriptData = await scriptRes.json();
    if (scriptData.error) return NextResponse.json({ error: scriptData.error.message }, { status: 500 });
    const script = scriptData.content.map((b) => b.text || "").join("\n");

    if (!elevenKey) {
      return NextResponse.json({ script, audio: null, ttsError: "No ElevenLabs key" });
    }

    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": elevenKey,
      },
      body: JSON.stringify({
        text: script,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      return NextResponse.json({ script, audio: null, ttsError: errText });
    }

    const audioBuffer = await ttsRes.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");
    return NextResponse.json({ script, audio: audioBase64, ttsError: null });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
