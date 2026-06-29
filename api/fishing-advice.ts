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
              content: `Ти си опитен български рибар с 30 години стаж.
Пишеш кратък съвет за риболов — максимум 3 изречения, без излишни думи.

ЗАДЪЛЖИТЕЛНА ТЕРМИНОЛОГИЯ — използвай само тези термини:
- Техники: фидер, спининг, ваглер, плувка, мухарство, кльонк, шаранджийски риболов
- Такъми: въдица, макара, влакно, повод, хранилка, монтаж, кука, тежест, сигнализатор
- Стръв: червей, торен червей, бял червей, опариш, царевица, жито, коноп, тесто, пелети, бойли, кюспе, черен дроб, живарка
- Изкуствени примамки: воблер, блесна, силикон, туистер, клатушка
- Поведение: кълване, засичане, захапка, хранене, пасе

ЗАБРАНЕНО: директни преводи от английски, думи като lure, feeding, strike, cast.

СТРУКТУРА — точно 3 изречения:
1. ЗАЩО: поведението на рибата спрямо условията (налягане, луна, температура, сезон)
2. КАКВО: конкретна техника, монтаж и стръв за тази риба и terrain
3. КОГА: ако isInPeak=true — кажи да хвърля веднага. Иначе — препоръчай най-добрия час.

АКО meteoAlert.level не е null — включи предупреждение в съвета.
НЕ използвай emoji. НЕ добавяй заглавия. Само текст.`,
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
