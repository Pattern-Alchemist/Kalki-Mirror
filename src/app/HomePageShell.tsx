'use client';

import dynamic from 'next/dynamic';

/* All home page client content — loaded via dynamic() from the server page.
   ssr: false avoids framer-motion/hook SSR issues on Vercel serverless. */
export default dynamic(() => import('./HomeClientIslands'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-deep-black" />,
});
