import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../hooks/useAuth'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectionError: string | null
  emit: (event: string, data?: unknown) => void
  on: (event: string, callback: (...args: unknown[]) => void) => void
  off: (event: string, callback?: (...args: unknown[]) => void) => void
  reconnect: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const SocketContext = createContext<SocketContextType | undefined>(undefined)
// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: React.ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  // Safely get auth context with error handling
  let authContext
  try {
    authContext = useAuth()
  } catch (error) {
    console.warn('SocketProvider: AuthContext not available, skipping socket initialization')
    return <>{children}</>
  }
  
  const { user, isAuthenticated } = authContext

  useEffect(() => {
    if (isAuthenticated && user && user.token) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
      
      console.log('Creating socket connection to:', socketUrl)
      console.log('User token:', user.token ? 'Present' : 'Missing')
      console.log('User ID:', user.id)
      
      setConnectionError(null)
      
      const newSocket = io(socketUrl, {
        auth: {
          token: user.token,
          userId: user.id || user._id,
        },
        autoConnect: true,
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      newSocket.on('connect', () => {
        setIsConnected(true)
        setConnectionError(null)
        console.log('Socket connected successfully')
      })

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false)
        console.log('Socket disconnected:', reason)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
        setConnectionError(error.message || 'Connection failed')
      })

      newSocket.on('error', (error) => {
        console.error('Socket error:', error)
        setConnectionError(error.message || 'Socket error')
      })

      // Use setTimeout to avoid calling setState synchronously in effect
      setTimeout(() => {
        setSocket(newSocket)
      }, 0)

      return () => {
        console.log('Cleaning up socket connection')
        newSocket.close()
        setSocket(null)
        setIsConnected(false)
        setConnectionError(null)
      }
    } else if (!isAuthenticated) {
      // Clean up socket when user logs out
      if (socket) {
        console.log('User logged out, closing socket')
        socket.close()
        setSocket(null)
        setIsConnected(false)
        setConnectionError(null)
      }
    }
  }, [isAuthenticated, user])

  const emit = (event: string, data?: unknown) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    }
  }

  const on = (event: string, callback: (...args: unknown[]) => void) => {
    if (socket) {
      socket.on(event, callback)
    }
  }

  const off = (event: string, callback?: (...args: unknown[]) => void) => {
    if (socket) {
      socket.off(event, callback)
    }
  }

  const reconnect = () => {
    if (socket) {
      console.log('Manually reconnecting socket...')
      socket.connect()
    }
  }

  const value: SocketContextType = {
    socket,
    isConnected,
    connectionError,
    emit,
    on,
    off,
    reconnect,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
