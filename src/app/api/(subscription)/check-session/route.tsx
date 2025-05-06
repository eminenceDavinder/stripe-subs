import { stripeCheckOutSession } from '@lib/services/stripe.services';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(" ")[1];
  const { sessionId } = await req.json();
  return stripeCheckOutSession(token as string, sessionId);
}
