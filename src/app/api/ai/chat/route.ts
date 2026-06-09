import { NextRequest, NextResponse } from 'next/server';
import productsSeed from '../../../../../public/simba_products.json';
import { Product } from '@/types';

export const runtime = 'nodejs';

const catalog = productsSeed.products as Product[];
const categories = Array.from(new Set(catalog.map(p => p.category))).sort();

interface CartItemSummary {
  name: string;
  quantity: number;
  price: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface NavLink {
  label: string;
  href: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  cart?: {
    items: CartItemSummary[];
    totalItems: number;
    totalPrice: number;
  };
}

type ResponseType = 'products' | 'text' | 'guide';

interface ChatResponse {
  type: ResponseType;
  reply: string;
  products?: Product[];
  links?: NavLink[];
}

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(token => token.length >= 2);
}

function pickCandidates(message: string, limit = 80): Product[] {
  const lower = message.toLowerCase();
  const tokens = tokenize(message);

  const priceMatch = lower.match(/under\s+(\d+)|below\s+(\d+)|less than\s+(\d+)|cheaper than\s+(\d+)/);
  const maxPrice = priceMatch
    ? parseInt(priceMatch[1] ?? priceMatch[2] ?? priceMatch[3] ?? priceMatch[4] ?? '')
    : null;

  const pool = maxPrice != null ? catalog.filter(p => p.price <= maxPrice) : catalog;
  const source = pool.length > 0 ? pool : catalog;

  if (tokens.length === 0) return source.slice(0, limit);

  const scored = source
    .map(product => {
      const name = product.name.toLowerCase();
      const category = product.category.toLowerCase();
      const description = (product.description ?? '').toLowerCase();
      let score = maxPrice != null ? 1 : 0;
      for (const token of tokens) {
        if (name.includes(token)) score += 4;
        if (category.includes(token)) score += 2;
        if (description.includes(token)) score += 1;
      }
      if (name.includes(lower)) score += 6;
      return { product, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product);

  return scored.length > 0 ? scored : source.slice(0, limit);
}

function safeJsonParse(content: string): Record<string, unknown> | null {
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

function fallbackResponse(message: string): ChatResponse {
  const lower = message.toLowerCase();
  const guideKeywords = ['how', 'shop', 'buy', 'order', 'checkout', 'sign', 'login', 'account', 'register', 'create', 'delivery', 'pickup', 'pay', 'return', 'navigate', 'language', 'where', 'branch', 'locate', 'find', 'help', 'start'];
  const isGuide = guideKeywords.some(k => lower.includes(k)) && !lower.includes('find me') && !lower.includes('show me');

  if (isGuide) {
    return {
      type: 'guide',
      reply: "Here's how to shop on Simba: Browse products at /products, add items to cart, then click 'Proceed to Checkout'. You'll need to sign in, fill your delivery or pickup details, and choose a payment method (MTN MoMo, Airtel Money, or Cash on Delivery).",
      links: [
        { label: 'Browse Products', href: '/products' },
        { label: 'View Cart', href: '/cart' },
        { label: 'Sign In', href: '/auth/login' },
        { label: 'Create Account', href: '/auth/signup' },
      ],
    };
  }

  const tokens = tokenize(message);
  const matches = catalog.filter(product => {
    const haystack = `${product.name} ${product.category} ${product.description ?? ''}`.toLowerCase();
    return tokens.some(token => haystack.includes(token));
  });
  const products = (matches.length > 0 ? matches : catalog).slice(0, 8);
  return {
    type: 'products',
    reply: matches.length > 0
      ? `I found ${matches.length} items matching your request. Here are the top results.`
      : "I couldn't find an exact match, but here are some popular options.",
    products,
  };
}

const WEBSITE_GUIDE = `
=== SIMBA SUPERMARKET — COMPLETE WEBSITE GUIDE ===

SITE PAGES:
- / (Homepage): Hero banner, featured products, category shortcuts, promotions.
- /products: Browse ALL 500+ products. Filter by category using the tabs at the top. Sort by price (low/high) or name. Click any product card to open its detail page.
- /products/[id]: Product detail page — full name, description, price, image, and an "Add to Cart" button.
- /cart: Your shopping cart. See all items, adjust quantities with +/- buttons, remove items, see subtotal and delivery fee. "Proceed to Checkout" button at the bottom right.
- /checkout: 3-step checkout process (Details → Payment → Confirmation).
- /branches: Map of all Simba branch locations in Kigali. Click a branch for hours, address, contact.
- /auth/login: Sign in with email+password or Google.
- /auth/signup: Create a new account (name, email, password, optional phone number).
- /about: About Simba Supermarket.

HOW TO SHOP (FULL FLOW):
Step 1 — Browse: Go to /products or use the search bar (magnifying glass icon in the top navbar) to find products. You can also ask me to find products for you.
Step 2 — Add to Cart: Click any product card to open its page, then click "Add to Cart". Or use the cart icon directly on product cards. You'll see a green toast confirmation.
Step 3 — View Cart: Click the cart icon (top-right of navbar, shows item count badge) or go to /cart. Review items, change quantities, or remove products.
Step 4 — Checkout: On the cart page, click "Proceed to Checkout". You MUST be signed in — if not, a login/signup popup will appear automatically.
Step 5 — Fill Details: Enter your name, phone, email. Choose PICKUP (collect at a branch) or DELIVERY (home delivery).
  - Pickup: Select a branch, choose a date and 2-hour time slot (e.g. 10:00–12:00). Pay a small refundable deposit now.
  - Delivery: Enter your Kigali address and district. Choose Standard (1–2 days, free over 50,000 RWF) or Express (same day, +3,000 RWF).
Step 6 — Pay: Choose MTN Mobile Money, Airtel Money, or Cash on Delivery (delivery only).
  - MTN MoMo: Enter your MTN number → receive a USSD prompt on your phone to confirm.
  - Airtel Money: Enter your Airtel number → receive a payment prompt.
  - Cash on Delivery: Pay in cash when the order arrives (not available for pickup).
Step 7 — Confirm: Your order is placed! You get an order number (e.g. SB-123456). The branch starts preparing immediately.

HOW TO CREATE AN ACCOUNT:
Go to /auth/signup. Fill in: Full name, email address, password (min 8 chars), and optionally your phone number. Or click "Continue with Google" to sign up instantly. Having an account lets Simba pre-fill your checkout details automatically.

HOW TO SIGN IN:
Go to /auth/login. Enter your email and password, or use Google Sign-In. Forgot your password? Click "Forgot?" on the login page.

CART & CHECKOUT TIPS:
- Your cart is saved even if you close the browser (stored locally).
- Orders over 50,000 RWF qualify for FREE standard delivery.
- The deposit for pickup orders is refundable — you pay the balance at the branch.
- Checkout requires a Rwandan phone number in format +250XXXXXXXXX.

PAYMENT METHODS:
- MTN Mobile Money (yellow) — most popular, instant USSD confirmation.
- Airtel Money (red) — instant payment prompt.
- Cash on Delivery — only available for delivery orders, not pickup.

FINDING BRANCHES:
Go to /branches to see all Simba store locations with addresses, phone numbers, and opening hours. Each branch page has a map link.

CATEGORIES AVAILABLE:
${categories.join(', ')}.

RETURNS & POLICIES:
- Fresh products: return within 24 hours.
- Packaged goods: return within 7 days.
- Business hours: Monday–Saturday 7 am–9 pm, Sunday 8 am–6 pm.
- Delivery areas: Kigali (Gasabo, Kicukiro, Nyarugenge districts).
- Currency: All prices in RWF (Rwandan Franc).

LANGUAGE & THEME:
- Click the globe icon (🌐) in the navbar to switch between English, Français, and Kinyarwanda.
- Click the sun/moon icon to toggle dark/light mode.

USING THE AI ASSISTANT (ME):
- Ask me to find products: "Show me dairy products", "I need something for breakfast".
- Ask about your cart: "What's in my cart?", "What's my cart total?".
- Ask for guidance: "How do I checkout?", "How does delivery work?", "Where are your branches?".
- Ask about prices: "Find items under 1000 RWF", "What's the cheapest cooking oil?".
- I can suggest products based on what you're cooking or need.
`;

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], cart } = (await request.json()) as ChatRequest;

    if (!message || message.trim().length < 2) {
      return NextResponse.json({ error: 'Please provide a message.' }, { status: 400 });
    }

    const query = message.trim();
    const groqKey = process.env.GROQ_API_KEY;

    const cartContext =
      cart && cart.items.length > 0
        ? `User's current cart (${cart.totalItems} item(s)): ${cart.items.map(i => `${i.name} ×${i.quantity} = ${i.price * i.quantity} RWF`).join(', ')}. Cart total: ${cart.totalPrice} RWF.`
        : 'User cart is currently empty.';

    if (!groqKey) {
      return NextResponse.json(fallbackResponse(query));
    }

    const candidates = pickCandidates(query);
    const compactCatalog = candidates.map(p => ({
      id: String(p.id),
      name: p.name,
      category: p.category,
      price: p.price,
    }));

    const systemPrompt = [
      'You are a knowledgeable, friendly shopping assistant for Simba Supermarket in Rwanda.',
      'You help customers shop, navigate the website, find products, and answer any question about the store.',
      '',
      WEBSITE_GUIDE,
      '',
      cartContext,
      '',
      '=== RESPONSE FORMAT ===',
      'Respond with strict JSON only — no markdown, no code fences.',
      'Three allowed formats:',
      '',
      '1. Product search result:',
      '   {"type":"products","reply":"...","matchedIds":["id1","id2"]}',
      '',
      '2. Navigation guide (for how-to, navigation, and process questions):',
      '   {"type":"guide","reply":"...","links":[{"label":"Page Name","href":"/path"}]}',
      '   links is optional — only include when page links would genuinely help.',
      '',
      '3. Plain text answer:',
      '   {"type":"text","reply":"..."}',
      '',
      '=== RULES ===',
      '- Use type=products when the user asks to find/show/search/recommend specific products.',
      '- Use type=guide when the user asks HOW to do something, asks about navigating the site, account creation, checkout process, delivery/pickup, payment, returns, or "where do I go to...".',
      '- Use type=text for: cart summaries, greetings, store policies/hours, short direct answers.',
      '- For guide responses: explain step-by-step clearly. Be thorough — up to 100 words is fine.',
      '- For text/products replies: keep under 55 words.',
      '- For products: pick up to 8 matchedIds from the catalog candidates only. Never invent IDs.',
      '- For cart questions: use the cart data provided above.',
      '- For price queries (e.g. "under 500 RWF"): only include candidates within that price.',
      '- NEVER say you cannot help. Always answer based on the website guide above.',
      '- If the user seems lost or asks general "how" questions, proactively offer the most helpful guide response with relevant page links.',
      '',
      `Product catalog candidates (use IDs from here only): ${JSON.stringify(compactCatalog)}`,
    ].join('\n');

    const llmMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.slice(-8).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: query },
    ];

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 700,
        messages: llmMessages,
      }),
    });

    if (!groqRes.ok) {
      return NextResponse.json(fallbackResponse(query));
    }

    const payload = (await groqRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = payload.choices?.[0]?.message?.content ?? '';
    const parsed = safeJsonParse(content);

    if (!parsed) {
      return NextResponse.json({
        type: 'text',
        reply: content || "I'm here to help! Ask me how to shop, find products, or anything about Simba Supermarket.",
      } satisfies ChatResponse);
    }

    // Products response
    if (parsed.type === 'products' && Array.isArray(parsed.matchedIds)) {
      const matched = (parsed.matchedIds as Array<string | number>)
        .map(id => catalog.find(p => String(p.id) === String(id)))
        .filter((p): p is Product => Boolean(p))
        .slice(0, 8);

      return NextResponse.json({
        type: 'products',
        reply:
          typeof parsed.reply === 'string' && parsed.reply.trim()
            ? parsed.reply.trim()
            : `Found ${matched.length} products for you.`,
        products: matched,
      } satisfies ChatResponse);
    }

    // Guide response with optional links
    if (parsed.type === 'guide') {
      const rawLinks = parsed.links;
      const links: NavLink[] = Array.isArray(rawLinks)
        ? (rawLinks as Array<{ label?: unknown; href?: unknown }>)
            .filter(l => typeof l.label === 'string' && typeof l.href === 'string')
            .map(l => ({ label: l.label as string, href: l.href as string }))
        : [];

      return NextResponse.json({
        type: 'guide',
        reply:
          typeof parsed.reply === 'string' && parsed.reply.trim()
            ? parsed.reply.trim()
            : 'Here is how to get started on Simba Supermarket.',
        links: links.length > 0 ? links : undefined,
      } satisfies ChatResponse);
    }

    // Plain text response
    return NextResponse.json({
      type: 'text',
      reply:
        typeof parsed.reply === 'string' && parsed.reply.trim()
          ? parsed.reply.trim()
          : 'How can I help you today?',
    } satisfies ChatResponse);
  } catch {
    return NextResponse.json({ error: 'Chat failed. Please try again.' }, { status: 500 });
  }
}
