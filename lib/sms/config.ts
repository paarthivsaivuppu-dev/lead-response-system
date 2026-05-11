export function getSmsSafetyConfig() {
  return {
    businessSmsAlertsEnabled:
      process.env.BUSINESS_SMS_ALERTS_ENABLED === "true",
    customerSmsAutoReplyEnabled:
      process.env.CUSTOMER_SMS_AUTO_REPLY_ENABLED === "true",
    customerSmsTestMode: process.env.CUSTOMER_SMS_TEST_MODE === "true"
  };
}
