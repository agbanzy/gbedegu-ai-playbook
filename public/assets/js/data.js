/* GBEDEGU '26 AI Playbook — content data */
window.GB = window.GB || {};

/* ---------- the five role prompts from the handbook ---------- */
GB.rolePrompts = [
  { icon:'star', title:'Brand strategist',
    text:'You are my brand strategist. My business: [what you do]. My customer: [who they are]. Audit my [bio / website / pitch] and rewrite it to speak directly to that customer.' },
  { icon:'chat', title:'Sales coach',
    text:'You are my sales coach. Here is a real customer conversation that stalled: [paste it]. Diagnose where I lost them, and script three ways I could have advanced it.' },
  { icon:'search', title:'Market researcher',
    text:'You are my market researcher. Compare the top 5 [your industry] providers in [city] on price, positioning and reviews. Give me a table first, then one gap I could own.' },
  { icon:'chart', title:'CFO',
    text:'You are my CFO. Here are my numbers: [paste them]. Where am I leaking money, and what are my three highest-leverage fixes?' },
  { icon:'pen', title:'Content editor',
    text:'You are my content editor. Take this idea: [paste it] and turn it into a LinkedIn post, an Instagram caption, a WhatsApp status and a 30-second video script — same message, native to each platform.' }
];

/* ---------- the prompt bank ---------- */
GB.prompts = [
  { cat:'Brand', title:'Rewrite my bio so it sells',
    text:'You are a brand strategist who works with African SMEs. My business: [what you do]. My customer: [who they are, where]. My goal is enquiries, not likes.\n\nAudit my current bio below and rewrite it three ways — one warm, one authoritative, one bold. Under 150 words each, no jargon, no hashtags. End each with a different call to action.\n\nMy current bio: [paste]' },
  { cat:'Brand', title:'Find my actual positioning',
    text:'You are a positioning consultant. My business: [what you do]. My three closest competitors: [names or descriptions].\n\nBefore answering, ask me up to five questions you need. Then give me: (1) what all four of us say that sounds the same, (2) three positions only I could credibly own, (3) the one I should pick and why. Table format.' },
  { cat:'Brand', title:'Name the thing',
    text:'You are a naming strategist. I am launching [what it is] for [who]. Tone: [modern / warm / premium / playful].\n\nGive me 20 names in four groups of five: literal, evocative, invented, and Nigerian-language rooted. For each, one line on why it works. Then flag any that are hard to spell over the phone.' },
  { cat:'Brand', title:'Build my brand kit brief',
    text:'You are a brand designer. My business: [what you do]. My customer: [who]. The feeling I want: [three adjectives].\n\nGive me a one-page brand brief I can hand to Canva or a designer: a primary and secondary colour with hex codes, a heading and body font pairing available free on Google Fonts, three do-not-do rules, and a one-sentence tone-of-voice statement.' },

  { cat:'Content', title:'One idea, five platforms',
    text:'You are my content editor. Take this idea: [paste your rough thought, or a transcript of a voice note].\n\nTurn it into: (1) a LinkedIn post under 200 words, (2) an Instagram caption with a hook in the first line, (3) a WhatsApp status of two sentences, (4) a 30-second video script with shot notes, (5) a short newsletter intro.\n\nSame message, native to each platform. My voice is warm and direct, no jargon, no hashtags.' },
  { cat:'Content', title:'A month of posts from one theme',
    text:'You are a content strategist for [your business]. My audience: [who]. My theme this month: [topic].\n\nBefore writing, show me a plan: 12 post angles across four types — teach, prove, story, ask. Wait for me to approve the plan. Then write the three I pick.' },
  { cat:'Content', title:'Rewrite this so it sounds like me',
    text:'Here are three things I have written that sound like me: [paste 3 samples].\n\nStudy the rhythm, sentence length, and the words I avoid. Now rewrite the draft below in that voice. Do not add enthusiasm I did not have. Show me the rewrite, then list the three specific changes you made and why.\n\nDraft: [paste]' },
  { cat:'Content', title:'Hooks that are not clickbait',
    text:'You are a copy editor. Below is my post. Write 10 alternative opening lines: three that state a surprising fact, three that name a specific pain, two that open a story mid-scene, two that ask a question I actually answer.\n\nNo curiosity-gap tricks, nothing I cannot back up in the post itself.\n\nPost: [paste]' },

  { cat:'Sales', title:'Diagnose a stalled deal',
    text:'You are my sales coach. Here is a real customer conversation that stalled: [paste the messages].\n\nTell me: where exactly did I lose them, what did they actually need that I did not give, and script three different ways I could have advanced it — one that reopens today, one for a week from now, one that closes it out gracefully.' },
  { cat:'Sales', title:'Handle the price objection',
    text:'You are a sales coach for [your industry] in Nigeria. My price is [amount] for [what]. The objection I keep hearing: [paste it].\n\nGive me three responses: one that reframes to value, one that offers a smaller first step, one that walks away well. For each, tell me when to use it. Nothing pushy — I have to see these people again.' },
  { cat:'Sales', title:'Write the follow-up I keep avoiding',
    text:'You are writing as me — warm, direct, not desperate. I spoke to [who] about [what] on [when]. They said [what they said]. It has been [how long].\n\nWrite three follow-ups: a two-line nudge, one that adds something genuinely useful, and a final polite close-out. WhatsApp length, not email length.' },
  { cat:'Sales', title:'Turn my service into a proposal',
    text:'You are a proposal writer. Client: [who]. Their problem in their words: [paste]. What I will do: [describe]. My price: [amount]. Timeline: [dates].\n\nWrite a one-page proposal with: their problem restated better than they said it, what I will deliver as bullets, what is explicitly not included, price, timeline, and one line on why me. No filler, no corporate language.' },

  { cat:'Research', title:'Map my competition honestly',
    text:'You are my market researcher. Compare the top 5 [your industry] providers in [city] on price, positioning, and what reviews complain about.\n\nGive me a table first. Then one paragraph: the gap none of them are filling that I could own with [my actual advantage]. Cite your sources and flag anything you are unsure about.' },
  { cat:'Research', title:'Interrogate my own documents',
    text:'I have uploaded [describe the files]. Answer only from these documents — if the answer is not in them, say so rather than guessing.\n\nMy question: [ask]. Quote the specific line you drew each claim from.' },
  { cat:'Research', title:'Pressure-test my idea',
    text:'You are a skeptical investor who has seen 200 pitches this year. My idea: [describe it in five lines].\n\nGive me the five hardest questions you would ask, the assumption most likely to be wrong, and what evidence would change your mind. Be direct — I would rather hear it from you than from the market.' },
  { cat:'Research', title:'Summarize a long thing into a decision',
    text:'Read [the document / transcript / thread below]. I need to decide [the decision].\n\nGive me: three bullets of what it actually says, two things it implies that it does not say, the one fact that most affects my decision, and what you would do. Under 250 words total.' },

  { cat:'Money', title:'Find where I am leaking money',
    text:'You are my CFO. Here are my numbers for [period]: [paste revenue, costs, subscriptions].\n\nWhere am I leaking money? Give me my three highest-leverage fixes ranked by naira saved per hour of my effort. Flag every recurring subscription I have not clearly justified.' },
  { cat:'Money', title:'Price this properly',
    text:'You are a pricing consultant. My service: [what]. My costs per unit: [amounts]. Time it takes me: [hours]. What competitors charge: [range]. My customer: [who].\n\nGive me three price points — entry, standard, premium — with what changes at each. Tell me which to lead with and the one sentence I say when someone says it is too expensive.' },
  { cat:'Money', title:'Should I buy this tool?',
    text:'I am considering paying for [tool] at [price] per month. I would use it for [what]. Right now I do that by [current method], which takes about [hours] a month.\n\nRun three tests: do I hit the free tier limit weekly, does it save 2+ hours a month, does it touch revenue directly? Give me a yes or no and the reasoning. If no, tell me what would have to change for it to become a yes.' },

  { cat:'Systems', title:'Design my lead machine',
    text:'You are an automation architect. I get enquiries through [Instagram DM / WhatsApp / a web form]. Today I handle them by [describe].\n\nDesign one automation: enquiry comes in, AI drafts a reply in my voice, the lead is logged, a day-3 follow-up is drafted, and I get a Monday summary. Give me the step-by-step build in [Zapier / Make / n8n], what it costs, and where a human must stay in the loop.' },
  { cat:'Systems', title:'Turn my best work into an SOP',
    text:'Here is how I did [the task] well: [paste the process, or the prompt that worked].\n\nTurn it into a reusable SOP that another person — or an AI — could follow without me: the trigger, the inputs needed, the steps, the quality bar, and what to escalate to me. Write it so I can paste it straight into a Project as standing instructions.' },
  { cat:'Systems', title:'Set up my assistant’s desk',
    text:'I am setting you up as my business coworker, not a search box. My business: [what you do]. My customer: [who]. My voice: [describe, or paste samples]. My prices: [or say "ask me, never invent"].\n\nWrite the standing instructions I should save to this Project so every future conversation starts with you already knowing this. Then list what else I should upload.' },
  { cat:'Systems', title:'Brief a big task properly',
    text:'Task: [what you want done].\n\nUse this structure and fill any gaps by asking me first: Role — who you should be. Goal — what done looks like. Materials — what I have given you. Constraints — format, length, tone, budget. Exclusions — what not to do. Checkpoint — show me the plan before executing.\n\nStart by showing me the plan.' },
  { cat:'Systems', title:'Critique your own draft',
    text:'Now critique the draft you just wrote against my goals: [restate the goal]. Score it out of 10 on clarity, on whether it sounds like me, and on whether it would make my customer act.\n\nList what is weakest. Then rewrite it fixing only those things — do not restart from scratch.' }
];

