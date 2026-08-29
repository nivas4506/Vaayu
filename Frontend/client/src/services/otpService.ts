export const verifyDemoOtp = (entered: string) => /^\d{6}$/.test(entered.trim());
