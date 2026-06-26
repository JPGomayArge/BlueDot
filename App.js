import React from 'react';
import BlueDotApp, { SettingsProvider } from './app/index';

export default function App() {
  return (
    <SettingsProvider>
      <BlueDotApp />
    </SettingsProvider>
  );
}
