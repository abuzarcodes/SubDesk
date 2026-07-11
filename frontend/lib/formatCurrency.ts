export function formatINR(amount: number) {
  if (amount % 1 === 0) {
    return `₹${amount}`;
  }
  return `₹${amount.toFixed(2)}`;
}
