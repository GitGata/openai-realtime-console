import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './index.jsx';

export function render(url) {
  const html = renderToString(<App url={url} />);
  return { html };
}
