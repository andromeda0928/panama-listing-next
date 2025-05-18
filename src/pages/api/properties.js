// pages/api/properties.js

export default async function handler(req, res) {
  const API_KEY    = process.env.AIRTABLE_API_KEY;
  const BASE_ID    = process.env.AIRTABLE_BASE_ID;
  const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
  const API_URL    = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

  try {
    // Limitamos a 5 registros para la prueba
    const resp = await fetch(`${API_URL}?maxRecords=5`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!resp.ok) {
      return res
        .status(resp.status)
        .json({ error: `Airtable responded ${resp.status}: ${resp.statusText}` });
    }

    const data = await resp.json();
    // Respondemos tal cual viene de Airtable
    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Airtable fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
}
