export default () => ({
  gateway: process.env.PAYMENT_GATEWAY || 'stripe',
  apiKey: process.env.PAYMENT_GATEWAY_API_KEY,
  apiSecret: process.env.PAYMENT_GATEWAY_SECRET,
  webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET,
  currency: process.env.PAYMENT_CURRENCY || 'USD',
});
