import { useState, useEffect, useRef, useCallback } from 'react';

export function useEstimatorSocket(currentConfig) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'bot',
      message: '👋 Welcome to ConstructAI Real-Time Cost Estimator! Ask me anything about building material pricing, labor rates, or custom 3D house estimations.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calculation: null
    }
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef(null);
  const configRef = useRef(currentConfig);

  useEffect(() => {
    configRef.current = currentConfig;
  }, [currentConfig]);

  useEffect(() => {
    // Determine WS protocol based on window location
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//127.0.0.1:8000/ws/estimator/`;

    let socket = null;

    try {
      socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        console.log('⚡ Connected to ConstructAI Django Channels WebSocket');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.sender === 'bot') {
            setIsTyping(false);
            setMessages((prev) => [
              ...prev,
              {
                id: `msg-${Date.now()}-${Math.random()}`,
                sender: 'bot',
                message: data.message,
                calculation: data.calculation || null,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          }
        } catch (err) {
          console.error('WebSocket message parse error:', err);
          setIsTyping(false);
        }
      };

      socket.onerror = (error) => {
        console.warn('WebSocket error, switching to HTTP API fallback mode:', error);
        setIsConnected(false);
      };

      socket.onclose = () => {
        setIsConnected(false);
      };
    } catch (e) {
      console.warn('Could not initialize WebSocket, fallback mode active:', e);
      setIsConnected(false);
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim()) return;

    const userMsgObj = {
      id: `user-${Date.now()}`,
      sender: 'user',
      message: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setIsTyping(true);

    const payload = {
      message: userText,
      config: configRef.current
    };

    // If WebSocket connected, send via WS
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    } else {
      // HTTP API Fallback
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/chat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          const resData = await response.json();
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              sender: 'bot',
              message: resData.message,
              calculation: resData.calculation || null,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } else {
          throw new Error('HTTP fallback failed');
        }
      } catch (err) {
        setIsTyping(false);
        // Client-side simulation fallback if backend server isn't running yet
        const simulatedSqft = configRef.current?.sqft || 2200;
        const simulatedFloors = configRef.current?.floors || 2;
        const simulatedStyle = configRef.current?.style || 'MODERN';
        const simulatedTotal = Math.round(simulatedSqft * (simulatedStyle === 'LUXURY' ? 240 : 185));

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-sim-${Date.now()}`,
            sender: 'bot',
            message: `🤖 **ConstructAI Estimator (Local Engine)**\n\nFor a **${simulatedSqft.toLocaleString()} sq ft** (${simulatedFloors}-story, ${simulatedStyle.toLowerCase()}) home:\n\n• **Estimated Total:** **$${simulatedTotal.toLocaleString()}** (~$${Math.round(simulatedTotal/simulatedSqft)}/sq ft)\n• **Raw Materials:** $${Math.round(simulatedTotal * 0.52).toLocaleString()}\n• **Skilled Labor:** $${Math.round(simulatedTotal * 0.40).toLocaleString()}\n• **Contingency Fund:** $${Math.round(simulatedTotal * 0.08).toLocaleString()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }
  }, []);

  return {
    messages,
    sendMessage,
    isConnected,
    isTyping
  };
}
