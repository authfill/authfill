import { convert } from "html-to-text";

export interface AuthCandidate {
  type: "link" | "code";
  value: string;
  score: number;
}

const codePatterns = [
  "????",
  "?????",
  "??????",
  "???????",
  "???-???",
  "?-?-?-?",
  "????????",
  "??-??-??",
  "?-?-?-?-?",
  "????-????",
  "?????????",
  "??????????",
  "???-???-???",
  "?-?-?-?-?-?",
  "?????-?????",
  "??????-??????",
  "?-?-?-?-?-?-?",
  "????-????-????",
  "???-???-???-???",
  "???????-???????",
  "?????-?????-?????",
  "????-????-????-????",
  "?????-?????-?????-?????",
];

const codePartRegex = "[A-Za-z0-9]";
const codeSeperatorRegex = "(( - )|( \\* )|( _ )|[ \\-*_\\.])";
let codeBodyRegex = "(";

for (const pattern of codePatterns) {
  const parts = pattern.split("-");

  codeBodyRegex += "(?<=\\s|^)";
  codeBodyRegex += `(${parts.map((part) => `${codePartRegex}{${part.length}}`).join(codeSeperatorRegex)})`;
  codeBodyRegex += "(?=\\s|$)";
  codeBodyRegex += "|";
}

codeBodyRegex = codeBodyRegex.slice(0, -1);
codeBodyRegex += ")";

