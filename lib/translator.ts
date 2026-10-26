/**
 * Privacy-first classroom translator.
 * Runs entirely in the app (no student text is sent to a third party), which
 * keeps the COPPA story clean and makes it usable when the internet is spotty.
 */

type Lang = "en" | "es";

const EN_ES: Record<string, string> = {
  // people + pronouns
  i: "yo", you: "tú", he: "él", she: "ella", we: "nosotros", they: "ellos", it: "eso",
  my: "mi", your: "tu", his: "su", her: "su", our: "nuestro", their: "su",
  me: "me", us: "nos", them: "ellos", this: "este", that: "ese", these: "estos", those: "esos",
  // connector words
  the: "el", a: "un", an: "un", and: "y", or: "o", but: "pero", because: "porque", so: "así que",
  with: "con", without: "sin", for: "para", to: "a", from: "de", in: "en", on: "en", at: "a", of: "de",
  here: "aquí", there: "allí", now: "ahora", today: "hoy", tomorrow: "mañana", yesterday: "ayer",
  later: "después", soon: "pronto", always: "siempre", never: "nunca", again: "otra vez",
  more: "más", less: "menos", very: "muy", too: "también", also: "también", maybe: "quizás",
  please: "por favor", thanks: "gracias", yes: "sí", no: "no", hello: "hola", goodbye: "adiós",
  welcome: "bienvenido", sorry: "lo siento", slowly: "despacio", together: "juntos", good: "bueno",
  what: "qué", where: "dónde", when: "cuándo", why: "por qué", who: "quién", how: "cómo", which: "cuál",
  hear: "escuchar", listen_to: "escuchar", job: "trabajo", yet: "todavía", about: "sobre", tell: "decir",
  much: "mucho", many: "muchos", let: "dejar", lets: "vamos a",
  "don't": "no", dont: "no", "doesn't": "no", doesnt: "no", "can't": "no puedo", cant: "no puedo",
  "i'm": "estoy", im: "estoy", "it's": "es", its: "es", "that's": "eso es", thats: "eso es",
  "you're": "eres", youre: "eres", "we're": "estamos", "they're": "ellos son",
  great: "genial", excellent: "excelente", nice: "bien", bad: "malo", hard: "difícil", easy: "fácil",
  ready: "listo", tired: "cansado", nervous: "nervioso", proud: "orgulloso", confused: "confundido",
  right: "correcto", wrong: "incorrecto", correct: "correcto", important: "importante",
  // verbs
  is: "es", are: "son", am: "soy", was: "era", were: "eran", be: "ser", have: "tener", has: "tiene",
  do: "hacer", can: "puedo", cannot: "no puedo", will: "va a", want: "quiero", need: "necesito",
  like: "me gusta", know: "sé", understand: "entiendo", learn: "aprender", read: "leer",
  write: "escribir", speak: "hablar", listen: "escuchar", look: "mirar", see: "ver", try: "intentar",
  practice: "practicar", help: "ayudar", explain: "explicar", repeat: "repetir", show: "mostrar",
  think: "pensar", start: "empezar", finish: "terminar", work: "trabajar", study: "estudiar",
  remember: "recordar", forget: "olvidar", choose: "elegir", answer: "responder", ask: "preguntar",
  said: "dijo", say: "decir", mean: "significar", feel: "sentir", take: "tomar", give: "dar",
  put: "poner", find: "encontrar", use: "usar", make: "hacer", go: "ir", come: "venir",
  // school words
  school: "escuela", class: "clase", teacher: "maestro", student: "estudiante", tutor: "tutor",
  friend: "amigo", book: "libro", page: "página", pencil: "lápiz", paper: "papel", notebook: "cuaderno",
  homework: "tarea", worksheet: "hoja de trabajo", test: "prueba", quiz: "cuestionario",
  question: "pregunta", problem: "problema", answer_key: "clave de respuestas", number: "número",
  phone: "teléfono", telephone: "teléfono", cellphone: "celular", private: "privado", privacy: "privacidad",
  address: "dirección", email: "correo electrónico", contact: "contacto", safe: "seguro", safety: "seguridad",
  math: "matemáticas", reading: "lectura", writing: "escritura", science: "ciencias",
  history: "historia", spanish: "español", english: "inglés", word: "palabra", sentence: "oración",
  story: "cuento", idea: "idea", detail: "detalle", evidence: "evidencia", summary: "resumen",
  fraction: "fracción", fractions: "fracciones", algebra: "álgebra", equation: "ecuación",
  graph: "gráfica", shape: "forma", plus: "más", minus: "menos", equal: "igual", half: "mitad",
  quarter: "cuarto", whole: "entero", example: "ejemplo", lesson: "lección", plan: "plan",
  meeting: "reunión", minute: "minuto", hour: "hora", day: "día", week: "semana", month: "mes",
  monday: "lunes", tuesday: "martes", wednesday: "miércoles", thursday: "jueves", friday: "viernes",
  saturday: "sábado", sunday: "domingo", morning: "mañana", afternoon: "tarde", night: "noche",
  family: "familia", mom: "mamá", mother: "madre", dad: "papá", father: "padre", guardian: "tutor legal",
  // feelings + feedback
  happy: "feliz", sad: "triste", fun: "divertido", boring: "aburrido", cool: "genial",
  amazing: "increíble", perfect: "perfecto", done: "terminado", ready_to_learn: "listo para aprender",
  effort: "esfuerzo", progress: "progreso", mistake: "error", challenge: "desafío", goal: "meta",  break: "descanso", time: "tiempo", help_noun: "ayuda", question_word: "pregunta",
  today_: "hoy",
  // conversation
  "how are you": "cómo estás", "i am fine": "estoy bien", "see you": "nos vemos",
  "see you later": "hasta luego", "nice to meet you": "mucho gusto", "thank you": "gracias",
  "you are welcome": "de nada", "i am sorry": "lo siento", "no problem": "no hay problema",
  "what is your name": "cómo te llamas", "my name is": "me llamo",
  "i don't understand": "no entiendo", "i do not understand": "no entiendo",
  "i don't understand yet": "todavía no entiendo", "i do not understand yet": "todavía no entiendo",
  "i understand": "entiendo", "can you repeat that": "puedes repetir eso",
  "can you help me": "me puedes ayudar", "i need help": "necesito ayuda",
  "i am ready": "estoy listo", "are you ready": "estás listo",
  "let's practice": "practiquemos", "let us practice": "practiquemos",
  "good job": "buen trabajo", "great job": "excelente trabajo", "you can do it": "tú puedes",
  "take your time": "tómate tu tiempo", "show me your work": "muéstrame tu trabajo",
  "what is the answer": "cuál es la respuesta", "let's try again": "intentémoslo otra vez",
  "one moment please": "un momento por favor", "my internet is slow": "mi internet está lento",
  "can we reschedule": "podemos reprogramar", "see you next week": "nos vemos la próxima semana",
  "let's get started": "empecemos", "let us get started": "empecemos",
  "what do you think": "qué piensas", "tell me more": "cuéntame más",
  "read this page": "lee esta página", "open your notebook": "abre tu cuaderno",
  "write it down": "escríbelo", "what does this mean": "qué significa esto",
  "how do you say this": "cómo se dice esto", "do you have your worksheet": "tienes tu hoja de trabajo",
  "i need to leave": "necesito irme", "let's take a break": "tomemos un descanso",
  "welcome back": "bienvenido de nuevo", "i am proud of you": "estoy orgulloso de ti",
  "can you explain it again": "puedes explicarlo otra vez",
  "can you explain that again": "puedes explicar eso otra vez",
  "can you say that again": "puedes decirlo otra vez",
  "can you repeat it": "puedes repetirlo",
  "my phone number is private": "mi número de teléfono es privado",
  "i do not want to share my phone number": "no quiero compartir mi número de teléfono",
  "i don't want to share my phone number": "no quiero compartir mi número de teléfono",
  "let us try another example": "intentemos otro ejemplo",
  "let's try another example": "intentemos otro ejemplo",
  "show me how you got that answer": "muéstrame cómo llegaste a esa respuesta",
  "can you show me how you got that answer": "me puedes mostrar cómo llegaste a esa respuesta",
  "can you walk me through it": "me puedes explicar paso a paso",
  "i am stuck on this problem": "estoy atascado en este problema",
  "i am stuck": "estoy atascado",
  "i need a hint": "necesito una pista",
  "where are you stuck": "dónde estás atascado",
  "where do you need help": "dónde necesitas ayuda",
  "can we go slower": "podemos ir más despacio",
  "can you help me with my homework": "me puedes ayudar con mi tarea",
  "what are we learning today": "qué vamos a aprender hoy",
  "today we will practice": "hoy vamos a practicar",
  "you are getting better": "estás mejorando",
  "that is a great question": "esa es una gran pregunta",
  "i made a mistake": "cometí un error",
  "it is okay to make mistakes": "está bien cometer errores",
};

