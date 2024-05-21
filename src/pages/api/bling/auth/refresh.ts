import { NextApiRequest, NextApiResponse } from 'next';

interface RefreshRequestBody {
  client_id: string;
  client_secret: string;
  refresh_token: string;
}

const validateRequestBody = (body: any): body is RefreshRequestBody => {
  return (
    typeof body === 'object' &&
    'client_id' in body &&
    'client_secret' in body &&
    'refresh_token' in body
  );
};

export default async function refresh(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: 'Method not allowed. Only POST is allowed.' });
    return;
  }

  let formData: RefreshRequestBody;
  try {
    formData = JSON.parse(req.body);
  } catch (error) {
    res.status(400).json({ error: 'Invalid JSON in request body' });
    return;
  }

  if (!validateRequestBody(formData)) {
    res.status(400).json({ error: 'Invalid parameters. Required: client_id, client_secret, refresh_token' });
    return;
  }

  const { refresh_token, client_id, client_secret } = formData;
  const credentials = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  const url = process.env.BLING_API_TOKEN_ENDPOINT as string;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      res.status(response.status).json({ error: errorData });
      return;
    }

    const data = await response.json();
    res.status(200).send(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error making request to Bling API' });
  }
}