/* ---------- tools directory ---------- */
GB.tools = [
  {c:'Assistants',n:'Claude (Anthropic)',u:'https://claude.ai',d:'Real files out — Excel, PowerPoint, Word — plus agents (Claude Code, Cowork), Projects and memory.',free:'Free tier',paid:'Pro $20 · Max $100+'},
  {c:'Assistants',n:'ChatGPT (OpenAI)',u:'https://chatgpt.com',d:'Agent Mode, custom GPTs, Deep Research, and the biggest ecosystem of the four.',free:'Free tier',paid:'Go ~$8 · Plus $20'},
  {c:'Assistants',n:'Gemini (Google)',u:'https://gemini.google.com',d:'Lives inside Gmail, Docs and Drive; bundles NotebookLM plus Veo and Flow for video.',free:'Free tier',paid:'AI Plus ₦7,450/mo · Pro $19.99',ng:true},
  {c:'Assistants',n:'Grok (xAI)',u:'https://grok.com',d:'Real-time pulse of X, plus DeepSearch. Strongest when the question is about right now.',free:'Free tier',paid:'X Premium $8 · SuperGrok $30'},

  {c:'Branding',n:'Pomelli (Google Labs)',u:'https://labs.google/pomelli',d:'Paste your website, it extracts your "Business DNA" — colours, fonts, tone — then generates on-brand social campaigns.',free:'Free in beta',paid:'—'},
  {c:'Branding',n:'Canva Magic Studio',u:'https://canva.com',d:'Magic Write, Magic Design, background removal. The everything-design studio.',free:'Free plan',paid:'Pro $18'},
  {c:'Branding',n:'Looka',u:'https://looka.com',d:'AI logo plus a complete brand kit — colours, fonts, business cards — in minutes.',free:'Preview free',paid:'From $20 one-time'},
  {c:'Branding',n:'Adobe Express + Firefly',u:'https://adobe.com/express',d:'Pro-grade templates plus generative images that are safe for commercial use.',free:'Free plan',paid:'$9.99'},

  {c:'Content',n:'Gamma',u:'https://gamma.app',d:'Decks, documents and one-page sites from a single prompt.',free:'400 free credits',paid:'Plus $9'},
  {c:'Content',n:'Opus Clip',u:'https://opus.pro',d:'One long video becomes a week of short clips, auto-captioned and reframed.',free:'60 min/mo free',paid:'From $15'},
  {c:'Content',n:'HeyGen',u:'https://heygen.com',d:'Your AI avatar presents any script, on camera, without you being on camera.',free:'3 videos/mo free',paid:'From $29'},
  {c:'Content',n:'ElevenLabs',u:'https://elevenlabs.io',d:'Studio-grade voiceovers, including a clone of your own voice.',free:'Free tier',paid:'From $6'},
  {c:'Content',n:'Buffer',u:'https://buffer.com',d:'Schedule to every platform at once, with an AI assistant for captions.',free:'Free plan',paid:'~$6/channel'},
  {c:'Content',n:'Google Flow',u:'https://labs.google/flow',d:'AI filmmaking with Veo 3.1 — product ads and brand videos with no camera crew.',free:'Credits in Google AI plans',paid:'Included in ₦7,450 plan',ng:true},

  {c:'Sales & research',n:'Perplexity',u:'https://perplexity.ai',d:'Research that cites its sources — market scans and competitor checks you can actually verify.',free:'Free tier',paid:'Pro $20'},
  {c:'Sales & research',n:'NotebookLM',u:'https://notebooklm.google.com',d:'Feed it your own documents and ask anything. It even turns them into a podcast.',free:'Free',paid:'—'},
  {c:'Sales & research',n:'Apollo.io',u:'https://apollo.io',d:'275M+ B2B contacts with filters and automated outreach sequences.',free:'Free tier',paid:'From $49'},
  {c:'Sales & research',n:'Clay',u:'https://clay.com',d:'Enriches and personalises lead lists at scale — growth-team grade.',free:'Free credits',paid:'From $185'},
  {c:'Sales & research',n:'HubSpot + Breeze',u:'https://hubspot.com',d:'A genuinely free CRM with an AI copilot built in. Start here before you pay for anything.',free:'Free CRM',paid:'Paid add-ons'},

  {c:'Automation',n:'Zapier',u:'https://zapier.com',d:'8,000+ apps connected. Describe the workflow in plain English and it builds it.',free:'Free plan',paid:'From $20'},
  {c:'Automation',n:'Make',u:'https://make.com',d:'Visual drag-and-drop scenarios — easier to see what is happening than Zapier.',free:'Free tier',paid:'From $9'},
  {c:'Automation',n:'n8n',u:'https://n8n.io',d:'Open source and AI-native. Self-host it and the only cost is a small server.',free:'Self-host ₦0',paid:'Cloud $20'},

  {c:'Build & host',n:'Durable',u:'https://durable.co',d:'A business site in about thirty seconds. Fastest zero-to-live there is.',free:'Free to build',paid:'From ~$12/mo to publish'},
  {c:'Build & host',n:'Wix AI',u:'https://wix.com',d:'Chat your website into existence, then edit it visually.',free:'Free with Wix branding',paid:'Paid to use your domain'},
  {c:'Build & host',n:'Framer',u:'https://framer.com',d:'Designer-grade polish without opening a design tool.',free:'Free subdomain',paid:'From ~$5'},
  {c:'Build & host',n:'Lovable',u:'https://lovable.dev',d:'Full apps with payments and login, no code written by you.',free:'Free tier',paid:'Pro $25'},
  {c:'Build & host',n:'v0 by Vercel',u:'https://v0.dev',d:'Prompt to app. More technical, and correspondingly more control.',free:'Free tier',paid:'$20'},
  {c:'Build & host',n:'Bolt.new',u:'https://bolt.new',d:'Full-stack apps built and previewed entirely in the browser.',free:'Free tier',paid:'$20'},
  {c:'Build & host',n:'Vercel',u:'https://vercel.com',d:'Free hosting for the site your assistant builds you. Deploys from a folder or a repo.',free:'Free tier',paid:'From $20'},
  {c:'Build & host',n:'Netlify',u:'https://netlify.com',d:'Drag a folder onto the page and it is live on the internet. Genuinely that simple.',free:'Free tier',paid:'From $19'},
  {c:'Build & host',n:'Cloudflare Pages',u:'https://pages.cloudflare.com',d:'Free hosting with the fastest global network of the free options.',free:'Free tier',paid:'From $20'},
  {c:'Build & host',n:'GitHub Pages',u:'https://pages.github.com',d:'Free hosting straight from a GitHub repository. Zero cost, forever, for a personal site.',free:'Free',paid:'—'}
];

