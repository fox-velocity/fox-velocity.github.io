// api/yahooFinanceISIN.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { q } = req.query;
  const lang = 'fr-FR';
  const region = 'FR';

  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter "q"' });
  }

  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${q}&lang=${lang}®ion=${region}"esCount=6&newsCount=3&listsCount=2&enableFuzzyQuery=false"esQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&newsQueryId=news_cie_vespa&enableCb=true&enableNavLinks=true&enableEnhancedTrivialQuery=true&enableResearchReports=true&enableCulturalAssets=true&enableLogoUrl=true&enableLists=false&recommendCount=5`;

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
