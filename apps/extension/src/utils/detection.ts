interface AuthCandidate {
  type: "link" | "code";
  value: string;
  score: number;
}

export function extractAuthCandidates(emailBody: string): AuthCandidate[] {
  const candidates: AuthCandidate[] = [];
  const lowerEmailBody = emailBody;

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
  ];

  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const linkMatches = emailBody.match(linkRegex) || [];

  // Process links first
  linkMatches.forEach((rawLink) => {
    const link = sanitizeLink(rawLink);
    let score = 20;
    const lowerLink = link;

    authKeywords.forEach(({ regex, weight }) => {
      // Reset regex lastIndex to ensure proper matching
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

    candidates.push({ type: "link", value: link, score });
  });

  // Remove all links from email body before searching for codes
  let emailBodyWithoutLinks = emailBody;
  linkMatches.forEach((link) => {
    emailBodyWithoutLinks = emailBodyWithoutLinks.replace(link, " ");
  });

  const codeRegex = /\b(?=.*\d)[-*A-Za-z0-9]{4,25}\b/g;
  const codeMatches = emailBodyWithoutLinks.match(codeRegex) || [];

  const exclusionPatterns = [
    /\d+px/,
    /\d+em/,
    /\d+rem/,
    /\d+%/,
    /head.*/,
    /rgb\(\d+,\s*\d+,\s*\d+\)/,
    /#[0-9A-Fa-f]{3,6}/,
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\b/,
    /\b\d{1,2}:\d{2}\b/,
    /\bhead\b|\bbody\b|\bhtml\b|\bscript\b|\bstyle\b/,
    /^(19|20)\d{2}$/,
  ];

  codeMatches.forEach((code) => {
    if (exclusionPatterns.some((pattern) => pattern.test(code))) {
      return;
    }

    let score = 0;
    // Find the code position in the original email body for context analysis
    const codeIndex = emailBody.indexOf(code);

    // Skip if this code appears to be part of a link we already processed
    const isInLink = linkMatches.some((link) => link.includes(code));
    if (isInLink) {
      return;
    }

    const digitCount = (code.match(/\d/g) || []).length;
    score += digitCount * 3;

    authKeywords.forEach(({ regex, weight }) => {
      regex.lastIndex = 0;
      const matches = [
        ...lowerEmailBody.matchAll(new RegExp(regex.source, "gi")),
      ];

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

    if (/\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3,4}[-.\s]?\d{4}/.test(contextAround)) {
      score -= 15;
    }

    if (code.length >= 6 && code.length <= 8 && /^\d+$/.test(code)) {
      score += 10;
    }

    candidates.push({ type: "code", value: code, score });
  });

  return candidates.sort((a, b) => b.score - a.score);
}

function sanitizeLink(url: string): string {
  return url.replace(/[\.\,\;\:\)\]\}]+$/g, "");
}
