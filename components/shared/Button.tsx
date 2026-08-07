"use client";
import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function DuolingoButton({ children, variant = 'primary', className, ...props }: Props) {
  const variants = {
    primary: "bg-[#7C3AED] border-violet-800 text-white hover:bg-[#8B5CF6]",
    secondary: "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
    ghost: "bg-transparent border-transparent text-slate-400 hover:bg-slate-50"
  };

  return (
    <button
      {...props}
      className={`
        relative px-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-all duration-75
        border-b-4 active:border-b-0 active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </button>
  );
}