import { authenticateToken } from '@/helpers/auth.helpers';
import { dbConnection } from '@/lib/dbConnection';
import logger from '@/logger';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: NextRequest) {
  dbConnection();
  const user = authenticateToken(request); // Ensure the user is authenticated via token
  
  // Extract sessionId from the incoming request body
  const { sessionId } = await request.json();

  try {
    // Retrieve the session using Stripe's Checkout session API
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if the payment status of the session is 'paid'
    if (session.payment_status === 'paid') {
  
      // Extract user ID (client_reference_id passed when creating the session)
      const userId = session.client_reference_id || user as string;
  
      if (userId) {
        return NextResponse.json({ session });
      } else {
        logger.warn('No client_reference_id found in session');
        return NextResponse.json({ error: 'Missing client_reference_id in session' }, { status: 400 });
      }
    } else {
      logger.error('Payment status is not paid');
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Error processing session:', error);
    return NextResponse.json({ error: error }, { status: 400 });
  }
}
