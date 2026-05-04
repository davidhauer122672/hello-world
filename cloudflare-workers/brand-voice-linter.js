const BRAND_RULES = {
  prohibited_punctuation: {
    '!': 'Exclamation point detected',
    '—': 'Em dash detected'
  },
  prohibited_phrases: [
    'it is important to note',
    'in conclusion',
    'furthermore',
    'as a matter of fact',
    'it goes without saying',
    'needless to say'
  ],
  max_reading_level: 9
};

function estimateReadingLevel(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => {
    return count + countSyllables(word);
  }, 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  return Math.round(0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59);
}

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  const vowelGroups = word.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;
  if (word.endsWith('e') && !word.endsWith('le')) count--;
  return Math.max(1, count);
}

function lintContent(text) {
  const violations = [];

  for (const [char, message] of Object.entries(BRAND_RULES.prohibited_punctuation)) {
    if (text.includes(char)) {
      const positions = [];
      let idx = text.indexOf(char);
      while (idx !== -1) {
        positions.push(idx);
        idx = text.indexOf(char, idx + 1);
      }
      violations.push({
        rule: 'prohibited_punctuation',
        severity: 'error',
        message,
        positions,
        count: positions.length
      });
    }
  }

  const lowerText = text.toLowerCase();
  for (const phrase of BRAND_RULES.prohibited_phrases) {
    if (lowerText.includes(phrase)) {
      violations.push({
        rule: 'prohibited_phrase',
        severity: 'error',
        message: `Banned filler phrase: "${phrase}"`,
        phrase
      });
    }
  }

  const readingLevel = estimateReadingLevel(text);
  if (readingLevel > BRAND_RULES.max_reading_level) {
    violations.push({
      rule: 'reading_level',
      severity: 'warning',
      message: `Reading level ${readingLevel} exceeds max ${BRAND_RULES.max_reading_level}`,
      current: readingLevel,
      max: BRAND_RULES.max_reading_level
    });
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 0) {
    const firstSentence = sentences[0].trim();
    const firstWords = firstSentence.split(/\s+/);
    if (firstWords.length > 25) {
      violations.push({
        rule: 'first_sentence_length',
        severity: 'warning',
        message: `First sentence is ${firstWords.length} words. Get to the point faster.`,
        word_count: firstWords.length
      });
    }
  }

  const lastSentence = sentences[sentences.length - 1]?.trim().toLowerCase() || '';
  const riskClosers = ['risk', 'consequence', 'cost', 'loss', 'damage', 'liability', 'exposure', 'threat', 'failure', 'neglect'];
  const hasRiskClose = riskClosers.some(word => lastSentence.includes(word));
  if (!hasRiskClose && sentences.length > 2) {
    violations.push({
      rule: 'risk_close',
      severity: 'warning',
      message: 'Content does not appear to close with a risk or consequence frame'
    });
  }

  return {
    passed: violations.filter(v => v.severity === 'error').length === 0,
    violations,
    reading_level: estimateReadingLevel(text),
    word_count: text.split(/\s+/).length,
    sentence_count: sentences.length
  };
}

const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';

async function flagRecord(env, tableId, recordId) {
  await fetch(`${AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/${tableId}/${recordId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: { 'Status': 'Needs Revision' }
    })
  });
}

async function notifySlack(env, violations, recordId, module) {
  const violationList = violations.map(v => `- [${v.severity.toUpperCase()}] ${v.message}`).join('\n');
  await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: '#ai-drafts',
      text: `Brand Voice Lint Failed | ${module} | Record: ${recordId}\n${violationList}`
    })
  });
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'POST required' }), { status: 405 });
    }

    const body = await request.json();
    const { content, record_id, table_id, module } = body;

    if (!content) {
      return new Response(JSON.stringify({ error: 'content required' }), { status: 400 });
    }

    const result = lintContent(content);

    if (!result.passed && record_id && table_id) {
      await flagRecord(env, table_id, record_id);
      await notifySlack(env, result.violations, record_id, module || 'UNKNOWN');
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
