import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './assets/css/bootstrap.min.css';
import './assets/css/all.min.css';
import './assets/css/animate.css';
import './assets/css/custom.css';
import './assets/css/magnific-popup.css';
import './assets/css/mousecursor.css';
import './assets/css/swiper-bundle.min.css';
import { App } from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
library.add(fas);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);