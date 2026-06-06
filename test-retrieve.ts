import { getDodoClient } from './lib/dodo';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  try {
    const payment = await getDodoClient().payments.retrieve('pay_0NgTEKkDu6wMijc0KObEH');
    console.log("Payment status:", payment.status);
    console.log("Payment metadata:", payment.metadata);
  } catch (e) {
    console.error("Error retrieving payment:", e);
  }
}

main();
