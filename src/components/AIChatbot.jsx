import React, { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { sendMessageToGroq } from '../utils/groqClient'
import './AIChatbot.css'

const AIChatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for renewable energy learning. I can help you understand solar PV, wind power, hydropower, geothermal, and solar thermal technologies. What would you like to learn about?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const chatboxRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initial animation for chat button
    gsap.fromTo(buttonRef.current, 
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" }
    )
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true)
      gsap.fromTo(chatboxRef.current,
        { scale: 0, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
      )
    } else {
      gsap.to(chatboxRef.current,
        { scale: 0, opacity: 0, y: 50, duration: 0.3, ease: "power2.in",
          onComplete: () => setIsOpen(false)
        }
      )
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await sendMessageToGroq([...messages, userMessage])
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickQuestions = [
    "How do solar panels work?",
    "What is wind energy?",
    "Explain hydroelectric power",
    "Tell me about geothermal energy",
    "What is solar thermal?"
  ]

  const handleQuickQuestion = (question) => {
    setInput(question)
  }

  return (
    <div className="ai-chatbot">
      {/* Chat Toggle Button */}
      <button 
        ref={buttonRef}
        className="chat-toggle-button"
        onClick={toggleChat}
        aria-label="Open AI Assistant"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div ref={chatboxRef} className="chat-box">
          <div className="chat-header">
            <div className="chat-header-info">
              <span className="chat-icon">🤖</span>
              <div>
                <h4>AI Learning Assistant</h4>
                <p>Renewable Energy Expert</p>
              </div>
            </div>
            <button className="chat-close" onClick={toggleChat}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-avatar">
                  {message.role === 'assistant' ? '🤖' : '👤'}
                </div>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="quick-questions">
              <p>Quick questions to get started:</p>
              <div className="quick-buttons">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="quick-button"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="chat-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about renewable energy..."
              disabled={isLoading}
              rows={1}
            />
            <button 
              onClick={sendMessage} 
              disabled={!input.trim() || isLoading}
              className="send-button"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIChatbot