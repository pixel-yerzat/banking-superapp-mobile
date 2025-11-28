import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socketService } from '../services/socketService';
import { setUnreadNotifications, incrementUnreadNotifications } from '../store/slices/uiSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { baseApi } from '../api/baseApi';

export const useSocket = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isConnected, setIsConnected] = useState(false);

  // Connect on authentication
  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect().then((connected) => {
        if (connected) {
          setIsConnected(true);
          setupEventListeners();
        }
      });
    } else {
      socketService.disconnect();
      setIsConnected(false);
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  // Setup event listeners
  const setupEventListeners = useCallback(() => {
    // Balance update
    socketService.onBalanceUpdate((data) => {
      console.log('Balance update received:', data);
      // Invalidate accounts cache
      dispatch(baseApi.util.invalidateTags(['Accounts']));
    });

    // Transaction event
    socketService.onTransaction((data) => {
      console.log('Transaction received:', data);
      // Invalidate transactions and accounts cache
      dispatch(baseApi.util.invalidateTags(['Transactions', 'Accounts']));
    });

    // Notification event
    socketService.onNotification((notification) => {
      console.log('Notification received:', notification);
      dispatch(incrementUnreadNotifications());
      // Invalidate notifications cache
      dispatch(baseApi.util.invalidateTags(['Notifications']));
    });

    // Unread count update
    socketService.onUnreadCount((data) => {
      console.log('Unread count:', data);
      dispatch(setUnreadNotifications(data.count));
    });

    // Security event
    socketService.onSecurityEvent((data) => {
      console.log('Security event:', data);
      // Handle security events (e.g., force logout, show alert)
    });

    // Request initial unread count
    socketService.requestUnreadCount();
  }, [dispatch]);

  // Manual reconnect
  const reconnect = useCallback(async () => {
    socketService.disconnect();
    const connected = await socketService.connect();
    if (connected) {
      setIsConnected(true);
      setupEventListeners();
    }
    return connected;
  }, [setupEventListeners]);

  // Ping server
  const ping = useCallback(() => {
    socketService.ping();
  }, []);

  return {
    isConnected,
    reconnect,
    ping,
  };
};

export default useSocket;
