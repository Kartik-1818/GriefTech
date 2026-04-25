import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'GriefTech — Your AI guide through one of life\'s hardest moments',
  description: 'A compassionate AI companion that walks Indian families through every legal and financial step after losing a loved one.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-[#FAF8F5] text-slate-900">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
