"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

// Define the shape of our Django API response
interface MachineData {
  id: string;
  name: string;
  exercise_image_1: string | null;
  exercise_image_2: string | null;
  how_to_use: string[];
  common_mistakes: string[];
  muscles_worked: string[];
  pt_booking_url: string | null;
  class_join_url: string | null;
}

// Simple placeholder icons (inline SVGs)
const StepsIcon = () => (
  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const MuscleIcon = () => (
  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
  </svg>
);

export default function MachinePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [machine, setMachine] = useState<MachineData | null>(null);
  const [loading, setLoading] = useState(true);
  const scanLogged = useRef(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!id) return;

    const fetchMachine = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/machines/${id}/`);
        if (response.ok) {
          const data = await response.json();
          setMachine(data);
        } else {
          console.error("Machine not found");
        }
      } catch (error) {
        console.error("Failed to fetch machine data", error);
      } finally {
        setLoading(false);
      }
    };

    const logScan = async () => {
      if (scanLogged.current) return;
      try {
        await fetch(`${API_BASE}/api/machines/${id}/scan/`, {
          method: "POST",
        });
        scanLogged.current = true;
      } catch (error) {
        console.error("Failed to log scan", error);
      }
    };

    fetchMachine();
    logScan();
  }, [id, API_BASE]);

  const handleActionClick = async (type: "PT" | "CLASS", url: string | null) => {
    if (!url) return;
    
    try {
      await fetch(`${API_BASE}/api/machines/${id}/click/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link_type: type }),
      });
    } catch (error) {
      console.error("Failed to log click", error);
    }
    
    window.open(url, "_blank");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-gray-400 font-medium text-lg">Machine not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-gray-800 flex flex-col">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between p-5 border-b border-gray-800 sticky top-0 bg-gray-950/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-2 font-black text-xl tracking-tighter text-white">
          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2A1 1 0 0011 11.236V17zM4.502 12.467c1.31.32 2.11 1.76 1.77 3.07-.34 1.31-1.78 2.09-3.09 1.77-1.31-.32-2.11-1.76-1.77-3.07.34-1.31 1.78-2.09 3.09-1.77zM15.447 3.106a1 1 0 00-1.447.894l-4 2A1 1 0 0011 7.236v5.764a1 1 0 001.447.894l4-2A1 1 0 0017 10.764V5.236a1 1 0 00-1.447-.894l-4 2A1 1 0 0011 3.236V17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2A1 1 0 0011 11.236V17z" />
          </svg>
           NEXACORE
        </div>
        <button 
          onClick={handleBack}
          className="text-sm md:text-base font-semibold text-blue-500 hover:text-blue-400 transition-colors"
        >
          Done
        </button>
      </div>

      {/* Main Responsive Grid Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Title & Images (Sticky on Desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 mb-10 lg:mb-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center lg:text-left uppercase tracking-widest mb-8 text-white">
              {machine.name}
            </h1>

            <div className="flex flex-row justify-center lg:justify-start items-center gap-4 sm:gap-6">
              {machine.exercise_image_1 && (
                <img
                  src={machine.exercise_image_1}
                  alt={`${machine.name} start position`}
                  className="w-1/2 max-w-[220px] lg:max-w-full object-contain rounded-xl shadow-2xl border border-gray-800 p-3 bg-gray-900 transition-transform duration-500 hover:scale-105"
                />
              )}
              {machine.exercise_image_2 && (
                <img
                  src={machine.exercise_image_2}
                  alt={`${machine.name} end position`}
                  className="w-1/2 max-w-[220px] lg:max-w-full object-contain rounded-xl shadow-2xl border border-gray-800 p-3 bg-gray-900 transition-transform duration-500 hover:scale-105"
                />
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Instructions, Data & CTAs */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            
            {/* How to Use */}
            {machine.how_to_use && machine.how_to_use.length > 0 && (
              <section className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-800 shadow-lg">
                <h2 className="flex items-center gap-3 text-xl font-bold mb-6 text-white">
                  <StepsIcon />
                  Execution Steps
                </h2>
                <ol className="space-y-5 text-base md:text-lg text-gray-300 leading-relaxed">
                  {machine.how_to_use.map((step, index) => (
                    <li key={index} className="flex gap-4 items-start">
                      <span className="flex-none font-extrabold text-blue-500 bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center text-sm mt-0.5">
                        {index + 1}
                      </span>
                      <p className="flex-1 pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Common Mistakes */}
            {machine.common_mistakes && machine.common_mistakes.length > 0 && (
              <section className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-800 shadow-lg">
                <h2 className="flex items-center gap-3 text-xl font-bold mb-6 text-white">
                  <WarningIcon />
                  Avoid These Errors
                </h2>
                <ul className="space-y-5 text-base md:text-lg text-gray-300 leading-relaxed">
                  {machine.common_mistakes.map((mistake, index) => (
                    <li key={index} className="flex gap-4 items-start">
                      <span className="flex-none text-amber-500 mt-1 font-bold text-xl">✕</span>
                      <p className="flex-1 pt-1">{mistake}</p>
                    </li>
                  ))}
                </ul >
              </section>
            )}

            {/* Muscles Worked */}
            {machine.muscles_worked && machine.muscles_worked.length > 0 && (
              <section className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-800 text-left shadow-lg">
                <h2 className="flex items-center gap-3 text-xl font-bold mb-6 text-white">
                  <MuscleIcon />
                  Target Muscles
                </h2>
                <div className="flex flex-wrap gap-3">
                  {machine.muscles_worked.map((muscle, index) => (
                    <span 
                      key={index}
                      className="bg-gray-800 text-gray-200 text-sm md:text-base font-semibold px-5 py-2.5 rounded-full border border-gray-700"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Call to Action Card */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700 text-center mt-8 shadow-2xl">
              <h2 className="text-2xl font-extrabold mb-8 text-white">Looking to optimize your routine?</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {machine.pt_booking_url && (
                  <button
                    onClick={() => handleActionClick("PT", machine.pt_booking_url)}
                    className="w-full sm:w-1/2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 px-6 rounded-xl text-sm md:text-base tracking-wide transition-all duration-300 transform hover:scale-[1.02] hover:shadow-blue-500/25 shadow-lg"
                  >
                    BOOK PT SESSION
                  </button>
                )}
                
                {machine.class_join_url && (
                  <button
                    onClick={() => handleActionClick("CLASS", machine.class_join_url)}
                    className="w-full sm:w-1/2 bg-gray-700 hover:bg-gray-600 text-white font-extrabold py-4 px-6 rounded-xl text-sm md:text-base tracking-wide transition-all duration-300 transform hover:scale-[1.02] shadow-lg border border-gray-600"
                  >
                    JOIN A CLASS
                  </button>
                )}
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Footer Brand */}
      <footer className="w-full py-8 text-center opacity-70 border-t border-gray-900 mt-auto">
        <div className="inline-flex items-center gap-2 justify-center font-black text-xl tracking-tighter text-gray-500">
           NEXACORE GYM SYSTEM
        </div>
      </footer>
    </div>
  );
}