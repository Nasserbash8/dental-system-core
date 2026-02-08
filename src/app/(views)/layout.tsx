'use client'
import NextTopLoader from 'nextjs-toploader';
import { ArrowUpIcon } from '@/icons';

import type { ReactNode } from 'react';
import ScrollToTop from "react-scroll-to-top";
import GlobalLoader from '@/components/ui/common/GlobalLoader';
import MainHeader from '@/components/layout/viewsLayout/Header';
import Footer from '@/components/layout/viewsLayout/Footer';


export default function WebsiteLayout({ children }: { children: ReactNode }) {
  return (

      <div>
        <NextTopLoader 
        color="#d1922b" 
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        showSpinner={false} // يمكنك تفعيله إذا أردت سبينر بجانب الخط
      />
      <GlobalLoader />
        <MainHeader />
        <main className="">{children}</main>
        <ScrollToTop smooth 
        style={{
          backgroundColor: "#d1922b",
          color: "#fff",
          borderRadius: "50%",
          padding: "10px",

        }}
        component={
          <div className="flex items-center justify-center w-full h-full">
            <ArrowUpIcon className="text-white text-xl" />
          </div>
        }
     
        />
        <Footer/>
      </div>
  );
}