const ES_WORDS: Record<string, string> = {
  puedes: "can you", puede: "can", quiero: "I want", quieres: "do you want", necesito: "I need",
  necesitas: "do you need", tengo: "I have", tienes: "do you have", entiendo: "I understand",
  entiendes: "do you understand", sé: "I know", sabes: "do you know", cómo: "how", qué: "what",
  cuándo: "when", dónde: "where", "por qué": "why", porque: "because", está: "is", estoy: "I am",
  hay: "there is", vemos: "see", puedo: "I can", hola: "hello", adiós: "goodbye",
  gracias: "thank you", favor: "please", rápido: "fast", bien: "well", mal: "bad", sí: "yes",
  el: "the", la: "the", los: "the", las: "the", un: "a", una: "a", unos: "some", unas: "some",
  y: "and", o: "or", pero: "but", con: "with", sin: "without", para: "for", en: "in", de: "of",
  es: "is", son: "are", soy: "I am", era: "was", muy: "very", también: "also", más: "more",
  menos: "less", ahora: "now", hoy: "today", mañana: "tomorrow", ayer: "yesterday",
  después: "later", luego: "then", siempre: "always", nunca: "never", otra: "another", vez: "time",
  juntos: "together", listo: "ready", cansado: "tired", nervioso: "nervous", orgulloso: "proud",
  confundido: "confused", difícil: "hard", fácil: "easy", bueno: "good", malo: "bad",
  correcto: "correct", incorrecto: "wrong", importante: "important", escuela: "school",
  clase: "class", maestro: "teacher", maestra: "teacher", estudiante: "student", amigo: "friend",
  amiga: "friend", libro: "book", página: "page", lápiz: "pencil", papel: "paper",
  cuaderno: "notebook", tarea: "homework", hoja: "worksheet", prueba: "test", pregunta: "question",
  problema: "problem", respuesta: "answer", número: "number", matemáticas: "math", lectura: "reading",
  escritura: "writing", ciencias: "science", historia: "history", español: "Spanish",
  inglés: "English", palabra: "word", oración: "sentence", cuento: "story", idea: "idea",
  detalle: "detail", evidencia: "evidence", resumen: "summary", fracción: "fraction",
  fracciones: "fractions", álgebra: "algebra", ecuación: "equation", gráfica: "graph", forma: "shape",
  mitad: "half", cuarto: "quarter", entero: "whole", ejemplo: "example", lección: "lesson",
  reunión: "meeting", minuto: "minute", hora: "hour", día: "day", semana: "week", mes: "month",
  lunes: "Monday", martes: "Tuesday", miércoles: "Wednesday", jueves: "Thursday",
  viernes: "Friday", sábado: "Saturday", domingo: "Sunday", familia: "family", mamá: "mom",
  papá: "dad", madre: "mother", padre: "father", feliz: "happy", triste: "sad",
  divertido: "fun", aburrido: "boring", genial: "great", increíble: "amazing",
  perfecto: "perfect", terminado: "done", esfuerzo: "effort", progreso: "progress",
  error: "mistake", desafío: "challenge", meta: "goal", descanso: "break", tiempo: "time",
  ayuda: "help", escuchar: "listen", hablar: "speak", leer: "read", escribir: "write",
  aprender: "learn", practicar: "practice", explicar: "explain", repetir: "repeat",
  mostrar: "show", ver: "see", mirar: "look", pensar: "think", empezar: "start", terminar: "finish",
  trabajar: "work", estudiar: "study", recordar: "remember", olvidar: "forget",
  elegir: "choose", responder: "answer", preguntar: "ask", decir: "say", sentir: "feel",
  tomar: "take", dar: "give", poner: "put", encontrar: "find", usar: "use", hacer: "make",
  ir: "go", venir: "come", despacio: "slowly", despacio_: "slowly",
  trabajo: "work", todavía: "yet", sobre: "about", esto: "this", eso: "that", esta: "this", este: "this",
  ayúdame: "help me", dime: "tell me", muéstrame: "show me", explícame: "explain to me",
  escúchame: "listen to me", oye: "listen", oír: "hear", cuál: "which", quién: "who",
  muchos: "many", muchas: "many", mucho: "much", mucha: "much",
  teléfono: "phone", celular: "cellphone", privado: "private", privada: "private",
  privacidad: "privacy", dirección: "address", contacto: "contact", seguro: "safe",
  seguridad: "safety", "correo electrónico": "email",
  explicarlo: "explain it", explicarla: "explain it", explicarme: "explain to me",
  repetirlo: "repeat it", repetirla: "repeat it", decirlo: "say it", mostrarlo: "show it",
  mostrarme: "show me", ayudarte: "help you", ayudarme: "help me", escucharme: "listen to me",
  aprendiendo: "learning", mejorando: "getting better", llegaste: "you got",
  atascado: "stuck", atascada: "stuck", pista: "hint", a: "to", esa: "that", ese: "that",
  estás: "are you", estan: "are",
  aquí: "here",
};

