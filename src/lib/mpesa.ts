const BASE =
  process.env.MPESA_ENV === "prod"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

function timestamp(): string {
  return new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
}

async function token(): Promise<string> {
  const k = process.env.MPESA_CONSUMER_KEY;
  if (!k) return "sandbox";
  const auth = Buffer.from(
    `${k}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");
  const r = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return (await r.json()).access_token;
}

export interface PayResult { ok: boolean; ref?: string; simulated?: boolean; error?: string }

export async function stkPush(
  phone: string,
  amountKes: number,
  desc: string
): Promise<PayResult> {
  if (!process.env.MPESA_CONSUMER_KEY) {
    console.log(`[SIM] STK push ${phone} KES ${amountKes} — ${desc}`);
    return { ok: true, ref: `SIM-${Date.now()}`, simulated: true };
  }
  try {
    const t = await token();
    const r = await fetch(`${BASE}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: Buffer.from(
          `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp()}`
        ).toString("base64"),
        Timestamp: timestamp(),
        TransactionType: "CustomerPayBillOnline",
        Amount: amountKes,
        PartyA: phone,
        PhoneNumber: phone,
        CallBackURL: `${process.env.PUBLIC_URL}/api/mpesa/callback`,
        AccountReference: "SafariSauti",
        TransactionDesc: desc.slice(0, 20),
      }),
    });
    const j = await r.json();
    return j.CheckoutRequestID
      ? { ok: true, ref: j.CheckoutRequestID }
      : { ok: false, error: j.errorMessage ?? "STK push failed" };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
