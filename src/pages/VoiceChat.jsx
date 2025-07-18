import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/DashboardCard';
import Button from '../components/Button';
import Badge from '../components/Badge';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  ArrowLeft,
  MessageSquare,
  User,
  Bot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Web Speech API compatibility
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const VoiceChat = () => {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [conversation, setConversation] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voices, setVoices] = useState([]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const languages = [
    { code: 'hi', name: 'हिंदी (Hindi)', speechLang: 'hi-IN' },
    { code: 'ta', name: 'தமிழ் (Tamil)', speechLang: 'ta-IN' },
    { code: 'bn', name: 'বাংলা (Bengali)', speechLang: 'bn-IN' },
    { code: 'te', name: 'తెలుగు (Telugu)', speechLang: 'te-IN' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)', speechLang: 'gu-IN' },
    { code: 'mr', name: 'मराठी (Marathi)', speechLang: 'mr-IN' },
    { code: 'en', name: 'English', speechLang: 'en-IN' }
  ];

  const langName = code => languages.find(l => l.code === code)?.name || 'Unknown';

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isProcessing]);

  // Initialize Speech Synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = synthRef.current.getVoices();
        setVoices(availableVoices);
      };
      
      loadVoices();
      synthRef.current.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        synthRef.current.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCurrentTranscript(transcript);
      setIsRecording(false);
      processVoiceInput(transcript);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, [selectedLanguage]);

  // Text-to-Speech function
  const speakText = (text, language) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find appropriate voice for the language
    const langConfig = languages.find(l => l.code === language);
    const speechLang = langConfig?.speechLang || 'en-US';
    
    const voice = voices.find(v => 
      v.lang === speechLang || 
      v.lang.startsWith(language) || 
      v.lang.includes('IN')
    );
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = speechLang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synthRef.current.speak(utterance);
  };

  const startRecording = () => {
    if (!recognitionRef.current) return;
    setCurrentTranscript('');
    setIsRecording(true);
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
  };

  const processVoiceInput = async (text) => {
    setIsProcessing(true);
    setConversation(prev => [...prev, { 
      type: 'user', 
      message: text, 
      language: selectedLanguage, 
      timestamp: new Date() 
    }]);

    try {
      const res = await fetch('https://smartkisan.onrender.com/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          maxLength: 50, 
          language: selectedLanguage 
        })
      });
      
      const { reply } = await res.json();

      // Add AI response to conversation
      setConversation(prev => [...prev, {
        type: 'assistant',
        message: reply,
        language: selectedLanguage,
        timestamp: new Date(),
      }]);

      // Speak the response immediately
      speakText(reply, selectedLanguage);

    } catch (err) {
      console.error('Error contacting backend:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const playMessage = (message, language) => {
    speakText(message, language);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <header className="bg-white shadow sm:border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Voice Assistant</h1>
              <p className="text-sm text-gray-600">Multilingual Farming Advice</p>
            </div>
          </div>
          <Badge variant={conversation.length ? 'secondary' : 'default'}>
            {conversation.length ? 'Active Chat' : 'Ready to Help'}
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
        <Card title="Choose Your Language" subtitle="Select your question language" icon={MessageSquare}>
          <select
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
            className="block w-full rounded-md border bg-white px-3 py-2 text-sm"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </Card>

        <Card title="Conversation" subtitle={conversation.length ? `${conversation.length} messages` : 'Tap mic to start'}>
          <div ref={chatContainerRef} className="h-80 overflow-y-auto space-y-4">
            {conversation.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="mb-1">Start by tapping the mic</p>
                <p className="text-sm">Ask about crop diseases, weather, prices...</p>
              </div>
            ) : (
              conversation.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} px-4 py-3 rounded-2xl max-w-md`}>                  
                    <div className="flex items-start space-x-2">
                      {msg.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}                      
                      <div>
                        <p className="text-sm">{msg.message}</p>
                        <div className="flex items-center justify-between mt-1">                          
                          <p className="text-xs opacity-70">{langName(msg.language)}</p>
                          {msg.type === 'assistant' && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => playMessage(msg.message, msg.language)}
                              disabled={isPlaying}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl max-w-md">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      {[0,1,2].map(i => (
                        <span key={i} className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i*100}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </Card>

        <Card title="Voice Input" subtitle="Tap to speak or select a sample question" actions={[
          { label: 'Clear', onClick: () => setConversation([]) },
          ...(isPlaying ? [{ label: 'Stop Speaking', onClick: stopSpeaking }] : [])
        ]}>          
          <div className="text-center space-y-6">
            {currentTranscript && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-700">{currentTranscript}</p>
              </div>
            )}

            <div className="relative mx-auto w-max">
              <Button
                size="lg"
                className={`rounded-full shadow-2xl transform transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:scale-105'}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
              >
                {isRecording ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
              </Button>
              {isRecording && <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />}
            </div>

            <p className="font-semibold text-lg text-gray-800">
              {isRecording ? 'Listening...' : isPlaying ? 'Speaking...' : 'Tap to Speak'}
            </p>
            <p className="text-sm text-gray-600">
              {isRecording ? `Listening in ${langName(selectedLanguage)}` : `Ask in ${langName(selectedLanguage)}`}
            </p>

            {conversation.length === 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">Sample Questions</h3>
                {[
                  "मेरी फसल में कीड़े लग गए हैं, क्या करूं?",
                  "आज मौसम कैसा रहेगा?",
                  "बाजार में टमाटर का भाव क्या है?"
                ].map((q, i) => (
                  <Button key={i} variant="outline" className="justify-start w-full text-sm" onClick={() => processVoiceInput(q)}>
                    {q}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VoiceChat;
