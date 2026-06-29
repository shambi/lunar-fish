export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;
  if (!body?.fish) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 300,
          messages: [
            {
              role: 'system',
              content: `Ти си опитен български рибар с 30 години стаж. Говориш като истински рибар — кратко, конкретно, без книжовни или преведени изрази.

ЗАДЪЛЖИТЕЛНИ ТЕРМИНИ — само тези:
Техники: фидер, спининг, ваглер, плувка, мухарство, кльонк
Стръв: червей, торен червей, опариш, царевица, жито, коноп, тесто, пелети, бойли, черен дроб, живарка
Примамки: воблер, блесна, силикон, туистер, клатушка
Поведение: кълва, засича, пасе, хапва, активна, пасивна

ЗАБРАНЕНО — никога не използвай:
- "презентация" (казвай "водене на примамката" или "стръвта")
- "успейки", "хоросо", "прихванеш"
- Английски думи
- Медицински или здравни съвети
- Повече от 3 изречения

СТРУКТУРА — точно 3 кратки изречения:
1. Защо рибата е активна или пасивна точно сега — налягане, луна, температура, сезон. Конкретно за този вид.
2. Каква техника, монтаж и стръв да използва — конкретни числа (размер кука, дебелина влакно, тежест).
3. Кога да хвърля — ако isInPeak е true, кажи "Хвърляй сега — тече малък/голям солунарен пик". Иначе — конкретен час.

АКО има meteoAlert — спомени го в изречение 1 или 2 само с риболовното му значение. Например: "Внимавай — гръмотевици след 18:00, прибирай се навреме."
НЕ обяснявай какво е опасно за здравето.`,
            },
            {
              role: 'user',
              content: JSON.stringify(body),
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      return res.status(502).json({ error: 'Upstream API error' });
    }

    const data = await response.json();
    const advice = data.choices[0].message.content;
    return res.status(200).json({ advice });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
