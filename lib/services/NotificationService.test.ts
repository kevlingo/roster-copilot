// Resend was unused
// import { Resend } from 'resend';

// Define the mock functions first
const mockResendEmailSend = jest.fn();

// Mock Resend
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: { send: mockResendEmailSend },
    })),
  };
});

// Import NotificationService AFTER top-level mocks are set up
import { NotificationService as GlobalNotificationService } from './NotificationService';

describe('NotificationService', () => {
  let serviceInstance: GlobalNotificationService; // For general tests
  const originalResendApiKey = process.env.RESEND_API_KEY;
  const originalDefaultFromEmail = process.env.DEFAULT_FROM_EMAIL;
  const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RESEND_API_KEY = 'test-key';
    process.env.DEFAULT_FROM_EMAIL = 'default-sender@example.com';
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
    serviceInstance = new GlobalNotificationService();
  });

  afterEach(() => {
    if (originalResendApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalResendApiKey;

    if (originalDefaultFromEmail === undefined) delete process.env.DEFAULT_FROM_EMAIL;
    else process.env.DEFAULT_FROM_EMAIL = originalDefaultFromEmail;

    if (originalBaseUrl === undefined) delete process.env.NEXT_PUBLIC_BASE_URL;
    else process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl;
  });

  describe('sendEmail', () => {
    // ... (sendEmail tests remain the same, using serviceInstance) ...
    it('should call resendClient.emails.send with correct parameters', async () => {
      mockResendEmailSend.mockResolvedValue({ data: { id: 'email-id' }, error: null });
      const options = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        from: 'sender@example.com',
      };
      await serviceInstance.sendEmail(options);
      expect(mockResendEmailSend).toHaveBeenCalledWith(options);
    });

    it('should use default from email from constructor if not provided in options', async () => {
      mockResendEmailSend.mockResolvedValue({ data: { id: 'email-id' }, error: null });
      const options = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };
      await serviceInstance.sendEmail(options);
      expect(mockResendEmailSend).toHaveBeenCalledWith({ ...options, from: 'default-sender@example.com' });
    });
    
    it('should use specific default from email if env var is set during instantiation', async () => {
        const specificFrom = 'specific-sender@customdomain.com';
        const originalFrom = process.env.DEFAULT_FROM_EMAIL;
        process.env.DEFAULT_FROM_EMAIL = specificFrom;

        // Create a new service instance with the updated env var
        const customServiceInstance = new GlobalNotificationService();

        mockResendEmailSend.mockResolvedValue({ data: { id: 'email-id' }, error: null });
        const options = {
            to: 'test@example.com',
            subject: 'Test Subject',
            html: '<p>Test HTML</p>',
        };
        await customServiceInstance.sendEmail(options);
        expect(mockResendEmailSend).toHaveBeenCalledWith({ ...options, from: specificFrom });

        // Restore original env var
        if (originalFrom === undefined) delete process.env.DEFAULT_FROM_EMAIL;
        else process.env.DEFAULT_FROM_EMAIL = originalFrom;
    });

    it('should return true on successful email send', async () => {
      mockResendEmailSend.mockResolvedValue({ data: { id: 'email-id' }, error: null });
      const result = await serviceInstance.sendEmail({ to: 't@e.c', subject: 's', html: 'h' });
      expect(result).toBe(true);
    });

    it('should return false if resend API returns an error', async () => {
      mockResendEmailSend.mockResolvedValue({ data: null, error: { message: 'API Error', name: 'api_error' } });
      const result = await serviceInstance.sendEmail({ to: 't@e.c', subject: 's', html: 'h' });
      expect(result).toBe(false);
    });

    it('should return false if resendClient.emails.send throws an error', async () => {
      mockResendEmailSend.mockRejectedValue(new Error('Network Error'));
      const result = await serviceInstance.sendEmail({ to: 't@e.c', subject: 's', html: 'h' });
      expect(result).toBe(false);
    });

    it('should return false if Resend client is not initialized (no API key)', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());

        const originalApiKey = process.env.RESEND_API_KEY;
        delete process.env.RESEND_API_KEY;

        // Create a new service instance without API key
        const serviceWithNoKey = new GlobalNotificationService();

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'RESEND_API_KEY is not set. Email notifications will not be sent.'
        );

        const result = await serviceWithNoKey.sendEmail({ to: 't@e.c', subject: 's', html: 'h' });

        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Resend client is not initialized. Cannot send email. RESEND_API_KEY might be missing during service instantiation.'
        );

        // Restore original API key
        if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
        else process.env.RESEND_API_KEY = originalApiKey;

        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });
  });

  describe('template processing methods', () => {
    describe('processTemplate', () => {
      it('should replace all template placeholders with provided data', () => {
        const template = 'Hello {{username}}, verify here: {{verificationUrl}}. Valid until {{currentYear}}. Support: {{supportUrl}} Privacy: {{privacyPolicyUrl}} Terms: {{termsOfServiceUrl}}';
        const templateData = {
          username: 'testUser',
          verificationUrl: 'http://localhost:3000/api/auth/verify-email/token123',
          currentYear: '2024',
          supportUrl: 'http://localhost:3000/support',
          privacyPolicyUrl: 'http://localhost:3000/privacy',
          termsOfServiceUrl: 'http://localhost:3000/terms',
        };

        // Access the private method using bracket notation for testing
        const result = (serviceInstance as unknown as { processTemplate: (template: string, data: unknown) => string }).processTemplate(template, templateData);

        const expected = 'Hello testUser, verify here: http://localhost:3000/api/auth/verify-email/token123. Valid until 2024. Support: http://localhost:3000/support Privacy: http://localhost:3000/privacy Terms: http://localhost:3000/terms';
        expect(result).toBe(expected);
      });

      it('should handle multiple occurrences of the same placeholder', () => {
        const template = 'Hello {{username}}, {{username}} is your name!';
        const templateData = {
          username: 'John',
          verificationUrl: '',
          currentYear: '',
          supportUrl: '',
          privacyPolicyUrl: '',
          termsOfServiceUrl: '',
        };

        const result = (serviceInstance as unknown as { processTemplate: (template: string, data: unknown) => string }).processTemplate(template, templateData);
        expect(result).toBe('Hello John, John is your name!');
      });
    });

    describe('createVerificationTemplateData', () => {
      it('should create template data with correct values', () => {
        const username = 'testUser';
        const token = 'verificationToken123';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        const result = (serviceInstance as unknown as { createVerificationTemplateData: (username: string, token: string) => unknown }).createVerificationTemplateData(username, token);

        expect(result).toEqual({
          username: 'testUser',
          verificationUrl: `${baseUrl}/api/auth/verify-email/verificationToken123`,
          currentYear: new Date().getFullYear().toString(),
          supportUrl: `${baseUrl}/support`,
          privacyPolicyUrl: `${baseUrl}/privacy`,
          termsOfServiceUrl: `${baseUrl}/terms`,
        });
      });

      it('should handle missing base URL gracefully', () => {
        const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        delete process.env.NEXT_PUBLIC_BASE_URL;

        const result = (serviceInstance as unknown as { createVerificationTemplateData: (username: string, token: string) => { verificationUrl: string, supportUrl: string } }).createVerificationTemplateData('user', 'token');

        expect(result.verificationUrl).toBe('/api/auth/verify-email/token');
        expect(result.supportUrl).toBe('/support');

        // Restore original value
        if (originalBaseUrl) process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl;
      });
    });
  });

  describe('sendVerificationEmail', () => {
    let sendEmailSpy: jest.SpyInstance;
    let readTemplateSpy: jest.SpyInstance;

    beforeEach(() => {
      sendEmailSpy = jest.spyOn(serviceInstance, 'sendEmail').mockResolvedValue(true);
      readTemplateSpy = jest.spyOn(serviceInstance as unknown as { readTemplate: (templatePath: string) => Promise<string> }, 'readTemplate');
    });

    afterEach(() => {
      sendEmailSpy.mockRestore();
      readTemplateSpy.mockRestore();
    });

    it('should process template and call sendEmail with correct parameters', async () => {
      const mockTemplate = 'Hello {{username}}, verify: {{verificationUrl}}';
      readTemplateSpy.mockResolvedValue(mockTemplate);

      const email = 'test@example.com';
      const username = 'testUser';
      const token = 'token123';
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

      await serviceInstance.sendVerificationEmail(email, username, token);

      expect(readTemplateSpy).toHaveBeenCalledWith(expect.stringContaining('verification-email.html'));

      const expectedHtml = `Hello testUser, verify: ${baseUrl}/api/auth/verify-email/token123`;
      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: email,
        subject: 'Verify Your Roster Copilot Account',
        html: expectedHtml,
      });
    });

    it('should use fallback HTML when template reading fails', async () => {
      readTemplateSpy.mockRejectedValue(new Error('File not found'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());

      const email = 'test@example.com';
      const username = 'testUser';
      const token = 'token123';
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

      await serviceInstance.sendVerificationEmail(email, username, token);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error reading or processing email template'),
        expect.any(Error)
      );

      const expectedFallbackHtml = `<p>Welcome to Roster Copilot! Please verify your email by clicking this link: ${baseUrl}/api/auth/verify-email/token123 This link will expire in 24 hours.</p>`;
      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: email,
        subject: 'Verify Your Roster Copilot Account',
        html: expectedFallbackHtml,
      });

      consoleErrorSpy.mockRestore();
    });
  });
});