export function extractAuthCandidates({
  html,
  text,
  subject,
}: {
  html?: string;
  text?: string;
  subject?: string;
}): AuthCandidate[] {
  let emailBody = text || "";
  if (html)
    emailBody = convert(html, {
      wordwrap: false,
      selectors: [
        { selector: "img", format: "skip" },
        {
          selector: "a",
          options: { linkBrackets: false },
        },
      ],
    });

  if (subject) emailBody = `${subject}\n\n${emailBody}`;

  // Replace non-breaking spaces with regular spaces
  emailBody = emailBody.replace(/ /g, " ");

  const candidates: AuthCandidate[] = [];

  const authKeywords = [
    { regex: /verif(?:y|ies|ied|ying|ication)/gi, weight: 12 },
    { regex: /confirm(?:s?|ed|ing|ation)/gi, weight: 8 },
    { regex: /activat(?:e|es|ed|ing|ion)/gi, weight: 8 },
    { regex: /authenticat(?:e|es|ed|ing|ion)/gi, weight: 12 },
    { regex: /authoriz(?:e|es|ed|ing|ation)/gi, weight: 5 },
    { regex: /securit(?:y|ies)/gi, weight: 12 },
    { regex: /access(?:es|ed|ing)?/gi, weight: 5 },
    { regex: /log[-\s]?in(?:s)?/gi, weight: 8 },
    { regex: /otp/gi, weight: 12 },
    { regex: /one[-\s]?time/gi, weight: 5 },
    { regex: /pin(?:s)?/gi, weight: 5 },
    { regex: /pass[-\s]?code(?:s)?/gi, weight: 5 },
    { regex: /password(?:s)?/gi, weight: 8 },
    { regex: /code(?:s)?/gi, weight: 8 },
    { regex: /token(?:s)?/gi, weight: 8 },
    { regex: /auth(?:entication)?/gi, weight: 5 },
    { regex: /magic[-\s_]?link(?:s)?/gi, weight: 12 },
    { regex: /reset[-\s]?password(?:s)?/gi, weight: 8 },
    { regex: /forgot(?:ten)?[-\s]?password(?:s)?/gi, weight: 8 },
    { regex: /two[-\s]?(?:step|factor)/gi, weight: 12 },
    { regex: /validat(?:e|es|ed|ing|ion)/gi, weight: 5 },
    { regex: /2fa/gi, weight: 12 },
    { regex: /multi[-\s]?factor/gi, weight: 12 },
    { regex: /sign[-\s]?in/gi, weight: 8 },
    { regex: /sign[-\s]?up/gi, weight: 8 },
    { regex: /registr(?:ation|y)/gi, weight: 8 },
  ];

  const contextPhrases = [
    /verify\s+your\s+email/gi,
    /click\s+to\s+verify/gi,
    /confirm\s+your\s+email/gi,
    /activate\s+your\s+account/gi,
    /email\s+verification/gi,
    /complete\s+your\s+registration/gi,
    /reset\s+your\s+password/gi,
    /forgot\s+your\s+password/gi,
    /your\s+code\s+is/gi,
    /verification\s+code\s*:/gi,
    /enter\s+the\s+code/gi,
    /use\s+this\s+code/gi,
    /security\s+code/gi,
    /authentication\s+code/gi,
    /login\s+code/gi,
    /sign(ed)?\s?(in|up)/gi,
  ];

  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const linkMatches = uniqueArray(emailBody.match(linkRegex) || []);

  linkMatches.forEach((rawLink) => {
    let score = 20;
    const link = sanitizeLink(rawLink);
    const lowerLink = link;

    const url = new URL(link);
    // Skip links to the index page (e.g. https://example.com/)
    if (url.pathname === "/") return;

    const lastPath = link.split("/").pop();
    const lastPathSplit = lastPath?.split(".");
    const fileExtension =
      (lastPathSplit?.length || 0) > 1 ? lastPathSplit?.at(-1) : null;

    // Filter out links to files with non-website extensions
    if (
      fileExtension &&
      !["html", "htm", "php", "asp", "aspx", "jsp", "cfm", "shtml"].includes(
        fileExtension,
      )
    )
      return;

    authKeywords.forEach(({ regex, weight }) => {
      regex.lastIndex = 0;
      if (regex.test(lowerLink)) {
        score += weight * 2;
      }
    });

    const linkIndex = emailBody.indexOf(rawLink);
    if (linkIndex !== -1) {
      const contextStart = Math.max(0, linkIndex - 100);
      const contextEnd = Math.min(
        emailBody.length,
        linkIndex + rawLink.length + 100,
      );
      const context = emailBody.slice(contextStart, contextEnd);

      contextPhrases.forEach((phraseRegex) => {
        phraseRegex.lastIndex = 0;
        if (phraseRegex.test(context)) {
          score += 15;
        }
      });
    }

    // Get the position of the last character of the link
    const linkEndIndex = emailBody.lastIndexOf(link) + link.length;

    const positionPercentage = Math.round(
      (linkEndIndex / emailBody.length) * 100,
    );

    // Penalize links that are at
    if (positionPercentage > 80) score -= 15;
    candidates.push({ type: "link", value: link, score });
  });

  let emailBodyWithoutLinks = emailBody;
  linkMatches.forEach((link) => {
    emailBodyWithoutLinks = emailBodyWithoutLinks.replace(link, " ");
  });

  // const codeBodyRegex = "([-*A-Za-z0-9 ]{4,11})[\\t ]*";

  const codeMatches = uniqueArray([
    // Matches code-like words in its own line
    ...([
      ...emailBodyWithoutLinks.matchAll(
        new RegExp(`^[\\t ]*${codeBodyRegex}$`, "gm"),
      ),
    ]?.map((r) => r[1]) || []),
    // Matches code-like words after colon, like "Your code is: 123456"
    ...([
      ...emailBodyWithoutLinks.matchAll(
        new RegExp(`:[\\t ]*${codeBodyRegex}`, "gm"),
      ),
    ]?.map((r) => r[1]) || []),
  ]);

  const exclusionPatterns = [
    // IP Addresses
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
    // Dates
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\b/,
    // Times
    /\b\d{1,2}:\d{2}\b/,
    // Years
    /^(19|20)\d{2}$/,
  ];

  const lengthScores = {
    4: 12,
    5: 15,
    6: 15,
    7: 15,
    8: 14,
    9: 13,
    10: 12,
    11: 10,
  };

  codeMatches.forEach((code) => {
    if (exclusionPatterns.some((pattern) => pattern.test(code))) return;

    let score = 20;
    const codeIndex = emailBody.indexOf(code);

    const digitCount = (code.match(/\d/g) || []).length;
    score +=
      lengthScores[digitCount as unknown as keyof typeof lengthScores] || 0;

    authKeywords.forEach(({ regex, weight }) => {
      regex.lastIndex = 0;
      const matches = [...emailBody.matchAll(new RegExp(regex.source, "gi"))];

      matches.forEach((match) => {
        const keywordIndex = match.index!;
        const distance = Math.abs(keywordIndex - codeIndex);
        if (distance < 200) {
          score += Math.max(1, weight - Math.floor(distance / 30));
        }
      });
    });

    const contextBefore = emailBody.substring(
      Math.max(0, codeIndex - 80),
      codeIndex,
    );

    contextPhrases.forEach((phraseRegex) => {
      phraseRegex.lastIndex = 0;
      if (phraseRegex.test(contextBefore)) {
        score += 25;
      }
    });

    const contextAround = emailBody.substring(
      Math.max(0, codeIndex - 15),
      codeIndex + code.length + 15,
    );

    // Penalize possible phone numbers
    if (/\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3,4}[-.\s]?\d{4}/.test(contextAround)) {
      score -= 15;
    }

    candidates.push({ type: "code", value: code, score });
  });

  return candidates.sort((a, b) => b.score - a.score);
}

function sanitizeLink(url: string): string {
  return url.replace(/[\.\,\;\:\)\]\}]+$/g, "");
}

function uniqueArray<T>(array: T[]) {
  return [...new Set(array)];
}
