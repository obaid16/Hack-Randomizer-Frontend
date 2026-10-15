import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import SmoothScroll from '@/components/layout/SmoothScroll';

export const metadata = {
  title: 'TEAM DRAW · Hackathon Team Generator',
  description: 'Live suspense-driven hackathon team draw experience. Enforces strict 1 Second-Year + 2 First-Years + 1 Unique Mentor composition with mechanical name reveals.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-canvas text-primaryText antialiased selection:bg-accent/20 selection:text-primaryText min-h-screen">
        <ToastProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </ToastProvider>
      </body>
    </html>
  );
}
