export const THRIVE4_TEST_ACCOUNT = "acct_1USt0pLVzsWcldA8";
export const THRIVE4_LIVE_ACCOUNT = "acct_1USt0hPqa21oiEVr";
export function stripeLiveMode() {
  return process.env.THRIVE4_STRIPE_MODE === "live";
}
export function stripeAccount(live = stripeLiveMode()) {
  return live ? THRIVE4_LIVE_ACCOUNT : THRIVE4_TEST_ACCOUNT;
}
export function checkoutLiveMode(id: string) {
  if (/^cs_live_[A-Za-z0-9]+$/.test(id)) return true;
  if (/^cs_test_[A-Za-z0-9]+$/.test(id)) return false;
  throw new Error("Invalid checkout reference.");
}
