import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000';

export const useWebSocket = () => {
  const socketRef = useRef(null);

  console.log('🔄 Attempting to connect to:', SOCKET_URL);

  useEffect(() => {
    // Connect to WebSocket
    socketRef.current = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      console.log('✅ WebSocket connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('⚠️ WebSocket disconnected:', reason);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinDebate = (debateId) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('🔵 Joining debate room:', debateId);
      socketRef.current.emit('join_debate', { debate_id: debateId });
    } else {
      console.error('❌ Cannot join debate - socket not connected');
    }
  };

  const leaveDebate = (debateId) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('🔴 Leaving debate room:', debateId);
      socketRef.current.emit('leave_debate', { debate_id: debateId });
    }
  };

  const onNewDebate = (callback) => {
    if (socketRef.current) {
      console.log('👂 Listening for new debates');
      socketRef.current.on('new_debate', (data) => {
        console.log('📢 New debate event received:', data);
        callback(data);
      });
    }
  };

  const onVoteUpdate = (callback) => {
    if (socketRef.current) {
      console.log('👂 Listening for vote updates');
      socketRef.current.on('vote_update', (data) => {
        console.log('📢 Vote update event received:', data);
        callback(data);
      });
    }
  };

  const onNewArgument = (callback) => {
    if (socketRef.current) {
      console.log('👂 Listening for new arguments');
      socketRef.current.on('new_argument', (data) => {
        console.log('📢 New argument event received:', data);
        callback(data);
      });
    }
  };

  const onArgumentVoteUpdate = (callback) => {
    if (socketRef.current) {
      console.log('👂 Listening for argument vote updates');
      socketRef.current.on('argument_vote_update', (data) => {
        console.log('📢 Argument vote update event received:', data);
        callback(data);
      });
    }
  };

  const off = (event) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  };

  return {
    socket: socketRef.current,
    joinDebate,
    leaveDebate,
    onNewDebate,
    onVoteUpdate,
    onNewArgument,
    onArgumentVoteUpdate,
    off
  };
};