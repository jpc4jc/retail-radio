import { NextResponse } from "next/server";

export async function POST() {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured." }, { status: 500 });
    }

    const retailData = `
U.S. Census Bureau Advance Monthly Retail Trade Report — March 2026:
- Total retail & food services sales: $724.1 billion, up 1.9% from February 2026
- Year-over-year growth: +4.2%
- Nonstore retailers (e-commerce): +10.1% year-over-year — strongest category
- Food services & drinking places: +6.3% year-over-year
- Motor vehicle & parts dealers: +2.1% month-over-month
- Gasoline stations: +3.2% month-over-month (largely price-driven)
- Clothing & accessory stores: -0.4% month-over-month
- Furniture & home furnishings: -1.2% month-over-month
- Health & personal care stores: +2.8% year-over-year
- Electronics & appliance stores: +0.6% month-over-month
- Food & beverage stores: +1.1% month-over-month
- Next release: April 2026 data on May 14, 2026 at 8:30 AM EDT
`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
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

    const data = await response.json();
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const script = data.content.map((b) => b.text || "").join("\n");
    return NextResponse.json({ script });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
