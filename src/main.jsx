import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import App from '@/App.jsx'
import ErrorBoundary from '@/components/ErrorBoundary'
import '@/index.css'

console.log('Main.jsx loaded');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found!');
  } else {
    console.log('Root element found, rendering app...');
    ReactDOM.createRoot(rootElement).render(
      <ErrorBoundary>
        <QueryClientProvider client={queryClientInstance}>
          <App />
        </QueryClientProvider>
      </ErrorBoundary>
    );
    console.log('App rendered successfully');
  }
} catch (error) {
  console.error('Error rendering app:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: monospace; background: #1a1a1a; color: #ff4444; min-height: 100vh;">
      <h1>Fatal Error</h1>
      <pre>${error.stack || error.message}</pre>
    </div>
  `;
}
