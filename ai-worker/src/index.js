/**
 * BlueDot AI Chat — Cloudflare Worker
 *
 * A thin, secure relay between the BlueDot app and the Claude API.
 *
 * Why this exists: the Anthropic API key can never live inside the mobile
 * app bundle (anyone can extract it from the binary in minutes). This
 * Worker holds the key as a secret and is the only thing that ever talks
 * to api.anthropic.com. The app calls this Worker instead.
 *
 * What it does NOT do: it does not store its own copy of the historical
 * dataset. The app sends the (already up to date) flattened context with
 * every request, built live from the same CIVILIZATIONS / WARS / etc.
 * arrays the app already ships with. That means this Worker never needs to
 * be redeployed when you add a civilization, war, or route in the app --
 * only app/index.jsx changes.
 */

const ALLOWED_ORIGIN = '*'; // tighten later if you want to restrict callers

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

const SYSTEM_INSTRUCTIONS = `You are the in-app assistant for BlueDot, an interactive historical timeline
globe app. The person asking you questions is looking at a 3D globe that
shows how civilizations, wars, trade routes, migrations, languages and
religions have shifted across history.

You will be given two blocks of context:
1. STRUCTURED DATA — the complete (but geometry-stripped) dataset of every
   civilization, war, trade route, migration, language and religion
   currently in the app, with their names, date ranges and, where
   available, Wikipedia titles. Treat this as authoritative for relating
   entities to each other across time.
2. POSSIBLY RELEVANT EVENTS — a small, imperfect keyword-search sample
   pulled from a much larger 20,000+ event database of individual events
   (battles, disasters, cultural moments, inventions, political events,
   and more) shown as pins on the same timeline. It may miss relevant
   events or include irrelevant ones -- treat the SAMPLE as a supplementary
   hint, not a ground truth list of what exists. But the underlying EVENTS
   THEMSELVES are just as real and in-scope for BlueDot as anything in
   STRUCTURED DATA -- they're simply too numerous (20,000+) to send in
   full, so only a fuzzy keyword-matched sample is retrieved per question.
   Never tell someone a topic is "outside of what BlueDot covers" or
   "outside its scope" just because it isn't in STRUCTURED DATA -- that
   block only covers civilizations/wars/routes/migrations/languages/
   religions specifically; individual historical events (including things
   like natural disasters, which are one of the app's own event
   categories) are a separate, much larger part of the app and are
   entirely in scope. If an event you're asked about doesn't show up in
   POSSIBLY RELEVANT EVENTS, that just means the keyword search missed it
   this time (or your search terms didn't match) -- answer from your own
   knowledge instead of implying it isn't part of the app.

Combine both with your own general historical knowledge to give accurate,
concise answers. When you're not fully sure of a fine detail (an exact
date, a casualty figure, a minor name), say so briefly rather than
inventing precision. When relevant, mention how what you're describing
relates to entities in the STRUCTURED DATA (using their app names) so the
person can find them on the globe. Keep answers focused -- a few short
paragraphs at most unless the person asks for more depth. Answer in the
same language the person asked in.

Names in this data are often Spanish, and some are proper nouns that read
like ordinary Spanish words out of context -- for example "Brujas" is the
Spanish name for the Belgian city Bruges, not the word for "witches". When
a name looks odd or unfamiliar, first consider whether it's a real proper
noun (a place, person, or building name) you may not immediately
recognize, especially if an alternate name in brackets is given right
next to it (e.g. "Catedral de Brujas [Sint-Salvatorskathedraal]"). Do not
tell the person an entry looks "unreliable," "corrupted," or wrong just
because you don't immediately recognize the name -- research it from
context first, and only flag a genuine mismatch (like a date or category
that contradicts what the name clearly refers to).

Your answer is displayed in a plain chat bubble with no markdown
rendering -- do not use **bold**, headers, bullet/numbered lists, or any
other markdown syntax. Write in plain prose sentences and paragraphs
only.

You also have a navigate_map tool. Calling it does NOT move the app by
itself -- it surfaces a tappable suggestion under your reply (a year and,
optionally, a specific entity from STRUCTURED DATA) that the person can
tap if they want to see it on the globe, or ignore if they'd rather keep
talking. Call it whenever pointing to a place on the globe would help --
when they ask to "go to", "show me", "take me to" a year, event, or
named entity, or ask about a specific entity that exists in STRUCTURED
DATA. Only call it once per reply (the app only shows one such
suggestion per answer). Because this is an offer and not something you
actually did, phrase your text reply that way -- say things like "you
can see this around 900 CE" rather than "I'll take you there" or "I'm
jumping the map now". Do not call it for questions that are purely
comparative/explanatory with no single place or year worth pointing to.

You also have a suggest_followups tool. Use it on nearly every reply to
offer 2-3 natural next questions as tappable chips, so the person can
keep exploring with a tap instead of having to type -- good angles
include a related event, what else was happening elsewhere in the world
at the same time, an unexplored cause or consequence, or a related
entity from STRUCTURED DATA. Skip it only for simple acknowledgments
(e.g. the person just says "thanks"). Each question must be a complete,
self-contained question with the real name(s) of what it refers to,
written as if it will be sent verbatim as the person's next message with
no other context added -- never use a bare pronoun like "it" or "this"
with nothing else identifying the subject. Write these in the same
language as the conversation.

CRITICAL, non-negotiable rule about ordering and text: every single reply
MUST contain a text content block with your actual answer in it, and that
text block MUST come BEFORE any tool call (navigate_map and/or
suggest_followups), never after and never instead of it. Write your full
answer in words first, THEN call whichever tools apply. A reply made up
of only tool calls with no text renders as a broken, empty message
bubble in the app -- that is a real bug the person will see and report,
so never let it happen, even for very short answers (a single sentence
of text is enough, but there must always be one).`;

