import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants';
import authService from './authService';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  // Initialize socket connection
  async connect() {
    try {
      const token = await authService.getAccessToken();
      if (!token) {
        console.log('No token available for socket connection');
        return false;
      }

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        auth: { token },
      });

      this.setupBaseListeners();
      return true;
    } catch (error) {
      console.error('Socket connection error:', error);
      return false;
    }
  }

  // Setup base event listeners
  setupBaseListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.authenticate();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
    });

    this.socket.on('connected', (data) => {
      console.log('Socket authenticated:', data);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('pong', () => {
      console.log('Pong received');
    });
  }

  // Authenticate socket connection
  async authenticate() {
    const token = await authService.getAccessToken();
    if (token && this.socket) {
      this.socket.emit('authenticate', { token });
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Send ping
  ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping');
    }
  }

  // Request unread count
  requestUnreadCount() {
    if (this.socket && this.isConnected) {
      this.socket.emit('get:unread-count');
    }
  }

  // Subscribe to event
  on(event, callback) {
    if (!this.socket) return;

    const listener = (data) => callback(data);
    this.listeners.set(`${event}-${callback.toString()}`, listener);
    this.socket.on(event, listener);
  }

  // Unsubscribe from event
  off(event, callback) {
    if (!this.socket) return;

    const key = `${event}-${callback.toString()}`;
    const listener = this.listeners.get(key);
    if (listener) {
      this.socket.off(event, listener);
      this.listeners.delete(key);
    }
  }

  // Subscribe to balance updates
  onBalanceUpdate(callback) {
    this.on('balance-update', callback);
  }

  // Subscribe to transaction events
  onTransaction(callback) {
    this.on('transaction', callback);
  }

  // Subscribe to notifications
  onNotification(callback) {
    this.on('notification', callback);
  }

  // Subscribe to unread count updates
  onUnreadCount(callback) {
    this.on('unread-count', callback);
  }

  // Subscribe to security events
  onSecurityEvent(callback) {
    this.on('security', callback);
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

export const socketService = new SocketService();
export default socketService;
