import { NextRequest, NextResponse } from 'next/server';
import productsSeed from '../../../../../public/simba_products.json';
import { Product } from '@/types';

export const runtime = 'nodejs';

interface SearchResponse {
  reply: string;
  products: Product[];
}

const catalog = productsSeed as Product[];

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(token => token.length >= 2);
}

function pickCandidates(message: string, limit = 80): Product[] {
  const tokens = tokenize(message);
  if (tokens.length === 0) return catalog.slice(0, limit);

  const scored = catalog
    .map(product => {
      const name = product.name.toLowerCase();
      const category = product.category.toLowerCase();
      const description = (product.description ?? '').toLowerCase();

      let score = 0;
      for (const token of tokens) {
        if (name.includes(token)) score += 4;
        if (category.includes(token)) score += 2;
        if (description.includes(token)) score += 1;
      }
      if (name.includes(message.toLowerCase())) score += 6;

      return { product, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product);

  return scored.length > 0 ? scored : catalog.slice(0, limit);
}

function fallbackSearch(message: string): SearchResponse {
  const tokens = tokenize(message);
  const matches = catalog.filter(product => {
    const haystack = `${product.name} ${product.category} ${product.description ?? ''}`.toLowerCase();
    return tokens.some(token => haystack.includes(token));
  });

  const products = (matches.length > 0 ? matches : catalog).slice(0, 8);
  const reply =
    matches.length > 0
      ? `I found ${matches.length} items that match your request. Here are the best picks.`
      : 'I could not find an exact match, but here are popular options you can choose from.';

  return { reply, products };
}

function safeJsonParse(content: string): { reply?: string; matchedIds?: Array<string | number> } | null {
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

export async function POST(request: NextRequest) {
  try {
    const { message } = (await request.json()) as { message?: string };

    if (!message || message.trim().length < 2) {
      return NextResponse.json({ error: 'Please provide a search message.' }, { status: 400 });
    }

    const query = message.trim();
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      const fallback = fallbackSearch(query);
      return NextResponse.json(fallback);
    }

    const candidates = pickCandidates(query);
    const compactCatalog = candidates.map(product => ({
      id: String(product.id),
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description ?? '',
    }));

    const prompt = [
      'You are an e-commerce product assistant for Simba Supermarket.',
      'Given user intent and the catalog candidates, return strict JSON only.',
      'JSON shape:',
      '{"reply":"short helpful sentence","matchedIds":["id1","id2"]}',
      'Rules:',
      '- Keep reply under 35 words.',
      '- Choose up to 8 matchedIds from candidate ids only.',
      '- Prefer fresh and practical options when user asks generally (e.g. breakfast).',
      '- Do not invent products.',
      `User message: ${query}`,
      `Catalog candidates: ${JSON.stringify(compactCatalog)}`,
    ].join('\n');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 350,
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
      const fallback = fallbackSearch(query);
      return NextResponse.json(fallback);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = payload.choices?.[0]?.message?.content ?? '';
    const parsed = safeJsonParse(content);

    if (!parsed?.matchedIds || !Array.isArray(parsed.matchedIds)) {
      const fallback = fallbackSearch(query);
      return NextResponse.json(fallback);
    }

    const matched = parsed.matchedIds
      .map(id => catalog.find(product => String(product.id) === String(id)))
      .filter((product): product is Product => Boolean(product))
      .slice(0, 8);

    const products = matched.length > 0 ? matched : fallbackSearch(query).products;
    const reply =
      typeof parsed.reply === 'string' && parsed.reply.trim().length > 0
        ? parsed.reply.trim()
        : `I found ${products.length} matching products for you.`;

    return NextResponse.json({ reply, products } satisfies SearchResponse);
  } catch {
    return NextResponse.json(
      { error: 'Search failed. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
