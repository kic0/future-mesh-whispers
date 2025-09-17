import React, { useEffect, useRef, useCallback, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const InactivityTimeoutWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const timeoutId = useRef<number | null>(null);

  const resetTimeout = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    if (location.pathname !== '/thank-you') {
      timeoutId.current = window.setTimeout(() => {
        const storedPath = sessionStorage.getItem("station_start_path") || "/";
        navigate(storedPath);
      }, 3 * 60 * 1000); // 3 minutes
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click'];

    const reset = () => resetTimeout();

    events.forEach(event => window.addEventListener(event, reset));
    resetTimeout();

    return () => {
      events.forEach(event => window.removeEventListener(event, reset));
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [resetTimeout]);

  return <>{children}</>;
};

export default InactivityTimeoutWrapper;
