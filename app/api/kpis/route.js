import { NextResponse } from "next/server";

async function fetchFredSeries(seriesId, apiKey) {
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&sort_order=desc&limit=2&file_type=json`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.observations || data.observations.length === 0) return null;
    const latest = parseFloat(data.observations[0].value);
    const prior = parseFloat(data.observations[1].value);
    const change = (((latest - prior) / prior) * 100).toFixed(1);
    const formatted = latest.toFixed(1);
    return { latest: formatted, raw: latest, change, date: data.observations[0].date };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const fredKey = process.env.FRED_API_KEY;
    if (!fredKey) return NextResponse.json({ error: "FRED_API_KEY not configured." }, { status: 500 });

    const [
      retail, food, ecomm, gas, grocery, clothing,
      unemployment, credit, spending, confidence,
      vehicles, furniture, health, department, sporting,
      general, nonstore, retailEx, savings, cpi,
      disposable, totalCredit, prime, fedfunds
    ] = await Promise.all([
      fetchFredSeries("RSXFS", fredKey),
      fetchFredSeries("RSFSDP", fredKey),
      fetchFredSeries("ECOMSA", fredKey),
      fetchFredSeries("RSGASS", fredKey),
      fetchFredSeries("RSGCSN", fredKey),
      fetchFredSeries("RSCCASN", fredKey),
      fetchFredSeries("UNRATE", fredKey),
      fetchFredSeries("REVOLSL", fredKey),
      fetchFredSeries("PCE", fredKey),
      fetchFredSeries("UMCSENT", fredKey),
      fetchFredSeries("RSMVPD", fredKey),
      fetchFredSeries("RSFHFS", fredKey),
      fetchFredSeries("RSHPCSN", fredKey),
      fetchFredSeries("RSDSN", fredKey),
      fetchFredSeries("RSSGHBMS", fredKey),
      fetchFredSeries("RSDGFSN", fredKey),
      fetchFredSeries("RSNSR", fredKey),
      fetchFredSeries("RSXFSN", fredKey),
      fetchFredSeries("PSAVERT", fredKey),
      fetchFredSeries("CPIAUCSL", fredKey),
      fetchFredSeries("DSPIC96", fredKey),
      fetchFredSeries("TOTALSL", fredKey),
      fetchFredSeries("MPRIME", fredKey),
      fetchFredSeries("FEDFUNDS", fredKey),
    ]);

    const kpis = [
      { label: "Total Retail", val: retail ? `$${retail.latest}B` : "—", change: retail ? `${parseFloat(retail.change) > 0 ? "+" : ""}${retail.change}%` : "", date: retail?.date || "" },
      { label: "Food Services", val: food ? `$${food.latest}B` : "—", change: food ? `${parseFloat(food.change) > 0 ? "+" : ""}${food.change}%` : "", date: food?.date || "" },
      { label: "E-Commerce", val: ecomm ? `$${ecomm.latest}B` : "—", change: ecomm ? `${parseFloat(ecomm.change) > 0 ? "+" : ""}${ecomm.change}%` : "", date: ecomm?.date || "" },
      { label: "Gasoline Stations", val: gas ? `$${gas.latest}B` : "—", change: gas ? `${parseFloat(gas.change) > 0 ? "+" : ""}${gas.change}%` : "", date: gas?.date || "" },
      { label: "Grocery Stores", val: grocery ? `$${grocery.latest}B` : "—", change: grocery ? `${parseFloat(grocery.change) > 0 ? "+" : ""}${grocery.change}%` : "", date: grocery?.date || "" },
      { label: "Clothing & Accessories", val: clothing ? `$${clothing.latest}B` : "—", change: clothing ? `${parseFloat(clothing.change) > 0 ? "+" : ""}${clothing.change}%` : "", date: clothing?.date || "" },
      { label: "Unemployment Rate", val: unemployment ? `${unemployment.raw.toFixed(1)}%` : "—", change: unemployment ? `${parseFloat(unemployment.change) > 0 ? "+" : ""}${unemployment.change}%` : "", date: unemployment?.date || "" },
      { label: "Revolving Credit", val: credit ? `$${credit.latest}B` : "—", change: credit ? `${parseFloat(credit.change) > 0 ? "+" : ""}${credit.change}%` : "", date: credit?.date || "" },
      { label: "Consumer Spending", val: spending ? `$${spending.latest}B` : "—", change: spending ? `${parseFloat(spending.change) > 0 ? "+" : ""}${spending.change}%` : "", date: spending?.date || "" },
      { label: "Consumer Sentiment", val: confidence ? confidence.raw.toFixed(1) : "—", change: confidence ? `${parseFloat(confidence.change) > 0 ? "+" : ""}${confidence.change}%` : "", date: confidence?.date || "" },
    ];

    const ticker = [
      { label: "Motor Vehicles & Parts", val: vehicles ? `$${vehicles.latest}B` : "—", change: vehicles ? `${parseFloat(vehicles.change) > 0 ? "+" : ""}${vehicles.change}%` : "" },
      { label: "Furniture & Home Furnishings", val: furniture ? `$${furniture.latest}B` : "—", change: furniture ? `${parseFloat(furniture.change) > 0 ? "+" : ""}${furniture.change}%` : "" },
      { label: "Health & Personal Care", val: health ? `$${health.latest}B` : "—", change: health ? `${parseFloat(health.change) > 0 ? "+" : ""}${health.change}%` : "" },
      { label: "Department Stores", val: department ? `$${department.latest}B` : "—", change: department ? `${parseFloat(department.change) > 0 ? "+" : ""}${department.change}%` : "" },
      { label: "Sporting Goods & Hobby", val: sporting ? `$${sporting.latest}B` : "—", change: sporting ? `${parseFloat(sporting.change) > 0 ? "+" : ""}${sporting.change}%` : "" },
      { label: "General Merchandise", val: general ? `$${general.latest}B` : "—", change: general ? `${parseFloat(general.change) > 0 ? "+" : ""}${general.change}%` : "" },
      { label: "Nonstore Retailers", val: nonstore ? `$${nonstore.latest}B` : "—", change: nonstore ? `${parseFloat(nonstore.change) > 0 ? "+" : ""}${nonstore.change}%` : "" },
      { label: "Retail ex-Food Services", val: retailEx ? `$${retailEx.latest}B` : "—", change: retailEx ? `${parseFloat(retailEx.change) > 0 ? "+" : ""}${retailEx.change}%` : "" },
      { label: "Personal Savings Rate", val: savings ? `${savings.raw.toFixed(1)}%` : "—", change: savings ? `${parseFloat(savings.change) > 0 ? "+" : ""}${savings.change}%` : "" },
      { label: "Inflation (CPI)", val: cpi ? cpi.raw.toFixed(1) : "—", change: cpi ? `${parseFloat(cpi.change) > 0 ? "+" : ""}${cpi.change}%` : "" },
      { label: "Real Disposable Income", val: disposable ? `$${disposable.latest}B` : "—", change: disposable ? `${parseFloat(disposable.change) > 0 ? "+" : ""}${disposable.change}%` : "" },
      { label: "Total Consumer Credit", val: totalCredit ? `$${totalCredit.latest}B` : "—", change: totalCredit ? `${parseFloat(totalCredit.change) > 0 ? "+" : ""}${totalCredit.change}%` : "" },
      { label: "Prime Rate", val: prime ? `${prime.raw.toFixed(2)}%` : "—", change: prime ? `${parseFloat(prime.change) > 0 ? "+" : ""}${prime.change}%` : "" },
      { label: "Fed Funds Rate", val: fedfunds ? `${fedfunds.raw.toFixed(2)}%` : "—", change: fedfunds ? `${parseFloat(fedfunds.change) > 0 ? "+" : ""}${fedfunds.change}%` : "" },
    ];

    return NextResponse.json({ kpis, ticker });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
