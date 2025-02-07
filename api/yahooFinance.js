// api/yahooFinance.js
import fetch from 'node-fetch'; // Import nécessaire pour utiliser fetch en Node.js

export default async function handler(req, res) {
  const { q } = req.query; // Récupère le paramètre 'q' de la requête

  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter "q"' });
  }

  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${q}^`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data from Yahoo Finance:", error);
    res.status(500).json({ error: 'Failed to fetch data from Yahoo Finance' });
  }
}