/**
 * Extracts the most likely verification code from an email body.
 *
 * @param emailBody - The full text of the email to scan for codes.
 * @returns The best-scoring code string, or null if no suitable code is found.
 */
export function extractOTPCode(emailBody: string): string | null {
  // Convert the entire email body to lowercase for keyword matching
  const lowerCaseEmailBody: string = emailBody.toLowerCase();

  // List of keywords related to verification, security, or promotional codes
  const codeRelatedKeywords: string[] = [
    "verification",
    "security",
    "access",
    "login",
    "one-time",
    "one time",
    "otp",
    "pin",
    "passcode",
    "password",
    "code",
    "authentication",
    "authenticate",
    "authorization",
    "confirm",
    "authorize",
    "verify",
    "validation",
    "coupon",
    "promo",
    "offer",
    "confirmation",
    "two-step",
    "number",
    "receipt",
    "promotion",
  ];

  // Find all substrings of length 4–25 that contain at least one digit
  const rawCodeCandidates: RegExpMatchArray | null = emailBody.match(
    /\b(?=.*\d)[-*A-Za-z0-9]{4,25}\b/g,
  );
  const codeCandidates: string[] = rawCodeCandidates ?? [];

  // Patterns to exclude obvious non-code strings (CSS values, dates, IPs, etc.)
  const exclusionPatterns: RegExp[] = [
    /\d+px/, // CSS pixel values
    /\d+em/, // CSS em values
    /\d+rem/, // CSS rem values
    /\d+%/, // Percentage values
    /head.*/,
    /rgb\(\d+,\s*\d+,\s*\d+\)/, // RGB color values
    /#[0-9A-Fa-f]{3,6}/, // Hex color values
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\b/, // Short date strings
    /\b\d{1,2}:\d{2}\b/, // Time strings
    /\bhead\b|\bbody\b|\bhtml\b|\bscript\b|\bstyle\b/, // HTML tag names
  ];

  interface CandidateScore {
    code: string;
    score: number;
  }

  // Assign a score to each code candidate
  const scoredCandidates: CandidateScore[] = codeCandidates.map((candidate) => {
    let score = 0;
    const indexOfCandidate: number = emailBody.indexOf(candidate);

    // Penalize candidates with no digits or matching an exclusion pattern
    if (
      !/\d/.test(candidate) ||
      exclusionPatterns.some((pattern) => pattern.test(candidate))
    ) {
      score -= 20;
    }

    // Boost score if a related keyword appears nearby (within ~200 characters)
    codeRelatedKeywords.forEach((keyword) => {
      const indexOfKeyword = lowerCaseEmailBody.indexOf(keyword);
      if (
        indexOfKeyword !== -1 &&
        Math.abs(indexOfKeyword - indexOfCandidate) < 200
      ) {
        score +=
          10 - Math.floor(Math.abs(indexOfKeyword - indexOfCandidate) / 20);
      }
    });

    // Add points for each digit in the candidate
    const digitCountMatches = candidate.match(/\d/g);
    score += (digitCountMatches ? digitCountMatches.length : 0) * 2;

    // Check if the candidate is part of a phone number
    const contextAroundCandidate: string = emailBody.substring(
      Math.max(0, indexOfCandidate - 10),
      indexOfCandidate + candidate.length + 10,
    );
    const isPhoneNumber: boolean =
      /\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3,4}[-.\s]?\d{4}/.test(
        contextAroundCandidate,
      );
    if (isPhoneNumber) {
      score -= 10;
    }

    // Penalize four-digit years (e.g., "2025")
    if (/^(19|20)\d{2}$/.test(candidate)) {
      score -= 20;
    }

    // Boost if the candidate follows phrases like "your code is" or "verification code:"
    const textBeforeCandidate: string = emailBody
      .substring(Math.max(0, indexOfCandidate - 50), indexOfCandidate)
      .toLowerCase();
    if (
      textBeforeCandidate.includes("your code is") ||
      textBeforeCandidate.includes("verification code:")
    ) {
      score += 20;
    }

    return { code: candidate, score };
  });

  // Sort in descending order by score
  scoredCandidates.sort((a, b) => b.score - a.score);

  // Choose the top-scoring candidate
  const bestCandidate: CandidateScore | undefined = scoredCandidates[0];

  // Return the code only if it passes a minimum score threshold
  return bestCandidate && bestCandidate.score > 20 ? bestCandidate.code : null;
}
