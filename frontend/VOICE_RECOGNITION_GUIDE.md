# Voice Recognition Guide

## Overview
This application includes voice recognition capabilities that allow users to navigate and control the interface using voice commands.

## Supported Browsers
- **Chrome** (Recommended) - Full support
- **Edge** - Full support  
- **Safari** - Full support
- **Firefox** - Limited support (may not work)

## Requirements
1. **HTTPS Connection**: Voice recognition requires a secure connection (HTTPS) or localhost
2. **Microphone Access**: Browser must have permission to access your microphone
3. **Modern Browser**: Use the latest version of a supported browser

## How to Enable Voice Recognition

### Step 1: Enable Voice Commands
1. Click on the Accessibility toolbar (top-right corner)
2. Find the "Voice Commands" section
3. Click the toggle button to turn it "ON"

### Step 2: Test Microphone
1. Click the "Test Microphone" button
2. Allow microphone access when prompted by your browser
3. You should see a success message: "Microphone access granted! ✅"

### Step 3: Start Listening
1. Click "Start Listening" to begin voice recognition
2. The button will turn red and show "Stop Listening"
3. Speak clearly into your microphone

## Available Voice Commands

| Command | Action | Description |
|---------|--------|-------------|
| "go home" | Navigate to home page | Takes you to the main page |
| "go resume" | Navigate to resume builder | Opens the resume creation tool |
| "increase font" | Increase font size | Makes text larger for better readability |
| "decrease font" | Decrease font size | Makes text smaller |
| "high contrast" | Toggle high contrast mode | Switches between normal and high contrast themes |
| "keyboard only" | Toggle keyboard-only mode | Enables keyboard-only navigation |

## Troubleshooting

### Voice Recognition Not Available
**Problem**: You see "⚠️ Voice Recognition Not Available"

**Solutions**:
1. **Check Browser**: Make sure you're using Chrome, Edge, or Safari
2. **Check Connection**: Ensure you're on HTTPS or localhost
3. **Update Browser**: Install the latest version of your browser

### Microphone Access Denied
**Problem**: "Microphone access denied" error

**Solutions**:
1. **Check Browser Settings**: Look for microphone permissions in your browser
2. **Allow Microphone**: Click "Allow" when prompted for microphone access
3. **Check System Settings**: Ensure your system allows microphone access
4. **Refresh Page**: Try refreshing the page after granting permissions

### No Speech Detected
**Problem**: "No speech detected" error

**Solutions**:
1. **Check Microphone**: Ensure your microphone is working and not muted
2. **Speak Clearly**: Speak slowly and clearly into the microphone
3. **Reduce Background Noise**: Minimize background noise
4. **Check Volume**: Ensure your microphone volume is adequate

### Network Error
**Problem**: "Network error" message

**Solutions**:
1. **Check Internet**: Ensure you have a stable internet connection
2. **Refresh Page**: Try refreshing the page
3. **Check Firewall**: Ensure your firewall isn't blocking the connection

## Tips for Best Results

1. **Clear Speech**: Speak clearly and at a normal pace
2. **Quiet Environment**: Minimize background noise
3. **Proper Distance**: Keep your mouth at a reasonable distance from the microphone
4. **Command Format**: Use the exact command phrases listed above
5. **Wait for Confirmation**: Wait for the "Heard:" message before giving commands

## Browser-Specific Instructions

### Chrome
1. Click the microphone icon in the address bar
2. Select "Allow" when prompted
3. Voice recognition should work immediately

### Edge
1. Click the microphone icon in the address bar
2. Select "Allow" when prompted
3. Voice recognition should work immediately

### Safari
1. Go to Safari > Preferences > Websites > Microphone
2. Ensure the site is set to "Allow"
3. Refresh the page and try again

## Development Notes

- Voice recognition uses the Web Speech API
- Debug information is logged to the console in development mode
- The system automatically stops listening after 30 seconds of inactivity
- Commands are processed in real-time as you speak

## Support

If you continue to experience issues:
1. Check the browser console for error messages
2. Try using a different browser
3. Ensure your microphone is working in other applications
4. Check if your system's speech recognition is working

## Privacy

- Voice recognition happens locally in your browser
- No voice data is sent to external servers
- Commands are processed in real-time and not stored
- Microphone access is only used when actively listening
