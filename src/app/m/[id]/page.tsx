"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

// Updated to match the new Django models (strings instead of string arrays)
interface MachineData {
  id: string;
  name: string;
  exercise_image_1: string | null;
  exercise_image_2: string | null;
  how_to_use: string | null;
  common_mistakes: string | null;
  muscles_worked: string | null;
  pt_booking_url: string | null;
  class_join_url: string | null;
}

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
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7]">
        <p className="text-gray-500 font-medium text-lg">Machine not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-black font-sans flex flex-col selection:bg-gray-300">

      {/* Header Bar - Super clean iOS Style matching the image */}
      <div className="flex justify-end p-4 md:p-6 sticky top-0 bg-[#f4f5f7]/90 backdrop-blur-md z-50">
        <button
          onClick={handleBack}
          className="text-[#007AFF] text-lg font-semibold tracking-wide hover:opacity-70 transition-opacity"
        >
          Done
        </button>
      </div>

      {/* Main Responsive Grid Container */}
      {/* Mobile: flex-col (stacked) | Desktop: grid (side-by-side) */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-5 pb-12 lg:grid lg:grid-cols-12 lg:gap-16 items-start">

        {/* LEFT COLUMN: Title & Images */}
        <div className="lg:col-span-6 flex flex-col items-center lg:sticky lg:top-24 mb-10 lg:mb-0">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-center uppercase tracking-wide mb-8 text-black">
            {machine.name}
          </h1>

          <div className="flex justify-center items-center gap-4 w-full px-2">
            {machine.exercise_image_1 && (
              <img
                src={machine.exercise_image_1}
                alt={`${machine.name} start`}
                className="w-1/2 aspect-square object-contain mix-blend-darken"
              />
            )}
            {machine.exercise_image_2 && (
              <img
                src={machine.exercise_image_2}
                alt={`${machine.name} end`}
                className="w-1/2 aspect-square object-contain mix-blend-darken"
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Instructions, Data & CTAs */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left lg:mt-16">

          {/* Instructions (Rendered directly from TextFields) */}
          <div className="space-y-6 text-sm md:text-base text-gray-800 font-medium leading-relaxed max-w-md w-full px-2">
            {machine.how_to_use && (
              <p>{machine.how_to_use}</p>
            )}

            {machine.common_mistakes && (
              <p className="text-gray-600">
                <span className="font-bold text-gray-800">Tip: </span>
                {machine.common_mistakes}
              </p>
            )}

            {machine.muscles_worked && (
              <p className="text-gray-500 text-xs md:text-sm uppercase tracking-wide">
                <span className="font-bold text-gray-700">Target Muscles: </span>
                {machine.muscles_worked}
              </p>
            )}
          </div>

          {/* Call to Action Buttons */}
          <div className="w-full max-w-md pt-12">
            <h2 className="font-bold text-lg mb-6 text-black text-center lg:text-left">Looking to improve?</h2>

            <div className="flex justify-center lg:justify-start gap-4">
              {machine.pt_booking_url && (
                <button
                  onClick={() => handleActionClick("PT", machine.pt_booking_url)}
                  // Styling to match the thick dark gray button with lighter inner border
                  className="flex-1 bg-[#535353] hover:bg-gray-800 text-white font-bold py-4 px-2 text-[11px] sm:text-xs uppercase tracking-wider shadow-sm border-[3px] border-gray-300 transition-colors"
                >
                  BOOK PT SESSION
                </button>
              )}

              {machine.class_join_url && (
                <button
                  onClick={() => handleActionClick("CLASS", machine.class_join_url)}
                  className="flex-1 bg-[#535353] hover:bg-gray-800 text-white font-bold py-4 px-2 text-[11px] sm:text-xs uppercase tracking-wider shadow-sm border-[3px] border-gray-300 transition-colors"
                >
                  BOOK A CLASS
                </button>
              )}
            </div>
          </div>

          {/* Bottom Branding / Logo Placeholder */}
          <div className="mt-16 pb-8 flex justify-center lg:justify-start w-full opacity-90">
            <div className="flex flex-col items-center lg:items-start gap-1">
              <Image 
                src="/gymmvplogo.png" 
                alt="Gym Logo" 
                width={160} 
                height={40} 
                className="object-contain" 
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}