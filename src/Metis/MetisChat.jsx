import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Send, Sparkles, Brain, Cpu, MessageSquare, 
  Terminal, ShieldAlert, Check, RefreshCw, Settings, Eye, EyeOff, History, Plus, ChevronDown, Trash2
} from 'lucide-react'
import { NoteService } from '../services/NoteService'
import { AiService } from '../services/AiService'
import { ChatHistoryService } from '../services/ChatHistoryService'

const MarkdownRenderer = ({ text, isDark }) => {
  if (!text) return null

  const lines = text.split('\n')
  const renderedElements = []
  let currentTable = null
  let currentList = null
  let currentListType = null // 'ul' or 'ol'

  const parseInline = (str) => {
    // Basic escape for simple markup
    let result = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Parse Bold **text**
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Parse Inline Code `code`
    result = result.replace(/\`(.*?)\`/g, `<code class="px-1.5 py-0.5 rounded font-mono text-[11px] ${
      isDark ? 'bg-white/10 text-blue-300' : 'bg-black/5 text-blue-600'
    }">$1</code>`)

    return <span dangerouslySetInnerHTML={{ __html: result }} />
  }

  const flushList = () => {
    if (currentList) {
      const Tag = currentListType === 'ul' ? 'ul' : 'ol'
      const className = currentListType === 'ul' ? 'list-disc pl-5 my-2 space-y-1' : 'list-decimal pl-5 my-2 space-y-1'
      renderedElements.push(
        <Tag key={`list-${renderedElements.length}`} className={className}>
          {currentList.map((item, idx) => (
            <li key={idx} className={`text-[13px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {parseInline(item)}
            </li>
          ))}
        </Tag>
      )
      currentList = null
      currentListType = null
    }
  }

  const flushTable = () => {
    if (currentTable) {
      // Header is row 0, separators are row 1 (ignore), data is row 2+
      const headers = currentTable[0].split('|').map(s => s.trim()).filter(s => s !== '')
      const rows = currentTable.slice(2).map(row => 
        row.split('|').map(s => s.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      )

      renderedElements.push(
        <div key={`table-${renderedElements.length}`} className={`my-4 overflow-x-auto rounded-xl border shadow-lg ${
          isDark ? 'border-white/10' : 'border-slate-200 bg-white'
        }`}>
          <table className="min-w-full divide-y divide-slate-500/10 text-[12px] font-semibold">
            <thead className={isDark ? 'bg-white/5' : 'bg-slate-50'}>
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx} className={`px-4 py-2.5 text-left font-black uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {parseInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className={isDark ? 'hover:bg-white/5 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className={`px-4 py-2.5 font-medium leading-relaxed max-w-xs break-words ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      currentTable = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // 1. Table Detector
    if (trimmed.startsWith('|')) {
      flushList()
      if (!currentTable) currentTable = []
      currentTable.push(line)
      continue
    } else {
      flushTable()
    }

    // 2. List Detectors
    const ulMatch = line.match(/^(\s*)[*\-•]\s+(.*)/)
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)/)

    if (ulMatch) {
      if (currentListType !== 'ul') {
        flushList()
        currentList = []
        currentListType = 'ul'
      }
      currentList.push(ulMatch[2])
      continue
    } else if (olMatch) {
      if (currentListType !== 'ol') {
        flushList()
        currentList = []
        currentListType = 'ol'
      }
      currentList.push(olMatch[2])
      continue
    } else {
      flushList()
    }

    // 3. Headings
    if (trimmed.startsWith('#### ')) {
      renderedElements.push(
        <h5 key={i} className={`text-[11px] font-black uppercase tracking-widest mt-4 mb-2 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {parseInline(trimmed.substring(5))}
        </h5>
      )
      continue
    }
    if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h4 key={i} className={`text-sm font-black tracking-tight mt-4 mb-2 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {parseInline(trimmed.substring(4))}
        </h4>
      )
      continue
    }
    if (trimmed.startsWith('## ')) {
      renderedElements.push(
        <h3 key={i} className={`text-base font-black tracking-tight mt-5 mb-2 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {parseInline(trimmed.substring(3))}
        </h3>
      )
      continue
    }

    // 4. Horizontal Rule
    if (trimmed === '---') {
      renderedElements.push(<hr key={i} className={`my-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`} />)
      continue
    }

    // 5. Standard Paragraphs
    if (trimmed !== '') {
      renderedElements.push(
        <p key={i} className={`text-[13px] font-medium leading-relaxed mb-2.5 ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          {parseInline(line)}
        </p>
      )
    } else {
      renderedElements.push(<div key={i} className="h-2" />)
    }
  }

  flushList()
  flushTable()

  return <div className="space-y-1">{renderedElements}</div>
}

const StreamingMarkdownRenderer = ({ text, isDark, speed = 8, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    if (!text) {
      if (onComplete) onComplete()
      return
    }

    // Split by whitespace captures to preserve space and newlines exactly
    const fragments = text.split(/(\s+)/)
    let currentIdx = 0
    let currentText = ''

    const timer = setInterval(() => {
      if (currentIdx < fragments.length) {
        currentText += fragments[currentIdx]
        setDisplayedText(currentText)
        currentIdx++
      } else {
        clearInterval(timer)
        if (onComplete) onComplete()
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return <MarkdownRenderer text={displayedText} isDark={isDark} />
}

const MetisChat = ({ onClose, theme, activeWorkspace }) => {
  const isDark = theme === 'dark'
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'metis',
      text: "Greetings. I am METIS, the active cognitive layer of your Stratos architecture. Ask me to analyze notes, structure systems, or query your nodes.\n\n💡 *Tip: Click the gear icon above to configure your Gemini API Key or Local Ollama server!*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [workspaceNotes, setWorkspaceNotes] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState(null)
  const messagesEndRef = useRef(null)
  const [operationalMode, setOperationalMode] = useState('chat')
  const [showModeDropdown, setShowModeDropdown] = useState(false)

  const [activeConversationId, setActiveConversationId] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [historyItems, setHistoryItems] = useState([])
  const [limitError, setLimitError] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [chatSessionType, setChatSessionType] = useState(null) // null | 'persistent' | 'temporary'

  const handleToggleHistory = async () => {
    setShowSettings(false); // Close settings drawer
    if (!showHistory) {
      try {
        const list = await ChatHistoryService.listConversations(activeWorkspace?.id || 'default_ws');
        setHistoryItems(list || []);
      } catch (err) {
        console.error('Failed to load conversation history:', err);
      }
    }
    setShowHistory(!showHistory);
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setChatSessionType(null); // Reset session type so user gets the mode selector intro screen!
    setMessages([
      {
        id: 'welcome',
        sender: 'metis',
        text: "Greetings. I am METIS, the active cognitive layer of your Stratos architecture. Ask me to analyze notes, structure systems, or query your nodes.\n\n💡 *Tip: Click the gear icon above to configure your Gemini API Key or Local Ollama server!*",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setShowHistory(false);
    setLimitError(null);
  };

  const handleSelectConversation = async (convId) => {
    try {
      let item = historyItems.find(h => h.id === convId);
      if (!item) {
        // Fallback: reload list
        const list = await ChatHistoryService.listConversations(activeWorkspace?.id || 'default_ws');
        setHistoryItems(list || []);
        item = (list || []).find(h => h.id === convId);
      }
      
      if (item && item.messages_json) {
        const msgs = JSON.parse(item.messages_json);
        setMessages(msgs || []);
      } else {
        // Reset if empty
        setMessages([
          {
            id: 'welcome',
            sender: 'metis',
            text: "Greetings. I am METIS, the active cognitive layer of your Stratos architecture. Ask me to analyze notes, structure systems, or query your nodes.\n\n💡 *Tip: Click the gear icon above to configure your Gemini API Key or Local Ollama server!*",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
      setActiveConversationId(convId);
      setChatSessionType('persistent'); // Restored threads are persistent!
      setShowHistory(false);
      setLimitError(null);
    } catch (err) {
      console.error('Failed to load conversation from history:', err);
    }
  };

  // AI Configuration State
  const [config, setConfig] = useState({
    provider: 'gemini',
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    ollamaModel: 'gemma2'
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load configuration from local storage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('stratos_metis_config')
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        setConfig({
          provider: parsed.provider || 'gemini',
          apiKey: parsed.apiKey || import.meta.env.VITE_GEMINI_API_KEY || '',
          ollamaModel: parsed.ollamaModel || 'gemma2'
        })
      } catch (err) {
        console.error('Failed to parse Metis configuration:', err)
      }
    }
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Pre-load workspace knowledge to build real-time RAG context & pre-load conversations history list
  useEffect(() => {
    if (!activeWorkspace) return
    const fetchKnowledge = async () => {
      try {
        const { notes } = await NoteService.getWorkspaceData(activeWorkspace.id)
        setWorkspaceNotes(notes || [])
      } catch (err) {
        console.error('Metis failed to fetch active intelligence context:', err)
      }
    }
    const loadHistory = async () => {
      try {
        const list = await ChatHistoryService.listConversations(activeWorkspace.id);
        setHistoryItems(list || []);
      } catch (err) {
        console.error('Failed to pre-load history list:', err);
      }
    };
    fetchKnowledge()
    loadHistory()
    handleNewChat()
  }, [activeWorkspace])

  const handleSaveSettings = (e) => {
    e.preventDefault()
    localStorage.setItem('stratos_metis_config', JSON.stringify(config))
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
      setShowSettings(false)
    }, 1200)
  }

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim()) return

    // Limit check: block starting a new conversation if 3 already exist in workspace and persistent mode is active
    if (chatSessionType === 'persistent' && !activeConversationId && historyItems.length >= 3) {
      setLimitError("⚠️ Conversation Limit Reached: You can save a maximum of 3 conversation threads per workspace. Please open the history archive and delete an existing thread before starting a new chat.");
      return;
    }

    const userQuery = input
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const currentMessages = [...messages, userMsg]
    setMessages(currentMessages)
    setInput('')
    setIsTyping(true)

    // Generate or fetch thread id
    let targetConvId = activeConversationId
    let isNewThread = false
    if (!targetConvId) {
      targetConvId = `conv_${Date.now()}`
      isNewThread = true
      setActiveConversationId(targetConvId)
    }

    const generateTitle = (q) => {
      if (!q) return 'New Chat';
      const clean = q.replace(/[*#`_\[\]]/g, '').trim();
      const words = clean.split(/\s+/);
      if (words.length <= 5) return words.join(' ');
      return words.slice(0, 5).join(' ') + '...';
    };

    // Find existing title if present in historyItems
    const activeItem = historyItems.find(h => h.id === targetConvId);
    const threadTitle = activeItem ? activeItem.title : (isNewThread ? generateTitle(userQuery) : 'New Conversation');
    const wsName = activeWorkspace?.name || 'Default Workspace';
    const uId = activeWorkspace?.user_id || 1;

    // Helper to perform the atomic save
    const saveToHistory = async (msgsArray) => {
      if (chatSessionType === 'temporary') return; // Skip saving completely for ephemeral sessions!
      try {
        await ChatHistoryService.saveConversation({
          workspaceId: activeWorkspace?.id || 'default_ws',
          userId: uId,
          workspaceName: wsName,
          conversationId: targetConvId,
          title: threadTitle,
          messages: msgsArray
        });
        // Reload historyItems list quietly so the drawer is always up-to-date!
        const list = await ChatHistoryService.listConversations(activeWorkspace?.id || 'default_ws');
        setHistoryItems(list || []);
      } catch (saveErr) {
        console.error('Failed to save thread history:', saveErr);
      }
    };

    // Instantly sync the user message first
    saveToHistory(currentMessages);

    // Dynamic response length optimizer
    const queryLower = userQuery.toLowerCase()
    const isDetailed = queryLower.includes('detail') || 
                       queryLower.includes('explain') || 
                       queryLower.includes('expand') || 
                       queryLower.includes('deep') || 
                       queryLower.includes('elaborate') || 
                       queryLower.includes('guide') ||
                       queryLower.includes('full')

    const lengthInstruction = isDetailed 
      ? `The user has requested a DETAILED response. Deliver a comprehensive answer strictly between 250 and 350 words. Focus on granular execution details and actionable configurations.`
      : `The user has requested BRIEF/STANDARD info. Deliver a highly concise, scannable answer strictly between 150 and 250 words. Keep summaries light, focusing on high-level checklist steps.`

    // Compile Context-Aware prompt structure for METIS
    const notesSummary = workspaceNotes.map(n => `- Note [${n.title}]: ${n.content ? n.content.substring(0, 150) : 'Draft structure'}`).join('\n')
    const compiledPrompt = `You are METIS, the active cognitive layer of Stratos Command Center.
You are helping the user analyze notes, organize structures, map database schemas, and formulate development plans.

[ACTIVE WORKSPACE]
Workspace Name: "${activeWorkspace?.name || 'Default'}"

[WORKSPACE DATA context]
${notesSummary || 'There are currently no notes in this workspace.'}

[USER QUESTION]
${userQuery}

[RESPONSE LENGTH CONSTRAINT]
${lengthInstruction}

Please formulate a professional system engineering style response adhering to the RESPONSE LENGTH CONSTRAINT. Use tables, lists, or clean markdown headers where applicable. Keep instructions highly structural.`

    // Check if live AI connection parameters are configured
    const isConfigured = config.provider === 'gemini' ? !!config.apiKey : true

    if (!isConfigured) {
      // Graceful fallback to rich mock engine if settings are empty
      setTimeout(() => {
        let reply = ""
        const queryLower = userQuery.toLowerCase()
        if (queryLower.includes('notes') || queryLower.includes('list')) {
          reply = `Found ${workspaceNotes.length} notes in your workspace:\n` + workspaceNotes.map(n => `- **${n.title}**`).join('\n') + `\n\n*Note: To query specific details inside these notes, connect your Gemini API Key in the settings panel above.*`
        } else {
          reply = `I parsed your system request, but no live API Key or Local LLM server was found. \n\nTo make METIS fully operational with real generative capabilities, click the **Gear ⚙️ Icon** at the top of the chat panel and configure your credentials.`
        }
        const mockMsgId = `metis-${Date.now()}`
        const metisMsg = {
          id: mockMsgId,
          sender: 'metis',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        
        setStreamingMessageId(mockMsgId)
        const finalMsgs = [...currentMessages, metisMsg]
        setMessages(finalMsgs)
        setIsTyping(false)

        // Save AI Response to history atomically
        saveToHistory(finalMsgs);
      }, 1000)
      return
    }

    // Call live AiService for real-time generative capabilities
    try {
      const resultText = await AiService.generateResponse(compiledPrompt, config)
      const metisMsgId = `metis-${Date.now()}`
      const metisMsg = {
        id: metisMsgId,
        sender: 'metis',
        text: resultText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setStreamingMessageId(metisMsgId)
      const finalMsgs = [...currentMessages, metisMsg]
      setMessages(finalMsgs)

      // Save AI Response to history atomically
      saveToHistory(finalMsgs);
    } catch (err) {
      console.error(err)
      const errorMsg = {
        id: `error-${Date.now()}`,
        sender: 'metis',
        text: `⚠️ **METIS Core Connection Failure**\n\n${err.message || 'An unexpected server error occurred during inference. Verify network settings or local server operations.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      const finalMsgs = [...currentMessages, errorMsg]
      setMessages(finalMsgs)
      saveToHistory(finalMsgs);
    } finally {
      setIsTyping(false)
    }
  }

  const quickPrompts = [
    { label: "List Workspace Notes", query: "list notes" },
    { label: "Recommend Topology", query: "system recommendations" },
    { label: "Cognitive Status", query: "status of metis ai" }
  ]

  return (
    <div
      className={`h-full w-full flex flex-col border-l transition-colors duration-500 overflow-hidden relative ${
        isDark 
          ? 'bg-[#0F172A]/40 backdrop-blur-3xl border-white/10 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Premium Header */}
      <div className={`h-20 flex items-center justify-between px-6 border-b shrink-0 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-md animate-pulse"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Brain size={20} className="animate-[spin_12s_linear_infinite]" />
            </div>
            {/* Status dot */}
            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 rounded-full transition-colors duration-300 ${
              isDark ? 'border-[#0F172A]' : 'border-white'
            } ${
              (config.provider === 'gemini' && config.apiKey) || config.provider === 'ollama'
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-amber-500'
            }`}></div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {/* Dropdown Container */}
              <div className="relative">
                <button 
                  onClick={() => setShowModeDropdown(!showModeDropdown)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                    isDark 
                      ? 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title="Switch Metis Engine Mode"
                >
                  <span>{operationalMode === 'chat' ? 'Chat (Plan)' : 'Agent (Work)'}</span>
                  <ChevronDown size={11} className={`transition-transform duration-200 ${showModeDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showModeDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className={`absolute left-0 mt-2 w-48 rounded-xl border shadow-xl z-50 overflow-hidden ${
                        isDark 
                          ? 'bg-slate-950/95 backdrop-blur-md border-white/10 text-white' 
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="p-1 space-y-0.5">
                        <button
                          onClick={() => {
                            setOperationalMode('chat');
                            setShowModeDropdown(false);
                          }}
                          className={`w-full flex flex-col items-start text-left px-2.5 py-1.5 rounded-lg transition-all ${
                            operationalMode === 'chat'
                              ? 'bg-blue-600 text-white'
                              : isDark
                                ? 'hover:bg-white/5 text-slate-300'
                                : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="text-[9px] font-black uppercase tracking-wider">Chat (Plan)</span>
                          <span className={`text-[8px] mt-0.5 font-medium ${operationalMode === 'chat' ? 'text-white/80' : 'text-slate-500'}`}>
                            Cognitive planning & notes
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setOperationalMode('agent');
                            setShowModeDropdown(false);
                          }}
                          className={`w-full flex flex-col items-start text-left px-2.5 py-1.5 rounded-lg transition-all ${
                            operationalMode === 'agent'
                              ? 'bg-blue-600 text-white'
                              : isDark
                                ? 'hover:bg-white/5 text-slate-300'
                                : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="text-[9px] font-black uppercase tracking-wider">Agent (Work)</span>
                          <span className={`text-[8px] mt-0.5 font-medium ${operationalMode === 'agent' ? 'text-white/80' : 'text-slate-500'}`}>
                            Autonomous operations
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <span className="text-[8px] font-black tracking-widest bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded uppercase shrink-0">Core v1.2</span>
              {chatSessionType === 'persistent' && (
                <span className="text-[8px] font-black tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase shrink-0 flex items-center gap-1 shadow-sm">
                  <Check size={8} /> Saved
                </span>
              )}
              {chatSessionType === 'temporary' && (
                <span className="text-[8px] font-black tracking-widest bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase shrink-0 flex items-center gap-1 shadow-sm animate-pulse">
                  ⚡ Ghost
                </span>
              )}
              {chatSessionType === null && (
                <span className="text-[8px] font-black tracking-widest bg-slate-500/10 text-slate-500 px-1.5 py-0.5 rounded uppercase shrink-0">
                  Pending Mode
                </span>
              )}
            </div>
            <p className="text-[9px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">
              Architectural Cognitive Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* New Chat Trigger */}
          <button 
            onClick={handleNewChat}
            className={`p-2 rounded-full transition-all ${
              isDark 
                ? 'hover:bg-white/5 text-emerald-400 hover:text-white' 
                : 'hover:bg-slate-100 text-emerald-600 hover:text-emerald-700'
            }`}
            title="Start New Conversation"
          >
            <Plus size={18} />
          </button>

          {/* History Trigger */}
          <button 
            onClick={handleToggleHistory}
            className={`p-2 rounded-full transition-all ${
              showHistory 
                ? 'bg-blue-600 text-white' 
                : isDark 
                  ? 'hover:bg-white/5 text-slate-400 hover:text-white' 
                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
            title="Recall Past Conversations"
          >
            <History size={18} />
          </button>

          {/* Settings Trigger */}
          <button 
            onClick={() => { setShowHistory(false); setShowSettings(!showSettings); }}
            className={`p-2 rounded-full transition-all ${
              showSettings 
                ? 'bg-blue-600 text-white' 
                : isDark 
                  ? 'hover:bg-white/5 text-slate-400 hover:text-white' 
                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
            title="Configure AI Engine"
          >
            <Settings size={18} />
          </button>
          
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-all ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Settings Overlay Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.form 
            onSubmit={handleSaveSettings}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`px-6 py-5 border-b shrink-0 space-y-4 overflow-hidden ${
              isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-2 border-white/5">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Cpu size={12} /> ENGINE SPECIFICATIONS
              </h4>
              {saveSuccess && (
                <span className="text-[9px] font-black text-emerald-500 tracking-wider uppercase">
                  ✓ PARAMETERS LOCKED
                </span>
              )}
            </div>

            {/* Provider Switch */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cognitive Provider</label>
              <select
                value={config.provider}
                onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                className={`w-full text-xs font-semibold px-3 py-2 rounded-xl outline-none border ${
                  isDark 
                    ? 'bg-slate-900 border-white/5 text-white' 
                    : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                }`}
              >
                <option value="gemini">Google Gemini Pro API (Recommended)</option>
                <option value="ollama">Local SLM Engine (Ollama Desktop)</option>
              </select>
            </div>

            {/* Config Fields per Provider */}
            {config.provider === 'gemini' ? (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gemini API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="Enter your AIzaSy... key"
                    className={`w-full text-xs font-semibold pl-3 pr-10 py-2 rounded-xl outline-none border ${
                      isDark 
                        ? 'bg-slate-900 border-white/5 text-white' 
                        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Local Model Identifier</label>
                <input
                  type="text"
                  value={config.ollamaModel}
                  onChange={(e) => setConfig({ ...config, ollamaModel: e.target.value })}
                  placeholder="e.g. gemma2, llama3, mistral"
                  className={`w-full text-xs font-semibold px-3 py-2 rounded-xl outline-none border ${
                    isDark 
                      ? 'bg-slate-900 border-white/5 text-white' 
                      : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                  }`}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/10 transition-all hover:scale-[1.01]"
            >
              Lock Configuration
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Chat History Overlay Drawer */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`px-6 py-5 border-b shrink-0 space-y-4 overflow-hidden ${
              isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-2 border-white/5">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <History size={12} className="text-amber-500" /> COGNITIVE RECALL ARCHIVE
              </h4>
              <span className="text-[9px] font-black text-amber-500/70 tracking-wider uppercase">
                MAX 3 THREADS PER WORKSPACE
              </span>
            </div>

            {historyItems.length === 0 ? (
              <div className="text-xs text-slate-500 font-semibold py-4 text-center">
                No conversation threads saved yet for this workspace.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                {historyItems.map((item, idx) => (
                  <div 
                    key={item.id || idx} 
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      activeConversationId === item.id
                        ? isDark
                          ? 'bg-blue-600/10 border-blue-500 text-slate-200 shadow-md shadow-blue-500/5'
                          : 'bg-blue-50 border-blue-300 text-slate-800'
                        : isDark 
                          ? 'bg-slate-900/60 border-white/5 hover:border-amber-500/30' 
                          : 'bg-white border-slate-200 hover:border-amber-500/40 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9.5px] font-bold text-amber-500/80 uppercase tracking-wider">
                        Workspace: {item.workspace_name} (User ID: {item.user_id})
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[8.5px] text-slate-500 font-medium">
                          {item.updated_at}
                        </span>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirmDeleteId !== item.id) {
                              setConfirmDeleteId(item.id);
                              // Auto reset after 3 seconds
                              setTimeout(() => {
                                setConfirmDeleteId(prev => prev === item.id ? null : prev);
                              }, 3000);
                            } else {
                              // Perform actual delete
                              setConfirmDeleteId(null);
                              await ChatHistoryService.deleteConversation(item.id);
                              // Refresh list
                              const list = await ChatHistoryService.listConversations(activeWorkspace?.id || 'default_ws');
                              setHistoryItems(list || []);
                              // If deleting the active conversation, clear active messages
                              if (activeConversationId === item.id) {
                                handleNewChat();
                              }
                            }
                          }}
                          className={`p-1 rounded-md transition-all text-center flex items-center justify-center ${
                            confirmDeleteId === item.id 
                              ? 'text-red-500 bg-red-500/20 font-black text-[8.5px] px-1.5 py-0.5 border border-red-500/30 tracking-widest uppercase animate-pulse' 
                              : 'text-red-400 hover:text-red-600 hover:bg-red-500/10'
                          }`}
                          title={confirmDeleteId === item.id ? "Click again to confirm delete" : "Delete Conversation"}
                        >
                          {confirmDeleteId === item.id ? "DELETE?" : <Trash2 size={11} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5 leading-relaxed">
                      <div className="flex items-start gap-1.5">
                        <MessageSquare size={14} className="text-blue-400 shrink-0 mt-0.5" />
                        <p className={`${isDark ? 'text-slate-200' : 'text-slate-800'} font-black text-xs`}>
                          {item.title}
                        </p>
                      </div>
                    </div>
                    {/* Action button to load this conversation thread */}
                    <button
                      onClick={() => handleSelectConversation(item.id)}
                      className="mt-2.5 w-full text-[9px] font-black uppercase tracking-wider text-center py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Open Conversation Thread
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Limit Error Banner */}
      <AnimatePresence>
        {limitError && (
          <motion.div 
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className={`mx-6 mt-4 p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed transition-all ${
              isDark 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
                : 'bg-amber-50 border-amber-200 text-amber-800 shadow-sm'
            }`}
          >
            <ShieldAlert size={16} className="shrink-0 mt-0.5 text-amber-500" />
            <div className="flex-1 font-semibold">
              {limitError}
            </div>
            <button 
              type="button"
              onClick={() => setLimitError(null)}
              className="p-1 rounded hover:bg-amber-500/20 transition-all text-amber-500 shrink-0"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Operational Mode View Switch */}
      {operationalMode === 'chat' ? (
        chatSessionType === null ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 select-none text-center">
            {/* Pulsing Core Icon */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 w-24 h-24 rounded-full bg-blue-500/10 blur-xl animate-pulse"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Brain size={32} className="animate-[pulse_3s_infinite]" />
              </div>
            </div>

            {/* Hello Greeting Intro Text */}
            <div className="max-w-md space-y-3">
              <h2 className={`text-lg font-black tracking-wider uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                HELLO. I AM METIS.
              </h2>
              <p className={`text-xs leading-relaxed font-semibold px-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Greetings. I am METIS, the active cognitive layer of your Stratos architecture. Please select a cognitive session configuration below to proceed with your system queries.
              </p>
            </div>

            {/* Selection Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg px-4">
              <button
                onClick={() => {
                  if (historyItems.length >= 3) {
                    setLimitError("⚠️ Conversation Limit Reached: You can save a maximum of 3 persistent conversation threads per workspace. Please delete an existing thread from your Recall Archive to start a new persistent chat, or select a Temporary Chat instead.");
                    return;
                  }
                  setChatSessionType('persistent');
                  setMessages([
                    {
                      id: 'welcome',
                      sender: 'metis',
                      text: "Greetings. Persistent Cognitive Session active. Your query sequences will be synced across SQLite and browser archives.\n\n💡 *Tip: Click the gear icon above to configure your Gemini API Key or Local Ollama server!*",
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }}
                className={`p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between ${
                  isDark 
                    ? 'bg-white/5 border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] text-slate-300' 
                    : 'bg-white border-slate-200 hover:border-emerald-500/30 hover:bg-emerald-50/30 text-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Check size={14} />
                  </div>
                  <span className="text-[11px] font-black tracking-wider uppercase text-emerald-400">Persistent Chat</span>
                </div>
                <p className="text-[10px] leading-relaxed font-semibold text-slate-500">
                  Saves your conversation in history (up to 3 threads) with instant desktop & browser sync.
                </p>
              </button>

              <button
                onClick={() => {
                  setChatSessionType('temporary');
                  setLimitError(null);
                  setMessages([
                    {
                      id: 'welcome',
                      sender: 'metis',
                      text: "Greetings. Ephemeral Ghost Session active. All inference iterations are run in memory only. No database writes or traces are left behind.\n\n💡 *Tip: Click the gear icon above to configure your Gemini API Key or Local Ollama server!*",
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }}
                className={`p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between ${
                  isDark 
                    ? 'bg-white/5 border-white/5 hover:border-amber-500/30 hover:bg-amber-500/[0.02] text-slate-300' 
                    : 'bg-white border-slate-200 hover:border-amber-500/30 hover:bg-amber-50/30 text-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Sparkles size={14} />
                  </div>
                  <span className="text-[11px] font-black tracking-wider uppercase text-amber-400">Temporary Chat</span>
                </div>
                <p className="text-[10px] leading-relaxed font-semibold text-slate-500">
                  No database writes, no traces. Ideal for stateless questions, quick checks, or direct system tests.
                </p>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-600/10'
                    : msg.id.startsWith('error')
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400 rounded-bl-none'
                      : isDark 
                        ? 'bg-white/5 border border-white/5 text-slate-200 rounded-bl-none'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                }`}>
                  <div className="font-medium">
                    {msg.sender === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : msg.id === streamingMessageId ? (
                      <StreamingMarkdownRenderer 
                        text={msg.text} 
                        isDark={isDark} 
                        onComplete={() => setStreamingMessageId(null)} 
                      />
                    ) : (
                      <MarkdownRenderer text={msg.text} isDark={isDark} />
                    )}
                  </div>
                </div>
                <span className="text-[9px] text-slate-500 font-bold mt-1 tracking-wider uppercase">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 mr-auto bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <RefreshCw size={12} className="animate-spin text-blue-500" /> Metis is calculating...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className={`px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => { setInput(p.query); }}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase whitespace-nowrap transition-all border ${
                  isDark 
                    ? 'bg-white/5 border-white/5 hover:border-blue-500/30 hover:bg-white/10 text-slate-400 hover:text-white' 
                    : 'bg-slate-50 border-slate-200 hover:border-blue-500/30 hover:bg-slate-100 text-slate-600 hover:text-blue-600 shadow-sm'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <form 
            onSubmit={handleSend}
            className={`p-6 border-t flex items-center gap-3 ${isDark ? 'border-white/10' : 'border-slate-200 bg-slate-50/50'}`}
          >
            <div className="relative flex-1">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your system query here..."
                className={`w-full rounded-2xl pl-4 pr-12 py-3.5 text-sm font-semibold outline-none border transition-all ${
                  isDark 
                    ? 'bg-black/20 border-white/5 text-white placeholder:text-slate-600 focus:border-blue-500/50' 
                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 shadow-sm'
                }`}
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </>)
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 select-none overflow-y-auto no-scrollbar">
          <div className="relative flex items-center justify-center">
            {/* Pulsing Core and Radar scans */}
            <div className="absolute w-32 h-32 rounded-full border border-indigo-500/20 animate-ping"></div>
            <div className="absolute w-20 h-20 rounded-full border border-indigo-500/40 animate-[pulse_2s_infinite]"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
              <Cpu size={24} className="animate-pulse" />
            </div>
          </div>

          <div className="text-center max-w-sm space-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 animate-pulse">
              Metis Agent Workspace
            </h3>
            <p className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">
              Autonomous Operation Mode
            </p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed pt-2 font-medium px-4`}>
              Standby mode active. The autonomous architectural operator is initializing cognitive triggers. Manifest workflow agent operations will activate shortly.
            </p>
          </div>

          {/* Animated SCI-FI console logs */}
          <div className={`w-full max-w-md p-4 rounded-xl border font-mono text-[10px] space-y-1.5 ${
            isDark ? 'bg-black/60 border-white/5 text-indigo-300' : 'bg-slate-50 border-slate-200 text-indigo-600'
          }`}>
            <div className="flex items-center gap-2 border-b border-white/5 pb-1.5 mb-2 font-black uppercase tracking-widest text-[9px] text-slate-500">
              <Terminal size={10} /> SYSTEM TERMINAL LOG
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500 animate-pulse">●</span> <span>[METIS] Listening for workspace workspace_id signals...</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>[METIS] Pre-loading manifest node index mapping...</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>[AGENT] Thread pipeline active: status=READY</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-amber-500">
              <span>[WARN] Awaiting configuration parameters from Stratus user...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MetisChat
