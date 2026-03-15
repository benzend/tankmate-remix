import React from 'react';

export const AuthLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <main className="bg-slate-950 bg-gradient-to-br from-blue-800 flex min-h-[calc(100vh-150px)] flex-col justify-center pb-32 pt-20 px-8">
      {children}
    </main>
  )
}

