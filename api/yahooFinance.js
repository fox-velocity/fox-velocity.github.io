// api/yahooFinance.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { q } = req.query;
  console.log("API: Query received:", q);

  if (!q) {
    console.log("API: No query provided");
    return res.status(400).json({ error: 'Missing query parameter "q"' });
  }

  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${q}^`;
  console.log("API: Fetching URL:", url);

  try {
    const response = await fetch(url);
    console.log("API: Response status:", response.status);

    if (!response.ok) {
      console.error("API: Yahoo Finance API error:", response.status, response.statusText);
      throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API: Data received from Yahoo Finance");
    res.status(200).json(data);
  } catch (error) {
    console.error("API: Error fetching data from Yahoo Finance:", error);
    res.status(500).json({ error: 'Failed to fetch data from Yahoo Finance' });
  }
}