/* ---------- 30-day plan ---------- */
GB.weeks = [
  { n:1, t:'Foundations', s:'Week one', tasks:[
    'Pick <b>ONE</b> assistant — Claude, ChatGPT, Gemini or Grok — and create the account.',
    'Create a Project or workspace and upload what a new hire would need: what you sell, prices, best posts, your tone, FAQs.',
    'Write and save <b>five role prompts</b> for your business.',
    'Run your website or socials through Pomelli, or build a brand kit in Canva.',
    'Lock <b>one</b> colour palette and <b>one</b> font pairing. Write them down.'
  ]},
  { n:2, t:'Presence', s:'Week two', tasks:[
    'LinkedIn overhaul — AI-drafted headline, About and Featured, then edit until it sounds like you.',
    'Make your name, photo, bio and handle identical on every platform you use.',
    'Publish your first AI-assisted post — drafted with your role prompt, edited by you.',
    'Ask your assistant to audit your bio against your actual customer. Fix what it finds.'
  ]},
  { n:3, t:'Ship your site', s:'Week three', tasks:[
    'Prompt your assistant for a one-page personal site — name, what you do, three services, two testimonials, a WhatsApp contact button.',
    'Iterate in plain English until it feels right. Do not learn to code for this.',
    'Host it free — Vercel, Netlify, Cloudflare Pages or GitHub Pages.',
    'Generate a QR code pointing to it. Put it on your card, flyers and event banners.',
    'Optional: buy your domain. $5–12 a year for a .me or .com.ng.',
    'Send me the link. Seriously — I read every one.'
  ]},
  { n:4, t:'Systems', s:'Week four', tasks:[
    'Build <b>one</b> automation — the lead machine: enquiry → AI-drafted reply → logged lead → day-3 follow-up → Monday summary.',
    'Start the content engine: one substantial piece weekly — a voice note counts — multiplied by AI into posts, clips and captions.',
    'Schedule a week of content with Buffer so next week runs itself.',
    'Review: what actually saved you time this month? Double down on that.',
    'Drop what did not. Cancel any subscription that failed all three tests.',
    'Set a 90-day reminder. Consistency beats brilliance.'
  ]}
];
