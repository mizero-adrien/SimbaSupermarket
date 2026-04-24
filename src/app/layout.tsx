import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import BottomNav from '@/components/BottomNav';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Simba Supermarket Rwanda — Fresh Online Grocery',
  description: "Rwanda's freshest online supermarket. 552 products delivered to your door in Kigali.",
  keywords: 'supermarket, Rwanda, Kigali, grocery, online shopping, fresh food',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased font-sans bg-light-bg dark:bg-dark-bg min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
              <BackToTop />
              <BottomNav />
            </CartProvider>
          </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
