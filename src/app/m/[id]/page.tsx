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
  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const MuscleIcon = () => (
  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
    // Attempt to close the in-app browser first, fallback to routing
    window.close();
    setTimeout(() => {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push('/');
      }
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium text-lg">Machine not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 flex flex-col">
      
      {/* Header Bar - Light Theme */}
      <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur-md z-50 shadow-sm">
        <div className="flex items-center gap-2 font-black text-xl tracking-tighter text-gray-900">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2A1 1 0 0011 11.236V17zM4.502 12.467c1.31.32 2.11 1.76 1.77 3.07-.34 1.31-1.78 2.09-3.09 1.77-1.31-.32-2.11-1.76-1.77-3.07.34-1.31 1.78-2.09 3.09-1.77zM15.447 3.106a1 1 0 00-1.447.894l-4 2A1 1 0 0011 7.236v5.764a1 1 0 001.447.894l4-2A1 1 0 0017 10.764V5.236a1 1 0 00-1.447-.894l-4 2A1 1 0 0011 3.236V17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2A1 1 0 0011 11.236V17z" />
          </svg>
           NEXACORE
        </div>
        <button 
          onClick={handleBack}
          className="text-sm md:text-base font-semibold text-blue-600 hover:text-blue-500 transition-colors"
        >
          Done
        </button>
      </div>

      {/* Main Responsive Grid Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Title & Images (Sticky on Desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 mb-6 lg:mb-0">
            {/* Reduced bottom margin on mobile to bring images up */}
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-center lg:text-left uppercase tracking-widest mb-4 lg:mb-8 text-gray-900">
              {machine.name}
            </h1>

            <div className="flex flex-row justify-center lg:justify-start items-center gap-2 sm:gap-6">
              {machine.exercise_image_1 && (
                <img
                  src={machine.exercise_image_1}
                  alt={`${machine.name} start position`}
                  // Reduced mobile max-width to 140px so it fits screen better. Desktop remains full size.
                  className="w-1/2 max-w-[140px] sm:max-w-[200px] lg:max-w-full aspect-square object-contain rounded-xl shadow-sm border border-gray-200 p-2 bg-white transition-transform duration-500 hover:scale-105 mix-blend-darken"
                />
              )}
              {machine.exercise_image_2 && (
                <img
                  src={machine.exercise_image_2}
                  alt={`${machine.name} end position`}
                  className="w-1/2 max-w-[140px] sm:max-w-[200px] lg:max-w-full aspect-square object-contain rounded-xl shadow-sm border border-gray-200 p-2 bg-white transition-transform duration-500 hover:scale-105 mix-blend-darken"
                />
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Instructions, Data & CTAs */}
          <div className="lg:col-span-7 space-y-4 md:space-y-8">
            
            {/* How to Use */}
            {machine.how_to_use && machine.how_to_use.length > 0 && (
              <section className="bg-white rounded-2xl p-5 md:p-8 border border-gray-200 shadow-sm">
                <h2 className="flex items-center gap-3 text-lg md:text-xl font-bold mb-4 md:mb-6 text-gray-900">
                  <StepsIcon />
                  Execution Steps
                </h2>
                <ol className="space-y-4 text-sm md:text-lg text-gray-600 leading-relaxed">
                  {machine.how_to_use.map((step, index) => (
                    <li key={index} className="flex gap-3 md:gap-4 items-start">
                      <span className="flex-none font-extrabold text-blue-600 bg-blue-50 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm mt-0.5 border border-blue-100">
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
              <section className="bg-white rounded-2xl p-5 md:p-8 border border-gray-200 shadow-sm">
                <h2 className="flex items-center gap-3 text-lg md:text-xl font-bold mb-4 md:mb-6 text-gray-900">
                  <WarningIcon />
                  Avoid These Errors
                </h2>
                <ul className="space-y-4 text-sm md:text-lg text-gray-600 leading-relaxed">
                  {machine.common_mistakes.map((mistake, index) => (
                    <li key={index} className="flex gap-3 md:gap-4 items-start">
                      <span className="flex-none text-red-500 mt-1 font-bold text-lg md:text-xl">✕</span>
                      <p className="flex-1 pt-1">{mistake}</p>
                    </li>
                  ))}
                </ul >
              </section>
            )}

            {/* Muscles Worked */}
            {machine.muscles_worked && machine.muscles_worked.length > 0 && (
              <section className="bg-white rounded-2xl p-5 md:p-8 border border-gray-200 text-left shadow-sm">
                <h2 className="flex items-center gap-3 text-lg md:text-xl font-bold mb-4 md:mb-6 text-gray-900">
                  <MuscleIcon />
                  Target Muscles
                </h2>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {machine.muscles_worked.map((muscle, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 text-xs md:text-base font-semibold px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-gray-200"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Call to Action Card */}
            <section className="bg-white rounded-2xl p-5 md:p-8 border border-gray-200 text-center mt-6 md:mt-8 shadow-md">
              <h2 className="text-xl md:text-2xl font-extrabold mb-6 md:mb-8 text-gray-900">Looking to optimize your routine?</h2>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                {machine.pt_booking_url && (
                  <button
                    onClick={() => handleActionClick("PT", machine.pt_booking_url)}
                    className="w-full sm:w-1/2 bg-[#535353] hover:bg-gray-800 text-white font-extrabold py-3.5 md:py-4 px-6 rounded-xl text-xs md:text-base tracking-wide transition-all duration-300 transform hover:scale-[1.02] shadow-md"
                  >
                    BOOK PT SESSION
                  </button>
                )}
                
                {machine.class_join_url && (
                  <button
                    onClick={() => handleActionClick("CLASS", machine.class_join_url)}
                    className="w-full sm:w-1/2 bg-white hover:bg-gray-50 text-[#535353] font-extrabold py-3.5 md:py-4 px-6 rounded-xl text-xs md:text-base tracking-wide transition-all duration-300 transform hover:scale-[1.02] shadow-sm border-2 border-[#535353]"
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
      <footer className="w-full py-6 md:py-8 text-center opacity-70 border-t border-gray-200 mt-auto bg-white">
        <div className="inline-flex items-center gap-2 justify-center font-black text-lg md:text-xl tracking-tighter text-gray-500">
           NEXACORE GYM SYSTEM
        </div>
      </footer>
    </div>
  );
}