const EXTRA_PHRASES: Array<[string, string]> = [
  ["can you repeat that slower", "puedes repetir eso más despacio"],
  ["can you repeat that more slowly", "puedes repetir eso más despacio"],
  ["please speak slower", "por favor habla más despacio"],
  ["could you explain that again", "puedes explicar eso otra vez"],
  ["do you understand", "entiendes"],
  ["yes i understand", "sí entiendo"],
  ["i do not know", "no sé"],
  ["i don't know", "no sé"],
  ["i have a question", "tengo una pregunta"],
  ["can you show me", "me puedes mostrar"],
  ["let's review your homework", "repasemos tu tarea"],
  ["let us review your homework", "repasemos tu tarea"],
  ["what page are we on", "en qué página estamos"],
  ["what subject do you need help with", "en qué materia necesitas ayuda"],
  ["i can help with that", "puedo ayudar con eso"],
  ["that is okay mistakes help us learn", "está bien los errores nos ayudan a aprender"],
  ["take a deep breath", "respira profundo"],
  ["we have five minutes left", "nos quedan cinco minutos"],
  ["great thinking", "buen razonamiento"],
  ["can you try again", "puedes intentarlo otra vez"],
  ["you did it", "lo lograste"],
  ["keep going", "sigue adelante"],
  ["almost there", "casi lo logras"],
  ["nice work today", "buen trabajo hoy"],
  ["i do not speak much english", "no hablo mucho inglés"],
  ["i don't speak much english", "no hablo mucho inglés"],
  ["do you speak spanish", "hablas español"],
  ["see you on monday", "nos vemos el lunes"],
  ["see you next week", "nos vemos la próxima semana"],
  ["let's start with a warm up", "empecemos con un calentamiento"],
  ["let us start with a warm up", "empecemos con un calentamiento"],
  ["i am here to help", "estoy aquí para ayudar"],
  ["you are doing great", "lo estás haciendo muy bien"],
  ["let's try a different way", "intentemos de otra manera"],
  ["can we reschedule", "podemos reprogramar"],
  ["my internet is slow", "mi internet está lento"],
  ["i need to leave now", "necesito irme ahora"],
  ["one moment please", "un momento por favor"],
  ["how do you say this in english", "cómo se dice esto en inglés"],
  ["how do you say this in spanish", "cómo se dice esto en español"],
  ["what does this word mean", "qué significa esta palabra"],
  ["good morning", "buenos días"],
  ["good afternoon", "buenas tardes"],
  ["good night", "buenas noches"],
  ["thank you so much", "muchas gracias"],
  ["you are welcome", "de nada"],
  ["what is your name", "cómo te llamas"],
  ["my name is", "me llamo"],
  ["nice to meet you", "mucho gusto"],
  ["i am nervous", "estoy nervioso"],
  ["i am proud of you", "estoy orgulloso de ti"],
  ["you can do it", "tú puedes"],
  ["show me your work", "muéstrame tu trabajo"],
  ["show me your work please", "muéstrame tu trabajo por favor"],
  ["what do you think", "qué piensas"],
  ["tell me more", "cuéntame más"],
  ["read this page", "lee esta página"],
  ["open your notebook", "abre tu cuaderno"],
  ["write it down", "escríbelo"],
  ["do you have your worksheet", "tienes tu hoja de trabajo"],
  ["let's take a break", "tomemos un descanso"],
  ["see you later", "hasta luego"],
  ["can you", "puedes"],
  ["can you hear me", "me puedes escuchar"],
  ["can you explain", "puedes explicar"],
  ["can you explain fractions again", "puedes explicar las fracciones otra vez"],
  ["can you show me", "me puedes mostrar"],
  ["can you show me an example", "me puedes mostrar un ejemplo"],
  ["i need help with", "necesito ayuda con"],
  ["i need help", "necesito ayuda"],
  ["show me", "muéstrame"],
  ["explain to me", "explícame"],
  ["help me", "ayúdame"],
  ["tell me", "dime"],
  ["listen to me", "escúchame"],
  ["how to", "cómo"],
  ["do this", "hacer esto"],
  ["great job you can do it", "excelente trabajo tú puedes"],
  ["lets practice together", "practiquemos juntos"],
  ["lets practice", "practiquemos"],
  ["lets start", "empecemos"],
  ["lets try", "intentemos"],
  ["i am", "estoy"],
  ["you are", "eres"],
  ["we are", "somos"],
  ["it is", "es"],
  ["there is", "hay"],
  ["there are", "hay"],
  ["i want to", "quiero"],
  ["i have a", "tengo una"],
  ["do you have", "tienes"],
  ["what is", "qué es"],
  ["how do you say", "cómo se dice"],
  ["i like", "me gusta"],
  ["i don't like", "no me gusta"],
  ["i dont like", "no me gusta"],
  ["i am confused", "estoy confundido"],
  ["i am fine", "estoy bien"],
  ["i am ready", "estoy listo"],
  ["hello how are you", "hola cómo estás"],
];

