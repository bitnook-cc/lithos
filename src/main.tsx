import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const runtimeBuild = '20260805-expansion-v3';
(document.documentElement.dataset as DOMStringMap).lithosBuild = runtimeBuild;
(window as Window & { __LITHOS_BUILD__?: string }).__LITHOS_BUILD__ = runtimeBuild;

createRoot(document.getElementById('root')!).render(<App />);
