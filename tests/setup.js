// Jest setup file
process.env.NODE_ENV = "test";

// Mock environment variables for testing
process.env.JWT_SECRET = "test-secret-key";
process.env.JWT_EXPIRES_IN = "1h";
process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = "test_token";
process.env.FACEBOOK_ACCESS_TOKEN = "test_facebook_token";
process.env.INSTAGRAM_ACCESS_TOKEN = "test_instagram_token";
process.env.META_PIXEL_ACCESS_TOKEN = "test_pixel_token";

// Global test timeout
jest.setTimeout(10000);

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
