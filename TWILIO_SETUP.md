# Twilio SMS Integration Guide

## Overview
The application now supports sending OTP via SMS using Twilio. If Twilio is not configured, the system will fall back to console logging (development mode).

## Setup Instructions

### 1. Create Twilio Account
1. Go to [https://www.twilio.com](https://www.twilio.com)
2. Sign up for a free account (includes $15.50 free credit)
3. Verify your email and phone number

### 2. Get Twilio Credentials
1. Log in to [Twilio Console](https://console.twilio.com)
2. Go to **Account** → **API Keys & Tokens**
3. Copy your:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click "View" to reveal)

### 3. Get Twilio Phone Number
1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Select a phone number (choose a country/region)
3. Complete the purchase (free trial accounts get a number for free)
4. Copy the phone number (format: `+1234567890`)

### 4. Configure Backend
1. Open `backend/config.env`
2. Add your Twilio credentials:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### 5. Install Dependencies
```bash
cd backend
npm install
```

The `twilio` package will be installed automatically.

### 6. Restart Backend Server
```bash
npm start
```

You should see:
```
✅ Twilio SMS service configured successfully
```

## Usage

### Forgot Password Flow
1. User clicks "Forgot Password" on login page
2. User enters email OR phone number
3. If phone number is provided:
   - System sends OTP via SMS (if Twilio configured)
   - User receives SMS with 6-digit OTP
4. If email is provided or SMS fails:
   - OTP is logged to console (development mode)
   - OTP is returned in API response (development only)

### Phone Number Format
- **Required Format**: E.164 format
- **Example**: `+1234567890` (country code + number)
- **India**: `+919876543210`
- **US**: `+11234567890`

The system will attempt to auto-format phone numbers, but it's recommended to use E.164 format.

## Testing

### Without Twilio (Development Mode)
1. Don't add Twilio credentials to `config.env`
2. OTP will be logged to console
3. Check backend terminal for OTP

### With Twilio (Production Mode)
1. Add Twilio credentials to `config.env`
2. Restart backend server
3. Use forgot password with phone number
4. Check your phone for SMS with OTP

## Troubleshooting

### SMS Not Sending
1. **Check Twilio Console**: Verify account is active
2. **Verify Credentials**: Double-check Account SID, Auth Token, and Phone Number
3. **Check Phone Format**: Ensure phone number is in E.164 format (`+1234567890`)
4. **Check Twilio Logs**: Go to Twilio Console → Monitor → Logs
5. **Check Backend Logs**: Look for error messages in terminal

### Common Errors

**Error: "Phone number must be in E.164 format"**
- Solution: Format phone as `+[country code][number]`
- Example: `+919876543210` (India), `+11234567890` (US)

**Error: "Twilio SMS error: Unable to create record"**
- Solution: Check Twilio account balance and phone number status

**Error: "SMS sending failed"**
- Solution: System falls back to console logging. Check backend terminal for OTP.

## Cost Information

### Twilio Pricing
- **Free Trial**: $15.50 free credit
- **SMS Cost**: ~$0.0075 per SMS (varies by country)
- **1000 SMS**: ~$7.50

### Cost Optimization
- Use Twilio only in production
- Keep development mode (console logging) for testing
- Monitor usage in Twilio Console

## Alternative SMS Providers

If you want to use a different SMS provider:

1. **AWS SNS**:
   - Update `backend/services/smsService.js`
   - Use AWS SDK instead of Twilio

2. **MessageBird**:
   - Similar integration pattern
   - Update SMS service file

3. **Vonage (Nexmo)**:
   - Another popular option
   - Update SMS service file

## Security Notes

1. **Never commit** `config.env` to Git
2. **Rotate credentials** regularly
3. **Monitor usage** for suspicious activity
4. **Rate limit** OTP requests to prevent abuse
5. **Set expiration** for OTPs (currently 10 minutes)

## Support

- **Twilio Docs**: [https://www.twilio.com/docs](https://www.twilio.com/docs)
- **Twilio Support**: [https://support.twilio.com](https://support.twilio.com)
- **API Reference**: [https://www.twilio.com/docs/sms](https://www.twilio.com/docs/sms)