const ES_EN: Record<string, string> = {};
for (const [en, es] of Object.entries(EN_ES)) {
  if (!(es in ES_EN)) ES_EN[es] = en;
}
for (const [es, en] of Object.entries(ES_WORDS)) {
  if (!(es in ES_EN)) ES_EN[es] = en;
}
for (const [en, es] of EXTRA_PHRASES) {
  EN_ES[en] = es;
  if (!(es in ES_EN)) ES_EN[es] = en;
}

const QUICK_PHRASES: Array<{ en: string; es: string }> = [
  { en: "Hello! How are you?", es: "¡Hola! ¿Cómo estás?" },
  { en: "Can you hear me?", es: "¿Me puedes escuchar?" },
  { en: "I don't understand yet.", es: "Todavía no entiendo." },
  { en: "Can you repeat that slower?", es: "¿Puedes repetir eso más despacio?" },
  { en: "Show me your work, please.", es: "Muéstrame tu trabajo, por favor." },
  { en: "Great job — you can do it!", es: "¡Excelente trabajo — tú puedes!" },
  { en: "Let's practice together.", es: "Practiquemos juntos." },
  { en: "See you next week!", es: "¡Nos vemos la próxima semana!" },
];

export { QUICK_PHRASES };

function stripEnds(text: string): string {
  return text.replace(/^[\s¿¡"'(]+/, "").replace(/[\s?!."')]+$/, "");
}

function normalizePhrase(text: string): string {
  return stripEnds(text)
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[—–-]/g, " ")
    .replace(/[.,!?;:¿¡"'()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function matchCase(source: string, translated: string): string {
  if (!source) return translated;
  if (source[0] === source[0].toUpperCase()) return translated.charAt(0).toUpperCase() + translated.slice(1);
  return translated;
}

function translateWord(word: string, dict: Record<string, string>): string | null {
  const lower = word.toLowerCase().replace(/[’‘]/g, "'");
  if (dict[lower]) return dict[lower];
  if (dict[lower.replace(/'/g, "")]) return dict[lower.replace(/'/g, "")];
  // attached pronouns: explicarlo → explain it, mostrarme → show me
  const pronoun = /(lo|la|le|me|te|nos)$/.exec(lower)?.[0];
  if (pronoun) {
    const base = lower.slice(0, -pronoun.length);
    if (dict[base]) {
      const pronouns: Record<string, string> = { lo: "it", la: "it", le: "them", me: "me", te: "you", nos: "us" };
      return `${dict[base]} ${pronouns[pronoun]}`;
    }
  }
  // gentle morphology fallbacks
  if (lower.endsWith("s") && dict[lower.slice(0, -1)]) return dict[lower.slice(0, -1)] + "s";
  if (lower.endsWith("es") && dict[lower.slice(0, -2)]) return dict[lower.slice(0, -2)] + "es";
  if (lower.endsWith("ing") && dict[lower.slice(0, -3)]) return dict[lower.slice(0, -3)] + "ando";
  if (lower.endsWith("ed") && dict[lower.slice(0, -2)]) return dict[lower.slice(0, -2)] + "ado";
  return null;
}

const EN_PHRASEBOOK = new Map<string, string>();
const ES_PHRASEBOOK = new Map<string, string>();
for (const [en, es] of Object.entries(EN_ES)) {
  const key = normalizePhrase(en);
  if (key && !EN_PHRASEBOOK.has(key)) EN_PHRASEBOOK.set(key, es);
  const reverse = normalizePhrase(es);
  if (reverse && !ES_PHRASEBOOK.has(reverse)) ES_PHRASEBOOK.set(reverse, en);
}

const EN_PHRASES = Array.from(EN_PHRASEBOOK.entries())
  .filter(([key]) => key.includes(" "))
  .map(([key, value]) => ({ tokens: key.split(" "), value }))
  .sort((a, b) => b.tokens.length - a.tokens.length);
const ES_PHRASES = Array.from(ES_PHRASEBOOK.entries())
  .filter(([key]) => key.includes(" "))
  .map(([key, value]) => ({ tokens: key.split(" "), value }))
  .sort((a, b) => b.tokens.length - a.tokens.length);

function finishSentence(source: string, translated: string, to: Lang): string {
  const trimmed = source.trim();
  const existingLead = /^[¿¡]/.exec(trimmed)?.[0] ?? "";
  const tail = /[.!?]+$/.exec(trimmed)?.[0] ?? "";
  let text = translated.trim().replace(/\s+([,.;:!?])/g, "$1");
  if (!text) return trimmed;
  text = text.charAt(0).toUpperCase() + text.slice(1);
  if (to === "es") {
    if (tail.includes("?") && !text.startsWith("¿")) text = `¿${text}`;
    if (tail.includes("!") && !text.startsWith("¡")) text = `¡${text}`;
  }
  if (!existingLead && /^¡|^¿/.test(translated.trim())) text = text.replace(/^([¿¡])/, "$1");
  if (tail && !/[.!?]$/.test(text)) text += tail;
  return text;
}

function translateSentence(sentence: string, from: Lang, to: Lang): { text: string; hits: number } {
  const dict = from === "en" ? EN_ES : ES_EN;
  const phrasebook = from === "en" ? EN_PHRASEBOOK : ES_PHRASEBOOK;
  const phrases = from === "en" ? EN_PHRASES : ES_PHRASES;
  const normalized = normalizePhrase(sentence);
  if (normalized && phrasebook.has(normalized)) {
    return {
      text: finishSentence(sentence, phrasebook.get(normalized)!, to),
      hits: normalized.split(" ").length + 1,
    };
  }

  const words = sentence.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:['’][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)?/g) || [];
  const norms = words.map((word) => normalizePhrase(word));
  const output: string[] = [];
  let hits = 0;
  let index = 0;
  while (index < words.length) {
    let matched: { tokens: string[]; value: string } | null = null;
    for (const phrase of phrases) {
      if (phrase.tokens.length > words.length - index) continue;
      let ok = true;
      for (let offset = 0; offset < phrase.tokens.length; offset++) {
        if (phrase.tokens[offset] !== norms[index + offset]) {
          ok = false;
          break;
        }
      }
      if (ok) {
        matched = phrase;
        break;
      }
    }
    if (matched) {
      output.push(matched.value);
      hits += matched.tokens.length;
      index += matched.tokens.length;
    } else {
      const translated = translateWord(words[index], dict);
      output.push(translated ?? words[index]);
      if (translated) hits++;
      index++;
    }
  }

  const joined = output.join(" ");
  return { text: joined ? finishSentence(sentence, joined, to) : sentence, hits };
}

export function translateText(text: string, from: Lang, to: Lang): { text: string; mode: "phrasebook" | "partial" | "unchanged" } {
  const trimmed = text.trim();
  if (!trimmed) return { text: "", mode: "unchanged" };
  if (from === to) return { text: trimmed, mode: "unchanged" };

  let totalHits = 0;
  let totalWords = 0;
  const out = trimmed.split(/\n+/).map((line) =>
    line
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean)
      .map((part) => {
        const words = part.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g) || [];
        totalWords += words.length;
        const result = translateSentence(part, from, to);
        totalHits += result.hits;
        return result.text;
      })
      .join(" "),
  );

  const mode: "phrasebook" | "partial" | "unchanged" =
    totalHits === 0 ? "unchanged" : totalHits / Math.max(totalWords, 1) >= 0.75 ? "phrasebook" : "partial";
  return { text: out.join("\n"), mode };
}

export type TranslateResponse = { text: string; mode: "phrasebook" | "partial" | "unchanged"; from: Lang; to: Lang };
