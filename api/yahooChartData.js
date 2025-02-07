// api/yahooChartData.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { symbol, period1, period2, interval } = req.query;

  if (!symbol || !period1 || !period2 || !interval) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data from Yahoo Finance:", error);
    res.status(500).json({ error: 'Failed to fetch chart data from Yahoo Finance' });
  }
}