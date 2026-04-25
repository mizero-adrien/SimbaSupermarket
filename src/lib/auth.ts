import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const hasGoogleConfig =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

const productionHost = process.env.NEXTAUTH_URL
  ? new URL(process.env.NEXTAUTH_URL).host
  : null;

const ALLOWED_REDIRECT_HOSTS = new Set<string>([
  'localhost:3000',
  'localhost:3001',
  'localhost:3002',
  ...(productionHost ? [productionHost] : []),
]);

export const authOptions: NextAuthOptions = {
  providers: hasGoogleConfig
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
      ]
    : [],
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      const base = new URL(baseUrl);

      if (url.startsWith('/')) {
        return `${base.origin}${url}`;
      }

      try {
        const target = new URL(url);
        if (ALLOWED_REDIRECT_HOSTS.has(target.host)) {
          return target.toString();
        }
      } catch {
        return base.origin;
      }

      return base.origin;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
