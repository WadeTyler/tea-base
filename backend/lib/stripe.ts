import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe_secret_key = process.env.STRIPE_SECRET_KEY;

if (!stripe_secret_key) {
  throw new Error('No STRIPE_SECRET_KEY provided');
}

const stripe = new Stripe(stripe_secret_key);

export default stripe;