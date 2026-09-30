import React, { useState, useEffect } from "react";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  Snowflake,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Search,
  RefreshCw,
  MapPin,
  Calendar,
  Compass,
  Sparkles,
  X,
  CloudSun,
  Zap
} from "lucide-react";
import { ActiveMapData } from "../App";
import { DraggableResizableWidget } from "./DraggableResizableWidget";

interface LocationWeatherWidgetProps {
  activeMapData: ActiveMapData | null;
  setActiveMapData?: (data: ActiveMapData | null) => void;
  isEditMode?: boolean;
  onClose?: () => void;
  agentColor?: string;
}

interface WeatherData {
  city: string;
  country?: string;
  lat?: number;
  lon?: number;
  temp: number;
  feelsLike: number;
  conditionCode: number;
  conditionText: string;
  windSpeed: number; // km/h
  humidity: number; // %
  precipitationProb: number; // %
  uvIndex: number;
  hourly: { time: string; temp: number; code: number }[];
  daily: { day: string; tempMax: number; tempMin: number; code: number }[];
  isLive: boolean;
}

// Convert Open-Meteo weather code to label and icon
const getWeatherInfo = (code: number) => {
  if (code === 0) {
    return { label: "KLARER HIMMEL // SUN CORE", icon: Sun, color: "#f59e0b" };
  } else if (code >= 1 && code <= 3) {
    return { label: "LEICHT BEWÖLKT // MATRIX SHADE", icon: CloudSun, color: "#38bdf8" };
  } else if (code === 45 || code === 48) {
    return { label: "NEBEL // CYBER FOG", icon: Cloud, color: "#94a3b8" };
  } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return { label: "REGENFRONT // CYBER RAIN", icon: CloudRain, color: "#00f0ff" };
  } else if (code >= 71 && code <= 77) {
    return { label: "SCHNEEFALL // CRYO FROST", icon: Snowflake, color: "#a855f7" };
  } else if (code >= 95) {
    return { label: "GEWITTER // PLASMA STORM", icon: CloudLightning, color: "#ec4899" };
  }
  return { label: "BEWÖLKT // ATMOSPHERE ACTIVE", icon: Cloud, color: "#00f0ff" };
};

// Deterministic fallback for fictional/unmapped locations or offline state
const generateFallbackWeather = (locationName: string): WeatherData => {
  let hash = 0;
  for (let i = 0; i < locationName.length; i++) {
    hash = locationName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const baseTemp = 14 + (Math.abs(hash) % 18); // 14°C to 31°C
  const conditionCodes = [0, 1, 2, 61, 80, 95];
  const code = conditionCodes[Math.abs(hash) % conditionCodes.length];

  const currentHour = new Date().getHours();
  const hourly = Array.from({ length: 8 }).map((_, idx) => {
    const h = (currentHour + idx * 2) % 24;
    const timeStr = `${String(h).padStart(2, "0")}:00`;
    const tempVar = Math.sin((idx / 8) * Math.PI) * 4;
    return {
      time: timeStr,
      temp: Math.round(baseTemp + tempVar),
      code: idx % 3 === 0 ? code : 1,
    };
  });

  const days = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];
  const todayIdx = new Date().getDay();
  const daily = Array.from({ length: 5 }).map((_, idx) => {
    const dayName = days[(todayIdx + idx) % 7];
    return {
      day: dayName,
      tempMax: Math.round(baseTemp + 3 + (idx % 2)),
      tempMin: Math.round(baseTemp - 4 - (idx % 3)),
      code: idx === 0 ? code : (code + idx) % 3,
    };
  });

  return {
    city: locationName,
    country: "RADAR GRID",
    temp: Math.round(baseTemp),
    feelsLike: Math.round(baseTemp - 1),
    conditionCode: code,
    conditionText: getWeatherInfo(code).label,
    windSpeed: 12 + (Math.abs(hash) % 20),
    humidity: 45 + (Math.abs(hash) % 40),
    precipitationProb: (Math.abs(hash) % 6) * 15,
    uvIndex: 3 + (Math.abs(hash) % 6),
    hourly,
    daily,
    isLive: false,
  };
};

