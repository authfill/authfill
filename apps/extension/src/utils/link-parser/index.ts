export function extractLink(text: string): string | null {
  // 1. Regex to find http:// or https:// URLs (stops at whitespace)
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const rawCandidates = text.match(linkRegex) || [];

  if (rawCandidates.length === 0) {
    return null;
  }

  // 2. Sanitization: remove trailing punctuation characters
  //    (e.g. “https://….” or “…);” should become “https://…” without the trailing “.” or “);”).
  function sanitizeLink(url: string): string {
    // Remove trailing characters like: . , ; : ) ] }
    return url.replace(/[\.\,\;\:\)\]\}]+$/g, "");
  }

  // 3. Keyword lists (all lower‐cased for comparison)
  const urlKeywords = [
    "verify",
    "confirmation",
    "confirm",
    "activate",
    "token",
    "auth",
    "verify-email",
    "confirm-email",
    "reset-password",
    "forgot-password",
    "forget-password",
    "password-forget",
    "password-forgot",
    "password-reset",
    // TODO: Increase weight for these keywords
    "magic-link",
    "magiclink",
    "magic_link",
  ];

  const textPhrases = [
    "verify your email",
    "click to verify",
    "confirm your email",
    "activate your account",
    "email verification",
    "complete your registration",
    "reset your password",
    "forgot your password",
  ];

  // 4. Scoring parameters
  const URL_KEYWORD_WEIGHT = 2; // weight for each keyword found directly inside the URL
  const TEXT_PHRASE_WEIGHT = 1; // weight for each phrase found near the URL in the body
  const CONTEXT_WINDOW = 50; // how many characters before/after the URL to check for text phrases
  const SCORE_THRESHOLD = 2; // minimum score to accept a “verification” link

  interface CandidateScore {
    url: string;
    score: number;
  }

  const scoredCandidates: CandidateScore[] = [];

  for (const rawUrl of rawCandidates) {
    const url = sanitizeLink(rawUrl);
    let score = 0;
    const lowerUrl = url.toLowerCase();

    // 4a. Check URL itself for any “verification” keywords
    for (const kw of urlKeywords) {
      if (lowerUrl.includes(kw)) {
        score += URL_KEYWORD_WEIGHT;
      }
    }

    // 4b. Check the surrounding text (±CONTEXT_WINDOW chars) for any of the text phrases
    //     First, find where this exact raw match appeared in the original text.
    const matchIndex = text.indexOf(rawUrl);
    if (matchIndex !== -1) {
      const start = Math.max(0, matchIndex - CONTEXT_WINDOW);
      const end = Math.min(
        text.length,
        matchIndex + rawUrl.length + CONTEXT_WINDOW,
      );
      const context = text.slice(start, end).toLowerCase();

      for (const phrase of textPhrases) {
        if (context.includes(phrase)) {
          score += TEXT_PHRASE_WEIGHT;
        }
      }
    }

    scoredCandidates.push({ url, score });
  }

  // 5. Sort candidates by descending score, pick top
  scoredCandidates.sort((a, b) => b.score - a.score);

  const best = scoredCandidates[0];
  if (best.score >= SCORE_THRESHOLD) {
    return best.url;
  }

  console.log("Scored candidates:", scoredCandidates);

  return null;
}
