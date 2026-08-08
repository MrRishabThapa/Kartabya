"use client";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";

interface LottieLoaderProps {
  url: string;
  className?: string;
}

export default function LottieLoader({ url, className }: LottieLoaderProps) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Error loading Lottie:", err));
  }, [url]);

  if (!animationData) return <div className={className} />; // Placeholder while loading

  return (
    <Lottie 
      animationData={animationData} 
      loop={true} 
      className={className} 
    />
  );
}