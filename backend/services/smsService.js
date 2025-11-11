/**
 * SMS Service for sending OTP via Twilio
 * Falls back to console.log if Twilio is not configured or not installed
 */

let twilio = null;
try {
  twilio = require('twilio');
} catch (error) {
  console.warn('⚠️  Twilio package not installed. Run: npm install twilio');
}

class SMSService {
  constructor() {
    this.client = null;
    this.fromNumber = null;
    this.isConfigured = false;

    // Check if Twilio package is available
    if (!twilio) {
      console.warn('⚠️  Twilio package not installed. SMS will be logged to console.');
      return;
    }

    // Initialize Twilio client if credentials are available
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    ) {
      try {
        this.client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
        this.isConfigured = true;
        console.log('✅ Twilio SMS service configured successfully');
      } catch (error) {
        console.error('❌ Twilio initialization error:', error);
        this.isConfigured = false;
      }
    } else {
      console.warn('⚠️  Twilio credentials not found. SMS will be logged to console in development mode.');
    }
  }

  /**
   * Send OTP via SMS
   * @param {string} phoneNumber - Recipient phone number (E.164 format: +1234567890)
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise<Object>} - Success/error response
   */
  async sendOTP(phoneNumber, otp) {
    // Validate phone number format (should be E.164 format)
    if (!phoneNumber || !phoneNumber.startsWith('+')) {
      throw new Error('Phone number must be in E.164 format (e.g., +1234567890)');
    }

    // If Twilio is configured, send actual SMS
    if (this.isConfigured && this.client) {
      try {
        const message = await this.client.messages.create({
          body: `Your WorkAble password reset OTP is: ${otp}. This code expires in 10 minutes. Do not share this code with anyone.`,
          from: this.fromNumber,
          to: phoneNumber
        });

        console.log(`✅ SMS sent successfully to ${phoneNumber}. SID: ${message.sid}`);
        return {
          success: true,
          messageSid: message.sid,
          status: message.status
        };
      } catch (error) {
        console.error('❌ Twilio SMS error:', error);
        // Fallback to console log if SMS fails
        console.log(`📱 [FALLBACK] OTP for ${phoneNumber}: ${otp} (expires in 10 minutes)`);
        return {
          success: false,
          error: error.message,
          fallback: true
        };
      }
    } else {
      // Development mode: log to console
      console.log(`📱 [DEV MODE] OTP SMS for ${phoneNumber}: ${otp} (expires in 10 minutes)`);
      console.log(`   To enable SMS, add Twilio credentials to config.env:`);
      console.log(`   TWILIO_ACCOUNT_SID=your_account_sid`);
      console.log(`   TWILIO_AUTH_TOKEN=your_auth_token`);
      console.log(`   TWILIO_PHONE_NUMBER=+1234567890`);
      
      return {
        success: true,
        fallback: true,
        message: 'OTP logged to console (Twilio not configured)'
      };
    }
  }

  /**
   * Send custom SMS message
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - Message text
   * @returns {Promise<Object>} - Success/error response
   */
  async sendMessage(phoneNumber, message) {
    if (!phoneNumber || !phoneNumber.startsWith('+')) {
      throw new Error('Phone number must be in E.164 format (e.g., +1234567890)');
    }

    if (this.isConfigured && this.client) {
      try {
        const result = await this.client.messages.create({
          body: message,
          from: this.fromNumber,
          to: phoneNumber
        });

        return {
          success: true,
          messageSid: result.sid,
          status: result.status
        };
      } catch (error) {
        console.error('Twilio SMS error:', error);
        throw error;
      }
    } else {
      console.log(`[DEV MODE] SMS to ${phoneNumber}: ${message}`);
      return {
        success: true,
        fallback: true
      };
    }
  }

  /**
   * Verify phone number format
   * @param {string} phoneNumber - Phone number to verify
   * @returns {boolean} - True if valid E.164 format
   */
  isValidPhoneNumber(phoneNumber) {
    // E.164 format: + followed by 1-15 digits
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Format phone number to E.164 (basic formatting)
   * @param {string} phoneNumber - Phone number to format
   * @returns {string} - Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // If doesn't start with +, add it
    if (!cleaned.startsWith('+')) {
      // Assume country code if not present (you may want to customize this)
      cleaned = '+1' + cleaned; // Default to US (+1)
    }
    
    return cleaned;
  }
}

// Export singleton instance
module.exports = new SMSService();

