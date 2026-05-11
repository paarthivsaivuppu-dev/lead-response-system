type ClickSendSmsInput = {
  to: string | null;
  body: string;
};

export async function sendClickSendSms({ to, body }: ClickSendSmsInput) {
  if (!to) {
    return;
  }

  const username = process.env.CLICKSEND_USERNAME;
  const apiKey = process.env.CLICKSEND_API_KEY;

  if (!username || !apiKey) {
    console.error("SMS notification skipped: ClickSend credentials are not set.");
    return;
  }

  const auth = Buffer.from(`${username}:${apiKey}`).toString("base64");
  const response = await fetch("https://rest.clicksend.com/v3/sms/send", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: [
        {
          to,
          body,
          source: "lead-response"
        }
      ]
    })
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `ClickSend SMS failed with status ${response.status}: ${responseText}`
    );
  }
}
