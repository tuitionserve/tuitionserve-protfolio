/** Builds a mailto: link pre-filled with a subject referencing the enquiry and the original message quoted underneath. */
export function replyMailtoHref(email: string, queryUid: string, originalMessage: string): string {
  const subject = `Re: Your message to Tuition Serve (${queryUid})`;
  const quoted = originalMessage
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  const body = `\n\n---\nYou wrote:\n${quoted}`;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Truncates a message for a list preview without cutting mid-word. */
export function truncateMessage(message: string, maxLength = 140): string {
  const singleLine = message.replace(/\s+/g, " ").trim();
  if (singleLine.length <= maxLength) return singleLine;
  return `${singleLine.slice(0, maxLength).replace(/\s+\S*$/, "")}…`;
}
