import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BrandLoader } from './components/BrandLoader';
import { ThemeProvider } from './context/ThemeContext';
import { EnquiryProvider } from './context/EnquiryContext';

const Home = lazy(() => import('./pages/Home'));
const QuickEnquiryPage = lazy(() => import('./pages/QuickEnquiryPage'));
const SafetyTipsPage = lazy(() => import('./pages/SafetyTipsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

export function App() {
  return (
    <ThemeProvider>
      <EnquiryProvider>
        <Router>
          <ErrorBoundary>
            <Suspense fallback={<BrandLoader variant="fullscreen" message="Loading Crackers Falls (பட்டாசு அருவி)..." />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/quick-enquiry" element={<QuickEnquiryPage />} />
                <Route path="/safety-tips" element={<SafetyTipsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
      </EnquiryProvider>
    </ThemeProvider>
  );
}

export default App;
