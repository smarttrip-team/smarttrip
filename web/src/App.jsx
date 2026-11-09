import React from 'react';
import { AuthWalletProvider } from './context/AuthWalletContext';
import { AppRouter } from './app/router/AppRouter';

export function App() {
  return (
    <AuthWalletProvider>
      <AppRouter />
    </AuthWalletProvider>
  );
}

export default App;
