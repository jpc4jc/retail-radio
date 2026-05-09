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

export async function GET() {
  try {
    const fredKey = process.env.FRED_API_KEY;
    if (!fredKey) return NextResponse.json({ error: "FRED_API_KEY not configured." }, { status: 500 });

    const [retail, food, ecomm, confidence, spending] = await Promise.all([
      fetchFredSeries("RSXFS", fredKey),
      fetchFredSeries("RSFSDP", fredKey),
      fetchFredSeries("ECOMSA", fredKey),
      fetchFredSeries("UMCSENT", fredKey),
      fetchFredSeries("PCE", fredKey),
    ]);

    const kpis = [
      {
        label: "Total Retail",
        val: retail ? `$${retail.latest}B` : "—",
        change: retail ? `${parseFloat(retail.change) > 0 ? "+" : ""}${retail.change}%` : "",
        date: retail?.date || "",
      },
      {
        label: "Food Services",
        val: food ? `$${food.latest}B` : "—",
        change: food ? `${parseFloat(food.change) > 0 ? "+" : ""}${food.change}%` : "",
        date: food?.date || "",
      },
      {
        label: "E-Commerce",
        val: ecomm ? `$${ecomm.latest}B` : "—",
        change: ecomm ? `${parseFloat(ecomm.change) > 0 ? "+" : ""}${ecomm.change}%` : "",
        date: ecomm?.date || "",
      },
      {
        label: "Consumer Confidence",
        val: confidence ? confidence.latest : "—",
        change: confidence ? `${parseFloat(confidence.change) > 0 ? "+" : ""}${confidence.change}%` : "",
        date: confidence?.date || "",
      },
      {
        label: "Consumer Spending",
        val: spending ? `$${spending.latest}B` : "—",
        change: spending ? `${parseFloat(spending.change) > 0 ? "+" : ""}${spending.change}%` : "",
        date: spending?.date || "",
      },
    ];

    return NextResponse.json({ kpis });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