const TOOLS = [
  {
    name: 'navigate_map',
    description: 'Suggest a place on the BlueDot globe: a year and, optionally, one entity from STRUCTURED DATA. This surfaces a tappable suggestion under your reply -- it does not move the map by itself, the person taps it if they want to go. entityType must be one of the STRUCTURED DATA section names, and entityId must exactly match that entity\'s "id" field.',
    input_schema: {
      type: 'object',
      properties: {
        year: {
          type: 'integer',
          description: 'Year to jump the timeline to. Use negative numbers for BCE (e.g. -450 for 450 BCE).',
        },
        entityType: {
          type: 'string',
          enum: ['civilizations', 'wars', 'routes', 'migration', 'languages', 'religion'],
          description: 'Which STRUCTURED DATA section entityId belongs to. Omit if you are only jumping to a year with no specific entity to open.',
        },
        entityId: {
          type: 'string',
          description: 'The exact "id" field of the entity to open, from the matching STRUCTURED DATA section. Omit if entityType is omitted.',
        },
      },
      required: ['year'],
    },
  },
  {
    name: 'suggest_followups',
    description: 'Offer 2-3 tappable follow-up questions shown as chips below your reply, so the person can keep the conversation going with a tap instead of typing. Each must be a complete, self-contained question (no bare pronouns like "it"/"this") since it may be sent verbatim as the next message with no other context.',
    input_schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: { type: 'string' },
          minItems: 2,
          maxItems: 3,
          description: 'Short, complete follow-up questions in the same language as the conversation.',
        },
      },
      required: ['questions'],
    },
  },
];

