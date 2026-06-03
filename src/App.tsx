import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 400);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>

      {loading && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0F1A] transition-opacity duration-400 ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <img src="/ribo-logo.svg" className="w-32 h-auto" alt="" />
          <div className="flex gap-2 mt-6">
            <div
              className="w-2 h-2 rounded-full bg-[#2eb5b7]"
              style={{ animation: "dot-pulse 1.2s ease-in-out infinite" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-[#2eb5b7]"
              style={{ animation: "dot-pulse 1.2s ease-in-out 0.2s infinite" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-[#2eb5b7]"
              style={{ animation: "dot-pulse 1.2s ease-in-out 0.4s infinite" }}
            />
          </div>
        </div>
      )}
    </QueryClientProvider>
  );
};

export default App;
