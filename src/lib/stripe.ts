import Stripe from 'stripe';

const globalForStripe = globalThis as unknown as { stripe: Stripe };

const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_build';

export const stripe =
  globalForStripe.stripe ??
  new Stripe(apiKey, {
    typescript: true,
  });

if (process.env.NODE_ENV !== 'production') globalForStripe.stripe = stripe;