async function handleChat(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { structuredContext, relevantEventsText, messages } = body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages must be a non-empty array' }, 400);
  }
  if (typeof structuredContext !== 'string' || structuredContext.length === 0) {
    return json({ error: 'structuredContext is required' }, 400);
  }

  // Basic size guard so a misbehaving client can't send an enormous
  // payload and run up a huge bill on one request.
  const MAX_CONTEXT_CHARS = 400_000; // ~100k tokens, generous headroom
  if (structuredContext.length > MAX_CONTEXT_CHARS) {
    return json({ error: 'structuredContext too large' }, 413);
  }

  const model = env.MODEL || 'claude-haiku-4-5-20251001';

  const system = [
    { type: 'text', text: SYSTEM_INSTRUCTIONS },
    { type: 'text', text: 'STRUCTURED DATA:\n' + structuredContext },
    { type: 'text', text: 'POSSIBLY RELEVANT EVENTS:\n' + (relevantEventsText || '(none found)') },
  ];

  // Keep only role/content on the way out -- drop any extra client fields.
  const cleanMessages = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20) // cap conversation history sent per request
    .map(m => ({ role: m.role, content: m.content }));

  if (cleanMessages.length === 0) {
    return json({ error: 'no valid messages' }, 400);
  }

  let anthropicRes;
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1600, // headroom for a full text reply PLUS both tool calls (navigate_map + suggest_followups) without truncation cutting off the text block
        system,
        messages: cleanMessages,
        tools: TOOLS,
      }),
    });
  } catch (e) {
    return json({ error: 'Failed to reach Claude API', detail: String(e) }, 502);
  }

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    return json({ error: 'Claude API error', status: anthropicRes.status, detail: errText }, 502);
  }

  const data = await anthropicRes.json();
  const content = data.content || [];
  let answer = content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n');

  // Surface any navigate_map calls as plain data -- this Worker doesn't
  // execute anything itself, it just hands the app what the model asked
  // for. The app resolves entityType/entityId against its own live data
  // and decides how (or whether) to act on it.
  const actions = content
    .filter(block => block.type === 'tool_use' && block.name === 'navigate_map')
    .map(block => ({
      year: block.input?.year,
      entityType: block.input?.entityType || null,
      entityId: block.input?.entityId || null,
    }))
    .filter(a => typeof a.year === 'number');

  // Same idea for suggest_followups -- just forward the question strings,
  // the app renders them as tappable chips (see AIChatPanel).
  const followups = content
    .filter(block => block.type === 'tool_use' && block.name === 'suggest_followups')
    .flatMap(block => Array.isArray(block.input?.questions) ? block.input.questions : [])
    .filter(q => typeof q === 'string' && q.trim().length > 0)
    .slice(0, 3);

  // Safety net: despite the system prompt's explicit "always write text
  // before calling tools" rule, small/fast models occasionally still
  // reply with ONLY tool_use blocks and no text -- the person would then
  // see a broken-looking empty message bubble in the app. Rather than let
  // that happen, force one quick text-only retry (tool_choice: 'none') so
  // there is always a real answer to show, even if it means dropping this
  // turn's map suggestion / follow-ups.
  if (!answer.trim()) {
    try {
      const retryRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system,
          messages: cleanMessages,
          tool_choice: { type: 'none' },
        }),
      });
      if (retryRes.ok) {
        const retryData = await retryRes.json();
        const retryContent = retryData.content || [];
        answer = retryContent
          .filter(block => block.type === 'text')
          .map(block => block.text)
          .join('\n');
      }
    } catch (e) {
      // Ignore -- fall through to the generic fallback below.
    }
  }
  if (!answer.trim()) {
    answer = 'Sorry, I had trouble putting together a reply just now -- please try asking again. / Tuve un problema generando la respuesta -- intenta preguntar de nuevo.';
  }

  return json({
    answer,
    actions,
    followups,
    usage: data.usage || null,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (url.pathname === '/chat' && request.method === 'POST') {
      return handleChat(request, env);
    }

    if (url.pathname === '/' || url.pathname === '/health') {
      return json({ ok: true, service: 'bluedot-ai-chat' });
    }

    return json({ error: 'Not found' }, 404);
  },
};
