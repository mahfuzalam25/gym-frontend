"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

// --- INTERFACES ---
interface MachineData {
  id: string;
  name: string;
  gym_name: string | null;
  gym_logo: string | null;
  gym_color: string | null;
  exercise_image_1: string | null;
  exercise_image_2: string | null;
  video_url: string | null;
  video_file: string | null;
  how_to_use: string | null;
  common_mistakes: string | null;
  muscles_worked: string | null;
  pt_booking_url: string | null;
  class_join_url: string | null;
}

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }
  
  // Handle Vimeo
  if (url.includes("vimeo.com")) {
    const match = url.match(/(?:vimeo\.com\/)(\d+)/i);
    return match ? `https://player.vimeo.com/video/${match[1]}` : url;
  }
  
  return url;
};

export default function MachinePageClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [machine, setMachine] = useState<MachineData | null>(null);
  const [loading, setLoading] = useState(true);
  const scanLogged = useRef(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

  // Dynamic styling object for the buttons
  const dynamicButtonStyle = machine.gym_color ? {
    backgroundColor: machine.gym_color,
    borderColor: machine.gym_color,
  } : {};

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-black font-sans flex flex-col selection:bg-gray-300">

      {/* Header Bar */}
      <div className="flex justify-end p-4 md:p-6 sticky top-0 bg-[#f4f5f7]/90 backdrop-blur-md z-50">
        <button
          onClick={handleBack}
          className="text-[#007AFF] text-lg font-semibold tracking-wide hover:opacity-70 transition-opacity"
        >
          Done
        </button>
      </div>

      {/* Main Responsive Grid Container */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-5 pb-12 lg:grid lg:grid-cols-12 lg:gap-16 items-start">

        {/* LEFT COLUMN: Title, Video & Images */}
        <div className="lg:col-span-6 flex flex-col items-center lg:sticky lg:top-24 mb-10 lg:mb-0">
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-center uppercase tracking-wide mb-6 text-black w-full">
            {machine.name}
          </h1>

          {/* Renders if either a URL string OR a raw Video file exists */}
          {(machine.video_url || machine.video_file) && (
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-xl mb-8 flex-shrink-0">
              {machine.video_url ? (
                <iframe
                  src={getEmbedUrl(machine.video_url)}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  src={machine.video_file!}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                ></video>
              )}
            </div>
          )}

          {/* Fallback/Secondary Images (Reverted to Original Style) */}
          <div className="flex justify-center items-center gap-4 w-full px-1">
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

          {/* Instructions */}
          <div className="space-y-6 text-sm md:text-base text-gray-800 font-medium leading-relaxed max-w-md w-full px-2">
            {machine.how_to_use && (
              <p>{machine.how_to_use}</p>
            )}

            {machine.common_mistakes && (
              <p className="text-gray-600 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <span className="font-bold text-red-500 flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Common Mistake
                </span>
                {machine.common_mistakes}
              </p>
            )}

            {machine.muscles_worked && (
              <p className="text-gray-500 text-xs md:text-sm uppercase tracking-wide pt-4 border-t border-gray-200">
                <span className="font-bold text-gray-700 block mb-1">Target Muscles: </span>
                {machine.muscles_worked}
              </p>
            )}
          </div>

          {/* Call to Action Buttons */}
          <div className="w-full max-w-md pt-12">
            {(machine.pt_booking_url || machine.class_join_url) && (
              <h2 className="font-bold text-lg mb-6 text-black text-center lg:text-left">Looking to improve?</h2>
            )}

            <div className="flex justify-center lg:justify-start gap-4">
              {machine.pt_booking_url && (
                <button
                  onClick={() => handleActionClick("PT", machine.pt_booking_url)}
                  style={dynamicButtonStyle}
                  className="flex-1 bg-[#535353] hover:opacity-80 text-white font-bold py-4 px-2 text-[11px] sm:text-xs uppercase tracking-wider shadow-sm border-[3px] border-gray-300 transition-opacity rounded-lg"
                >
                  BOOK PT SESSION
                </button>
              )}

              {machine.class_join_url && (
                <button
                  onClick={() => handleActionClick("CLASS", machine.class_join_url)}
                  style={dynamicButtonStyle}
                  className="flex-1 bg-[#535353] hover:opacity-80 text-white font-bold py-4 px-2 text-[11px] sm:text-xs uppercase tracking-wider shadow-sm border-[3px] border-gray-300 transition-opacity rounded-lg"
                >
                  BOOK A CLASS
                </button>
              )}
            </div>
          </div>

          {/* Bottom Branding */}
          <div className="mt-16 pb-8 flex justify-center lg:justify-start w-full opacity-90">
            <div className="flex flex-col items-center lg:items-start gap-1">
              {/* Dynamic Logo Implementation - Scaled Up */}
              {machine.gym_logo ? (
                <img 
                  src={machine.gym_logo} 
                  alt={`${machine.gym_name || 'Gym'} Logo`} 
                  className="w-[200px] h-auto max-h-[100px] object-contain" 
                />
              ) : (
                <Image 
                  src="/gymmvplogo.png" 
                  alt="Gym Logo" 
                  width={200} 
                  height={50} 
                  className="object-contain"
                  priority
                  style={{ width: "auto", height: "auto" }} 
                />
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}