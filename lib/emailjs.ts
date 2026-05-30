export type LeadPayload = {
  email: string;
  message: string;
  wantsCall: boolean;
  sessionId: string;
  recentMessages: string;
};

export async function sendLeadEmail(payload: LeadPayload): Promise<void> {
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

  if (!publicKey || !serviceId || !templateId) {
    throw new Error('EmailJS env vars not configured');
  }

  const { default: emailjs } = await import('@emailjs/browser');

  await emailjs.send(
    serviceId,
    templateId,
    {
      from_email: payload.email,
      message: payload.message || '(no message)',
      wants_call: payload.wantsCall ? 'Yes' : 'No',
      session_id: payload.sessionId,
      recent_messages: payload.recentMessages || '(empty)',
    },
    { publicKey }
  );
}
