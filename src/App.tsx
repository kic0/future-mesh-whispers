import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import AppRoutes from './AppRoutes';
import { SurveyProvider } from './context/SurveyContext';
import HeaderLogo from '@/components/HeaderLogo';
import Navigation from '@/components/Navigation';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SurveyProvider>
        <Router>
          <Navigation />
          <HeaderLogo />
          <div className="App">
            <AppRoutes />
          </div>
          <Toaster />
          <Sonner />
        </Router>
      </SurveyProvider>
    </QueryClientProvider>
  );
}

export default App;
