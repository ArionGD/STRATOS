import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

const LandingLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 relative selection:bg-blue-500/20 overflow-x-hidden">
      <Navbar />
      
      {/* Soft Light-Friendly Aurora Glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      <main className="relative z-10 pt-24 flex flex-col min-h-screen">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  )
}

export default LandingLayout
