import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

export const USSDDemo: React.FC = () => {
  // Generate random session and phone number for each new session
  const generateRandomPhone = () => {
    const random = Math.floor(100000000 + Math.random() * 900000000);
    return `080${random}`;
  };

  const [sessionId] = useState(`demo_${Date.now()}`);
  const [phoneNumber, setPhoneNumber] = useState(generateRandomPhone());
  const [ussdHistory, setUssdHistory] = useState<Array<{
    type: 'user' | 'system';
    text: string;
    timestamp: Date;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [lastInput, setLastInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasDialed, setHasDialed] = useState(false);
  // Track registration inputs to build correct sequence
  const [regStep, setRegStep] = useState<'idle' | 'reg1' | 'reg2' | 'reg3'>('idle');
  const [regName, setRegName] = useState('');
  const [regState, setRegState] = useState('');
  
  // Calculate API URL
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4001';
  const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
  const apiUrl = `${cleanBaseUrl}/api/mobile/ussd`;

  // Initialize with welcome message - only once on mount
  const [isInitialized, setIsInitialized] = useState(false);
  
  const handleDialUSSD = async () => {
    if (hasDialed) return;
    
    setHasDialed(true);
    setIsLoading(true);
    
    try {
      console.log('📡 Dialing USSD:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          phoneNumber,
          text: ''  // Empty text for initial dial
        })
      });
      
      const responseText = await response.text();
      console.log('📥 Initial response:', responseText.substring(0, 200));
      
      setUssdHistory([{
        type: 'system',
        text: responseText,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('USSD Dial Error:', error);
      setUssdHistory([{
        type: 'system',
        text: 'END Error connecting to backend. Please ensure the backend is running.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ussdHistory]);

  const sendUSSDCommand = async (input: string) => {
    setIsLoading(true);
    
    // Build cumulative input
    let fullInput = '';

    console.log('🔍 Current regStep:', regStep, 'regName:', regName, 'regState:', regState);
    
    // If we're in registration flow, send ONLY the new input (backend uses input.slice(1) internally)
    if (regStep === 'reg1') {
      // Next input is full name - just send the name
      console.log('📝 Step 1: Setting name to:', input);
      setRegName(input);
      fullInput = `1*${input}`; // Include the '1' for menu selection
    } else if (regStep === 'reg2') {
      // Next input is state - just send the state
      console.log('📝 Step 2: Setting state to:', input, 'name:', regName);
      setRegState(input);
      fullInput = `1*${regName}*${input}`; // Include all previous
    } else if (regStep === 'reg3') {
      // Next input is town - just send the town
      console.log('📝 Step 3: Setting town to:', input, 'name:', regName, 'state:', regState);
      fullInput = `1*${regName}*${regState}*${input}`; // Include all previous
    } else {
      // For initial menu selection or other flows
      if (lastInput) {
        fullInput = `${lastInput}*${input}`;
      } else {
        fullInput = input;
      }
    }
    
    try {
      console.log('📡 USSD Request:', {
        sessionId,
        phoneNumber,
        input,
        lastInput,
        fullInput
      });
      
      // Call real backend API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          phoneNumber,
          text: fullInput
        })
      });
      
      const responseText = await response.text();
      const isEnd = responseText.startsWith('END');
      
      console.log('📥 Received:', responseText.substring(0, 200));
      
      // Detect and set registration steps based on server prompts
      if (!isEnd && responseText.includes('Registration - Step 1')) {
        console.log('🎯 Setting regStep to reg1');
        setRegStep('reg1');
        setLastInput('1');
      } else if (!isEnd && responseText.includes('Registration - Step 2')) {
        console.log('🎯 Setting regStep to reg2, regName:', regName || input);
        setRegStep('reg2');
        setLastInput(`1*${regName || input}`);
      } else if (!isEnd && responseText.includes('Registration - Step 3')) {
        console.log('🎯 Setting regStep to reg3, regState:', regState || input);
        setRegStep('reg3');
        setLastInput(`1*${regName}*${regState || input}`);
      } else if (isEnd) {
        setRegStep('idle');
        setRegName('');
        setRegState('');
      }

      // Add user input to history (if not empty)
      if (input.trim()) {
        setUssdHistory(prev => [...prev, {
          type: 'user',
          text: input,
          timestamp: new Date()
        }]);
      }
      
      // Add system response to history
      setUssdHistory(prev => [...prev, {
        type: 'system',
        text: responseText,
        timestamp: new Date()
      }]);
      
      // Clear input
      setInputText('');
      
      // Update last input after successful response - AFTER setting regStep
      if (isEnd) {
        // Reset everything if END
        setLastInput('');
        setRegStep('idle');
        setRegName('');
        setRegState('');
      } else if (regStep === 'idle') {
        setLastInput(fullInput);
      }
    } catch (error) {
      console.error('USSD Error:', error);
      setUssdHistory(prev => [...prev, {
        type: 'system',
        text: 'END Error connecting to backend. Please ensure the backend is running.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputText.trim()) {
      sendUSSDCommand(inputText.trim());
    }
  };

  const handleOptionClick = (option: string) => {
    sendUSSDCommand(option);
  };

  // Parse system message to extract menu options
  const getMenuOptions = (text: string): string[] => {
    if (!text.startsWith('CON')) return [];
    const lines = text.split('\n').filter(line => line.trim());
    const options: string[] = [];
    lines.forEach(line => {
      const match = line.match(/^(\d+)\./);
      if (match) {
        options.push(match[1]);
      }
    });
    return options;
  };

  const formatMessage = (text: string) => {
    if (text.startsWith('CON')) {
      const body = text.replace(/^CON\s*/, '');
      // Limit to 500 characters for phone screen
      return body.length > 500 ? body.substring(0, 500) + '...' : body;
    }
    if (text.startsWith('END')) {
      const body = text.replace(/^END\s*/, '');
      // Limit to 300 characters for phone screen
      return body.length > 300 ? body.substring(0, 300) + '...' : body;
    }
    return text.length > 500 ? text.substring(0, 500) + '...' : text;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📱 TrustBridge Africa - USSD Demo
          </h1>
          <p className="text-gray-400">
            Experience tokenization via USSD - No bank account needed!
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-500 rounded-lg">
            <span className="text-green-400 font-mono">*384#</span>
            <span className="ml-3 text-gray-300">Dial this code on any phone</span>
          </div>
        </div>

        {/* Phone Simulator */}
        <div className="bg-black rounded-[3rem] p-8 shadow-2xl border-4 border-gray-800">
          {/* Phone Screen */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2rem] p-6 h-[600px] flex flex-col">
          {/* Phone Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📱</span>
              <span className="text-white font-semibold">*384#</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 font-mono">{phoneNumber}</span>
              <button
                onClick={() => {
                  setPhoneNumber(generateRandomPhone());
                  setUssdHistory([]);
                  setLastInput('');
                  setHasDialed(false);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded bg-blue-500/10"
                title="New phone number"
              >
                🔄
              </button>
            </div>
          </div>

            {/* Phone Keypad - Show before first dial */}
            {!hasDialed && ussdHistory.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-center mb-6">
                  <p className="text-gray-400 text-sm mb-2">Enter USSD Code</p>
                  <div className="bg-gray-800 px-6 py-3 rounded-xl border border-gray-700">
                    <span className="text-white text-2xl font-mono">*384#</span>
                  </div>
                </div>
                <button
                  onClick={handleDialUSSD}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white px-12 py-4 rounded-2xl text-lg font-semibold transition-colors"
                >
                  {isLoading ? '📞 Dialing...' : '📞 Call'}
                </button>
              </div>
            )}

            {/* USSD Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {ussdHistory.map((msg, i) => (
                <div key={i}>
                  {/* User Message */}
                  {msg.type === 'user' && (
                    <div className="flex justify-end mb-2">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%]">
                        {msg.text}
                      </div>
                    </div>
                  )}

                  {/* System Message */}
                  {msg.type === 'system' && (
                    <div className="space-y-3">
                      {/* Message Text */}
                      <div className={`px-4 py-3 rounded-2xl ${
                        msg.text.startsWith('END') 
                          ? 'bg-green-600/20 border border-green-500 text-green-400' 
                          : 'bg-gray-700 text-white'
                      }`}>
                        <div className="whitespace-pre-wrap font-sans text-sm">
                          {formatMessage(msg.text)}
                        </div>
                      </div>
                      
                      {/* Show input prompt for text fields */}
                      {msg.text.includes('Enter your') && !msg.text.startsWith('END') && (
                        <div className="text-xs text-gray-400 px-4">
                          ↓ Type your answer below ↓
                        </div>
                      )}

                      {/* Menu Options */}
                      {getMenuOptions(msg.text).length > 0 && (
                        <div className="grid grid-cols-1 gap-2">
                          {getMenuOptions(msg.text).map((option, j) => (
                            <button
                              key={j}
                              onClick={() => handleOptionClick(option)}
                              disabled={isLoading}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-4 py-3 rounded-xl text-left transition-colors"
                            >
                              {msg.text.split('\n').find(line => line.startsWith(`${option}.`)) || `Option ${option}`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {isLoading && (
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  placeholder={isLoading ? "Processing..." : "Type your response..."}
                  className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => inputText.trim() && sendUSSDCommand(inputText.trim())}
                  disabled={isLoading || !inputText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Phone Footer */}
          <div className="mt-4 flex justify-center">
            <div className="w-32 h-1 bg-gray-800 rounded-full"></div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">✨ Features Demonstrated</h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-300">
            <div className="flex items-start space-x-2">
              <span className="text-green-400">✅</span>
              <div>
                <strong className="text-white">Bankless Access:</strong> Tokenize assets without a bank account
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-400">✅</span>
              <div>
                <strong className="text-white">Paga Integration:</strong> Cash payments via 87,000+ agents
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-400">✅</span>
              <div>
                <strong className="text-white">USSD Interface:</strong> Works on any phone (feature or smartphone)
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-400">✅</span>
              <div>
                <strong className="text-white">Hedera Blockchain:</strong> Transparent, immutable records
              </div>
            </div>
          </div>
        </div>

        {/* Try It Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            This simulator calls the real backend API.{' '}
            <span className="text-green-400 font-semibold">✅ Backend connected!</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Backend URL: <code className="bg-gray-800 px-2 py-1 rounded">{cleanBaseUrl}</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default USSDDemo;

