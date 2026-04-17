/**
 * Helper to calculate expiration date based on billing cycle
 * @param {string} billingCycle - 'monthly' or 'yearly'
 * @returns {Date} Expiration date
 */
export function calculateExpiry(billingCycle) {
  const now = new Date();
  const expiry = new Date(now);

  if (billingCycle === "monthly") {
    expiry.setDate(expiry.getDate() + 30);
  } else if (billingCycle === "yearly") {
    expiry.setDate(expiry.getDate() + 365);
  }

  return expiry;
}