export const LocationWeatherWidget: React.FC<LocationWeatherWidgetProps> = ({
  activeMapData,
  setActiveMapData,
  isEditMode = false,
  onClose,
  agentColor = "#00f0ff",
}) => {
  const [currentCityInput, setCurrentCityInput] = useState("");
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extract active target city from activeMapData or fallback to default
  const activeLocation =
    activeMapData?.city ||
    activeMapData?.destination ||
    activeMapData?.origin ||
    "Tokyo Cyber Radar";

  const fetchWeatherForCity = async (cityName: string) => {
    if (!cityName.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Search Geocoding API from Open-Meteo
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cityName
      )}&count=1&language=de&format=json`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (geoData?.results && geoData.results.length > 0) {
        const place = geoData.results[0];
        const lat = place.latitude;
        const lon = place.longitude;
        const resolvedCity = place.name;
        const country = place.country_code ? place.country_code.toUpperCase() : place.country;

        // 2. Fetch Forecast Weather Data
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        const wData = await weatherRes.json();

        if (wData?.current_weather) {
          const cw = wData.current_weather;
          const currHourIdx = new Date().getHours();

          // Construct Hourly array
          const hourlyList = (wData.hourly?.time || []).slice(currHourIdx, currHourIdx + 8).map((tStr: string, idx: number) => {
            const timeFormatted = tStr.split("T")[1]?.substring(0, 5) || `${idx * 3}:00`;
            const hTemp = wData.hourly?.temperature_2m?.[currHourIdx + idx] ?? cw.temperature;
            const hCode = wData.hourly?.weather_code?.[currHourIdx + idx] ?? cw.weathercode;
            return {
              time: timeFormatted,
              temp: Math.round(hTemp),
              code: hCode,
            };
          });

          // Construct Daily array
          const daysOfWeek = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];
          const dailyList = (wData.daily?.time || []).slice(0, 5).map((dStr: string, idx: number) => {
            const dObj = new Date(dStr);
            const dayName = daysOfWeek[dObj.getDay()] || "TAG";
            const maxT = wData.daily?.temperature_2m_max?.[idx] ?? cw.temperature + 3;
            const minT = wData.daily?.temperature_2m_min?.[idx] ?? cw.temperature - 3;
            const dCode = wData.daily?.weather_code?.[idx] ?? cw.weathercode;
            return {
              day: dayName,
              tempMax: Math.round(maxT),
              tempMin: Math.round(minT),
              code: dCode,
            };
          });

          const currentHumidity = wData.hourly?.relative_humidity_2m?.[currHourIdx] ?? 60;
          const currentFeelsLike = wData.hourly?.apparent_temperature?.[currHourIdx] ?? cw.temperature;
          const currentPrecip = wData.hourly?.precipitation_probability?.[currHourIdx] ?? 10;

          const info = getWeatherInfo(cw.weathercode);

          setWeather({
            city: resolvedCity,
            country: country || "GLOBAL",
            lat,
            lon,
            temp: Math.round(cw.temperature),
            feelsLike: Math.round(currentFeelsLike),
            conditionCode: cw.weathercode,
            conditionText: info.label,
            windSpeed: Math.round(cw.windspeed),
            humidity: Math.round(currentHumidity),
            precipitationProb: Math.round(currentPrecip),
            uvIndex: Math.min(10, Math.round(cw.temperature / 4)),
            hourly: hourlyList,
            daily: dailyList,
            isLive: true,
          });
          setLoading(false);
          return;
        }
      }
      
      // Fallback if no geocode found
      setWeather(generateFallbackWeather(cityName));
    } catch (err) {
      console.warn("Weather API fetch error, using fallback matrix weather:", err);
      setWeather(generateFallbackWeather(cityName));
    } finally {
      setLoading(false);
    }
  };

  // Auto-update weather whenever activeLocation changes
  useEffect(() => {
    fetchWeatherForCity(activeLocation);
  }, [activeLocation]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCityInput.trim()) return;
    fetchWeatherForCity(currentCityInput);
    if (setActiveMapData) {
      setActiveMapData({ city: currentCityInput.trim(), isRoute: false });
    }
    setCurrentCityInput("");
  };

  const handleQuickCityClick = (city: string) => {
    fetchWeatherForCity(city);
    if (setActiveMapData) {
      setActiveMapData({ city, isRoute: false });
    }
  };

  const displayTemp = (tC: number) => {
    if (unit === "F") {
      return `${Math.round((tC * 9) / 5 + 32)}°F`;
    }
    return `${tC}°C`;
  };

  const weatherMeta = weather
    ? getWeatherInfo(weather.conditionCode)
    : { label: "ANALYZING...", icon: Cloud, color: "#00f0ff" };
  const WeatherIcon = weatherMeta.icon;

  return (
    <DraggableResizableWidget
      id="weatherWidget"
      title={`STANDORT WETTER :: ${(weather?.city || activeLocation).toUpperCase()}`}
      initialX={20}
      initialY={140}
      initialWidth={440}
      initialHeight={500}
      minWidth={320}
      minHeight={380}
      isEditMode={isEditMode}
      onClose={onClose}
    >
      <div className="flex flex-col h-full bg-slate-950/90 text-slate-100 font-sans p-3 overflow-y-auto space-y-3">
        {/* Header Search & Control Bar */}
        <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/20">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                value={currentCityInput}
                onChange={(e) => setCurrentCityInput(e.target.value)}
                placeholder="Ort suchen (z.B. Berlin, Tokyo, New York)..."
                className="w-full bg-slate-950/80 border border-cyan-500/30 rounded-lg pl-8 pr-2 py-1.5 text-xs font-mono text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <button
              type="submit"
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold rounded-lg cursor-pointer transition shadow-[0_0_10px_rgba(0,240,255,0.3)] flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>RADAR</span>
            </button>

            <button
              type="button"
              onClick={() => setUnit(unit === "C" ? "F" : "C")}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-mono text-xs font-bold rounded-lg cursor-pointer transition"
              title="Einheit wechseln (°C / °F)"
            >
              °{unit}
            </button>
          </form>

          {/* Quick Location Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 pt-1 no-scrollbar">
            <span className="font-mono text-[9px] text-slate-500 uppercase flex-shrink-0">
              QUICK:
            </span>
            {["Tokyo", "Berlin", "New York", "London", "Zürich", "Miami", "Sydney"].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleQuickCityClick(city)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer flex-shrink-0 border ${
                  weather?.city.toLowerCase().includes(city.toLowerCase())
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Main Weather Card */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 bg-slate-900/40 rounded-xl border border-cyan-500/10">
            <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin" />
            <span className="font-mono text-xs text-cyan-300 tracking-wider">
              SCANNE METEOROLOGISCHE RADARDATEN...
            </span>
          </div>
        ) : weather ? (
          <>
            <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/90 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,240,255,0.1)] flex flex-col justify-between gap-4">
              {/* Background ambient glow */}
              <div
                className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: weatherMeta.color }}
              />

              {/* Location Name & Sync Indicator */}
              <div className="flex items-start justify-between z-10">
                <div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-cyan-400 animate-bounce" />
                    <h3 className="font-mono font-bold text-base text-cyan-100 tracking-wide uppercase">
                      {weather.city}
                    </h3>
                    {weather.country && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                        {weather.country}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                    {weather.isLive ? "SATELLITEN LIVE-DATEN" : "MATRIX SYNC ESTIMATE"}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-cyan-950/60 border border-cyan-500/30 px-2 py-1 rounded-md text-[10px] font-mono text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Temperature & Main Weather Condition */}
              <div className="flex items-center justify-between z-10 my-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-extrabold text-4xl text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    {displayTemp(weather.temp)}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    / Gefühlt {displayTemp(weather.feelsLike)}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <div
                    className="p-2.5 rounded-xl border bg-slate-900/90 shadow-md flex items-center justify-center mb-1"
                    style={{ borderColor: `${weatherMeta.color}50` }}
                  >
                    <WeatherIcon className="w-7 h-7" style={{ color: weatherMeta.color }} />
                  </div>
                  <span
                    className="font-mono text-[10px] font-bold uppercase tracking-wider text-right"
                    style={{ color: weatherMeta.color }}
                  >
                    {weather.conditionText}
                  </span>
                </div>
              </div>

              {/* Grid Metrics: Wind, Humidity, Precipitation, UV */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-cyan-500/20 font-mono text-xs">
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex flex-col">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Wind className="w-3 h-3 text-cyan-400" />
                    <span>WIND</span>
                  </div>
                  <span className="font-bold text-cyan-200 mt-0.5">{weather.windSpeed} km/h</span>
                </div>

                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex flex-col">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    <span>FEUCHTIGKEIT</span>
                  </div>
                  <span className="font-bold text-cyan-200 mt-0.5">{weather.humidity}%</span>
                </div>

                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex flex-col">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <CloudRain className="w-3 h-3 text-cyan-400" />
                    <span>REGENCHANCE</span>
                  </div>
                  <span className="font-bold text-cyan-200 mt-0.5">
                    {weather.precipitationProb}%
                  </span>
                </div>

                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex flex-col">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>UV-INDEX</span>
                  </div>
                  <span className="font-bold text-amber-300 mt-0.5">{weather.uvIndex} / 10</span>
                </div>
              </div>
            </div>

            {/* Hourly Forecast Timeline */}
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-cyan-500/20 flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                ⚡ 12-STUNDEN PROGNOSE
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
                {weather.hourly.map((h, idx) => {
                  const info = getWeatherInfo(h.code);
                  const HIcon = info.icon;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1 p-2 min-w-[58px] bg-slate-950/80 border border-slate-800 rounded-lg font-mono text-[11px]"
                    >
                      <span className="text-[9px] text-slate-400">{h.time}</span>
                      <HIcon className="w-4 h-4 my-0.5" style={{ color: info.color }} />
                      <span className="font-bold text-cyan-200">{displayTemp(h.temp)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5-Day Outlook */}
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-cyan-500/20 flex flex-col gap-1.5">
              <span className="font-mono text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                📅 5-TAGE MATRIX PROGNOSE
              </span>
              <div className="grid grid-cols-5 gap-1 font-mono text-xs">
                {weather.daily.map((d, idx) => {
                  const info = getWeatherInfo(d.code);
                  const DIcon = info.icon;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1 p-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-center"
                    >
                      <span className="text-[10px] font-bold text-cyan-300">{d.day}</span>
                      <DIcon className="w-4 h-4 my-0.5" style={{ color: info.color }} />
                      <div className="flex flex-col text-[10px]">
                        <span className="font-bold text-slate-100">{displayTemp(d.tempMax)}</span>
                        <span className="text-slate-500">{displayTemp(d.tempMin)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </DraggableResizableWidget>
  );
};
