export function cleanOcrText(input: string): string {
  if (!input) return '';

  let text = input;

  text = text
    .replace(/\r/g, '\n')
    .replace(/[\*\|\u2022]+/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .replace(/https?\s*:\s*\/\s*\//gi, 'https://')
    .replace(/www\s*\./gi, 'www.')
    .replace(/\. com/gi, '.com')
    .replace(/\. in/gi, '.in')
    .replace(/\. org/gi, '.org')
    .replace(/\. net/gi, '.net')
    .replace(/cg p a/gi, 'CGPA')
    .replace(/c g p a/gi, 'CGPA')
    .replace(/back logs?/gi, 'backlogs')
    .replace(/inter nship/gi, 'internship')
    .replace(/plac ement/gi, 'placement');

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const deduped: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const normalized = line
      .toLowerCase()
      .replace(/\s+/g, ' ');

    if (normalized.length < 3) continue;

    if (!seen.has(normalized)) {
      seen.add(normalized);
      deduped.push(line);
    }
  }

  return deduped.join('\n');
}
