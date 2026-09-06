import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@fontsource-variable/cinzel';
import '@fontsource-variable/source-sans-3';
import '@fontsource-variable/source-sans-3/wght-italic.css';
import './styles.css';
import './typography.css';

const runtimeBuild = '20260805-expansion-v3';
(document.documentElement.dataset as DOMStringMap).lithosBuild = runtimeBuild;
(window as Window & { __LITHOS_BUILD__?: string }).__LITHOS_BUILD__ = runtimeBuild;

createRoot(document.getElementById('root')!).render(<App />);
