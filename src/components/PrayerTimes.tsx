"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Sunrise, Sun, Sunset, Moon } from "lucide-react";

const cities = [
  { name: "New York", country: "US" },
  { name: "London", country: "UK" },
  { name: "Toronto", country: "Canada" },
  { name: "Sydney", country: "Australia" }
];

export default function PrayerTimes() {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [timings, setTimings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${selectedCity.name}&country=${selectedCity.country}&method=2`);
        const data = await res.json();
        setTimings(data.data.timings);
      } catch (error) {
        console.error("Failed to fetch prayer times", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [selectedCity]);

  const prayers = [
    { name: "Fajr", icon: Sunrise, time: timings?.Fajr },
    { name: "Dhuhr", icon: Sun, time: timings?.Dhuhr },
    { name: "Asr", icon: Sun, time: timings?.Asr },
    { name: "Maghrib", icon: Sunset, time: timings?.Maghrib },
    { name: "Isha", icon: Moon, time: timings?.Isha },
  ];

  const formatTime = (time24: string) => {
    if (!time24) return { time: "--:--", period: "" };
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return { time: `${h12}:${minutes}`, period: ampm };
  };

  return (
    <section className="relative w-full py-16 md:py-24 bg-[#F9F9F9] overflow-hidden selection:bg-[#D4AF37] selection:text-white">
      {/* Massive Background Typography */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none">
        <h1 className="text-[22vw] font-black text-black/[0.03] uppercase tracking-tighter leading-none">
          SALAH
        </h1>
      </div>

      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-12">
        {/* Header & City Selector */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-24 md:mb-32 gap-12">
          <div>
            <div className="flex items-center gap-3 text-gray-500 text-xs md:text-sm uppercase tracking-[0.4em] mb-6 font-semibold">
              <MapPin className="w-4 h-4 text-[#D4AF37]" /> Global Synchronization
            </div>
            <h2 className="text-gray-900 text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-none">
              Prayer <span className="font-serif italic text-[#D4AF37] ml-2">Timings</span>
            </h2>
          </div>
          
          {/* City Selector */}
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {cities.map((city) => (
              <button
                key={city.name}
                onClick={() => setSelectedCity(city)}
                className={`uppercase text-xs md:text-sm tracking-[0.25em] transition-all duration-700 ease-out relative py-2 ${
                  selectedCity.name === city.name
                    ? "text-[#0F5132]"
                    : "text-gray-400 hover:text-[#D4AF37]"
                }`}
              >
                {city.name}
                {selectedCity.name === city.name && (
                  <motion.div 
                    layoutId="activeCityIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#D4AF37]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="w-full overflow-x-auto pb-12 pt-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="min-w-[900px] relative">
            {/* Continuous Timeline Line */}
            <div className="absolute top-[20px] left-[5%] right-[5%] h-[1px] bg-gray-200" />
            
            <div className="relative flex justify-between items-start w-full px-[5%]">
              {prayers.map((prayer, index) => {
                const formatted = formatTime(prayer.time);
                return (
                  <motion.div 
                    key={prayer.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: index * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center group cursor-default"
                  >
                    {/* The Icon area with background to clip the line */}
                    <div className="bg-[#F9F9F9] px-6 mb-8 relative z-10 transition-transform duration-700 group-hover:-translate-y-2">
                      <prayer.icon className="w-10 h-10 text-gray-300 group-hover:text-[#D4AF37] transition-colors duration-700" strokeWidth={1} />
                    </div>

                    {/* Time & Name */}
                    <div className="text-center flex flex-col items-center">
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className={`text-5xl lg:text-7xl font-light tracking-tighter transition-colors duration-700 ${loading ? "text-gray-200" : "text-gray-900 group-hover:text-[#0F5132]"}`}>
                          {loading ? "00:00" : formatted.time}
                        </span>
                        <span className={`text-lg lg:text-2xl font-serif italic transition-colors duration-700 ${loading ? "text-gray-200" : "text-[#D4AF37] group-hover:text-[#C5A880]"}`}>
                          {loading ? "--" : formatted.period}
                        </span>
                      </div>
                      <div className="text-gray-400 uppercase text-xs lg:text-sm tracking-[0.4em] font-medium group-hover:text-[#0F5132] transition-colors duration-700">
                        {prayer.name}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}