import { stripeCreateCheckOutSession } from '@/lib/services/stripe.services';
import { NextRequest} from 'next/server';

export async function POST(request: NextRequest) {
  const { priceId, email, promocodeId, coupon } = await request.json();
  return stripeCreateCheckOutSession(email, promocodeId, priceId, coupon,`${request.headers.get('origin')}`);
}