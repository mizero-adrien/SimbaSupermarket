import { NextRequest, NextResponse } from 'next/server';
import { Language } from '@/types';

export const runtime = 'nodejs';

interface TranslateRequestBody {
  language?: Language;
  texts?: string[];
}

function safeJsonParse(content: string): { translations?: string[] } | null {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function getLanguageName(language: Language) {
  switch (language) {
    case 'fr':
      return 'French';
    case 'rw':
      return 'Kinyarwanda';
    default:
      return 'English';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { language, texts } = (await request.json()) as TranslateRequestBody;

    if (!language || !['en', 'fr', 'rw'].includes(language)) {
      return NextResponse.json({ error: 'Unsupported language.' }, { status: 400 });
    }

    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'Please provide texts to translate.' }, { status: 400 });
    }

    if (language === 'en') {
      return NextResponse.json({ translations: texts });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ error: 'Groq API key is not configured.' }, { status: 503 });
    }

    const cleanTexts = texts.map(text => String(text ?? ''));
    const prompt = [
      'Translate the provided e-commerce UI strings.',
      `Target language: ${getLanguageName(language)}.`,
      'Return strict JSON only.',
      'JSON shape:',
      '{"translations":["translated text 1","translated text 2"]}',
      'Rules:',
      '- Preserve the order exactly.',
      '- Keep the number of items identical to the input.',
      '- Preserve brand names like Simba Supermarket, Kigali, MTN, Airtel, MoMo, and RWF unless direct localization is clearly needed.',
      '- Preserve numbers, punctuation, arrows, and emoji when natural.',
      '- Keep translations concise and suitable for UI labels.',
      `Input texts: ${JSON.stringify(cleanTexts)}`,
    ].join('\n');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 1200,
        messages: [
          {
            role: 'system',
            content: 'Return valid JSON only. No markdown, no code fences, no extra text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Translation request failed.' }, { status: 502 });
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = payload.choices?.[0]?.message?.content ?? '';
    const parsed = safeJsonParse(content);
    const translations = parsed?.translations;

    if (!Array.isArray(translations) || translations.length !== cleanTexts.length) {
      return NextResponse.json({ error: 'Invalid translation response.' }, { status: 502 });
    }

    return NextResponse.json({
      translations: translations.map((text, index) =>
        typeof text === 'string' && text.trim().length > 0 ? text.trim() : cleanTexts[index]
      ),
    });
  } catch {
    return NextResponse.json(
      { error: 'Translation failed. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
