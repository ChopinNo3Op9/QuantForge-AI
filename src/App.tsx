import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Terminal, Loader2, MessageSquare, ChevronRight, X } from 'lucide-react';
import { ChatMessage } from './types';
import { cn } from './lib/utils';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { Dashboard } from './components/Dashboard';
import { simulateBacktest, BacktestResult, BacktestConfig } from './lib/backtestUtils';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatHovered, setIsChatHovered] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');

  const [backtestData, setBacktestData] = useState<BacktestResult | null>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const isChatOpen = isChatHovered || isInputFocused;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      sendMessage('START_CONVERSATION', true);
      handleRunBacktest({
        ticker: 'SPY',
        strategyName: 'Trend Following',
        dateRange: 'Last 5 Years',
        initialCapital: 100000,
        fastSma: 50,
        slowSma: 200
      });
    }
  }, []);

  const sendMessage = async (messageText: string, isInitial = false) => {
    if (!messageText.trim() && !isInitial) return;

    const userMsg: ChatMessage = { role: 'user', parts: [{ text: messageText }] };
    let newHistory = [...messages, userMsg];
    setMessages(newHistory);
    
    if (!isInitial) {
      setInput('');
    }

    setIsLoading(true);
    
    setMessages((prev) => [...prev, { role: 'model', parts: [{ text: '' }] }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          history: isInitial ? [] : messages,
          message: messageText 
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  setMessages((prev) => {
                    const next = [...prev];
                    const lastMsg = next[next.length - 1];
                    if (lastMsg && lastMsg.role === 'model') {
                      lastMsg.parts[0].text += parsed.text;
                    }
                    return next;
                  });
                }
              } catch (e) {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev, 
        { role: 'model', parts: [{ text: '⚠️ Error connecting to server. Please try again.' }] }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      sendMessage(input);
    }
  };

  const handleRunBacktest = (config: BacktestConfig) => {
    setIsBacktesting(true);
    setActiveTab('analysis'); // Force switch to analysis tab
    // Simulate loading time
    setTimeout(() => {
      const data = simulateBacktest(config);
      setBacktestData(data);
      setIsBacktesting(false);
    }, 800);
  };

  return (
    <div className="flex h-screen bg-[#0E1117] text-[#c9d1d9] font-sans antialiased overflow-hidden">
      
      {/* Left Sidebar settings */}
      <Sidebar onRunBacktest={handleRunBacktest} />

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 relative overflow-hidden",
        isChatOpen ? "mr-[400px]" : "mr-12"
      )}>
        <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'analysis' ? (
            isBacktesting ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="flex flex-col items-center space-y-4 text-[#8b949e]">
                  <Loader2 className="w-8 h-8 animate-spin text-[#00FFAA]" />
                  <p className="text-sm uppercase tracking-widest font-semibold">Running Simulation...</p>
                </div>
              </div>
            ) : backtestData ? (
              <Dashboard data={backtestData} />
            ) : null
          ) : (
            <div className="p-10 flex items-center justify-center h-full text-[#8b949e]">
              <div className="text-center">
                <FlaskConicalIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-semibold text-white mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h2>
                <p>This module is currently under development.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sliding Chat Panel */}
      <div 
        className={cn(
          "fixed right-0 top-0 bottom-0 bg-[#0d1117] border-l border-[#30363d] flex flex-col transition-all duration-300 z-50 shadow-2xl",
          isChatOpen ? "w-[400px]" : "w-12"
        )}
        onMouseEnter={() => setIsChatHovered(true)}
        onMouseLeave={() => setIsChatHovered(false)}
      >
        {/* Chat Toggle / Header */}
        <div className={cn(
          "flex-shrink-0 h-[60px] border-b border-[#30363d] flex items-center bg-[#161b22]",
          isChatOpen ? "px-4 justify-between" : "justify-center cursor-pointer"
        )}>
          {isChatOpen ? (
            <>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#00FFAA]/10 flex items-center justify-center mr-3 border border-[#00FFAA]/20">
                  <Terminal className="w-4 h-4 text-[#00FFAA]" />
                </div>
                <div>
                  <h2 className="font-bold text-white tracking-tight text-sm">QuantForge AI</h2>
                  <p className="text-[10px] text-[#00FFAA] uppercase tracking-wider font-semibold">Online</p>
                </div>
              </div>
              <button onClick={() => setIsInputFocused(false)} className="text-[#8b949e] hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="bg-[#1f6feb]/20 p-2 rounded-full">
              <MessageSquare className="w-4 h-4 text-[#58a6ff]" />
            </div>
          )}
        </div>

        {/* Chat Content */}
        <div className={cn(
          "flex-1 flex flex-col overflow-hidden transition-opacity duration-200",
          isChatOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          {/* Chat Messages */}
          <main className="flex-1 overflow-y-auto p-4 space-y-5">
            {messages.filter(msg => !(msg.role === 'user' && msg.parts[0].text === 'START_CONVERSATION')).map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex w-full",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[90%] rounded-xl p-4 shadow-sm relative",
                    msg.role === 'user' 
                      ? "bg-[#1f6feb] text-white rounded-br-none" 
                      : "bg-[#161b22] border border-[#30363d] text-[#c9d1d9] rounded-bl-none"
                  )}
                >
                  {msg.role === 'model' && (
                    <div className="flex items-center mb-3 border-b border-[#30363d] pb-2">
                      <Terminal className="w-3.5 h-3.5 text-[#00FFAA] mr-1.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e]">QuantForge</span>
                    </div>
                  )}
                  
                  <div className={cn(
                    "prose prose-invert max-w-none text-sm leading-relaxed break-words",
                    "prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-[#30363d] prose-pre:p-3 prose-pre:my-3 prose-pre:rounded-lg",
                    "prose-code:text-[#00FFAA] prose-code:bg-[#0d1117] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none",
                    "prose-a:text-[#58a6ff] hover:prose-a:text-[#79c0ff]",
                    "prose-headings:text-white prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2",
                    "prose-h3:text-sm prose-h3:uppercase prose-h3:tracking-wider prose-h3:text-[#8b949e]",
                    "prose-p:my-2",
                    "prose-ul:my-2 prose-ol:my-2",
                    "prose-table:border-collapse prose-table:w-full prose-table:my-3",
                    "prose-th:border prose-th:border-[#30363d] prose-th:p-2 prose-th:bg-[#0d1117] prose-th:text-left prose-th:text-[#c9d1d9]",
                    "prose-td:border prose-td:border-[#30363d] prose-td:p-2 prose-td:text-[#8b949e]"
                  )}>
                    {msg.parts[0].text ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.parts[0].text}
                      </ReactMarkdown>
                    ) : (
                      <div className="flex items-center space-x-2 text-[#8b949e]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs font-medium uppercase tracking-widest">Computing...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </main>

          {/* Quick Actions (Mock) */}
          <div className="px-4 pb-2 space-y-2">
             <div className="flex flex-wrap gap-2">
                <button onClick={() => setInput("Explain this drawdown")} className="text-[10px] bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff] text-[#8b949e] px-2 py-1 rounded transition-colors uppercase tracking-wider">Explain Drawdown</button>
                <button onClick={() => setInput("Optimize parameters")} className="text-[10px] bg-[#161b22] border border-[#30363d] hover:border-[#00FFAA] text-[#8b949e] px-2 py-1 rounded transition-colors uppercase tracking-wider">Optimize</button>
             </div>
          </div>

          {/* Input Area */}
          <footer className="flex-shrink-0 bg-[#0d1117] border-t border-[#30363d] p-4">
            <form onSubmit={handleSubmit} className="relative flex items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => {
                  // Small delay to allow button clicks to register before panel closes
                  setTimeout(() => setIsInputFocused(false), 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask QuantForge..."
                className="w-full bg-[#161b22] border border-[#30363d] text-white rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-[#58a6ff] focus:border-[#58a6ff] resize-none overflow-hidden min-h-[48px] max-h-32 text-sm shadow-inner transition-all font-mono"
                rows={1}
                style={{
                  height: 'auto',
                }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 bottom-2 p-1.5 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </footer>
        </div>
      </div>
    </div>
  );
}

function FlaskConicalIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a2 2 0 0 0 1.79 2.95h11.98a2 2 0 0 0 1.79-2.95l-5.068-10.127A2 2 0 0 1 15 9.527V2" />
      <path d="M8.5 2h7" />
      <path d="M14 16H9" />
    </svg>
  )
}

