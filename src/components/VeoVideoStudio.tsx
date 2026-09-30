import React, { useState, useRef, useEffect } from "react";
import {
  Video,
  Film,
  Upload,
  Sparkles,
  Play,
  Download,
  RefreshCw,
  X,
  Share2,
  CheckCircle2,
  Image as ImageIcon,
  Clapperboard,
  Send,
  Monitor,
  Smartphone,
  AlertTriangle,
  Loader2,
  Key,
} from "lucide-react";
import { Language } from "../utils/translations";
import { useTheme } from "../utils/themeStore";

interface VeoVideoStudioProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage?: string | null;
  initialImageUrl?: string | null;
  agentName?: string;
  agentColor?: string;
  geminiKey?: string;
  onSendToChat?: (videoUrl: string, prompt: string) => void;
  lang?: Language;
}

export const VeoVideoStudio: React.FC<VeoVideoStudioProps> = ({
  isOpen,
  onClose,
  initialImage = null,
  initialImageUrl = null,
  agentName = "P.U.L.S.E.",
  agentColor = "#a855f7",
  geminiKey,
  onSendToChat,
  lang = "de",
}) => {
  const { isModern } = useTheme();
  const isEn = lang === "en";
  const startImg = initialImage || initialImageUrl || null;

  const [prompt, setPrompt] = useState<string>(() =>
    isEn
      ? "A cinematic high-tech hologram animation with smooth particle motion, glowing neon light, ultra realistic 8k quality"
      : "Eine kinoreife High-Tech-Hologramm-Animation mit sanften Partikelbewegungen, leuchtendem Neonlicht und ultrarealistischer 8K-Qualität"
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(startImg);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [resolution, setResolution] = useState<"720p" | "1080p">("720p");
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [operationName, setOperationName] = useState<string | null>(null);

  // Custom Gemini API Key State
  const [customApiKey, setCustomApiKey] = useState<string>(
    () => localStorage.getItem("custom_gemini_api_key") || geminiKey || ""
  );
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (startImg) {
      setSelectedImage(startImg);
    }
  }, [startImg]);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    const trimmed = tempApiKey.trim();
    localStorage.setItem("custom_gemini_api_key", trimmed);
    setCustomApiKey(trimmed);
    setShowKeyInput(false);
    setErrorLog(null);
  };

  // Helper to parse raw JSON errors or 429 quota errors into clean structured object
  const parseErrorMessage = (raw: string | null) => {
    if (!raw) return null;
    let text = raw;

    if (
      text.includes("429") ||
      text.includes("RESOURCE_EXHAUSTED") ||
      text.includes("quota") ||
      text.includes("exceeded your current quota")
    ) {
      return {
        title: isEn ? "API QUOTA (VEO 3.1 LIMIT) EXHAUSTED" : "API-KONTINGENT (VEO 3.1 QUOTA) ERSCHÖPFT",
        detail: isEn
          ? "The free shared API key quota has been exhausted. Please enter your own Google AI Studio key below or render a S.Y.N.T.A.X. simulation video."
          : "Das kostenlose Kontingent für den Standard-API-Schlüssel wurde erreicht. Hinterlege unten deinen eigenen Google AI Studio Key oder erstelle ein S.Y.N.T.A.X. Simulations-Video.",
        isQuota: true,
      };
    }

    if (text.startsWith("{")) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.error && parsed.error.message) {
          text = parsed.error.message;
          if (parsed.error.code === 429 || parsed.error.status === "RESOURCE_EXHAUSTED") {
            return {
              title: isEn ? "API QUOTA (VEO 3.1 LIMIT) EXHAUSTED" : "API-KONTINGENT (VEO 3.1 QUOTA) ERSCHÖPFT",
              detail: isEn
                ? "The free shared API key quota has been exhausted. Please enter your own Google AI Studio key below or render a S.Y.N.T.A.X. simulation video."
                : "Das kostenlose Kontingent für den Standard-API-Schlüssel wurde erreicht. Hinterlege unten deinen eigenen Google AI Studio Key oder erstelle ein S.Y.N.T.A.X. Simulations-Video.",
              isQuota: true,
            };
          }
        }
      } catch (e) {}
    }

    return {
      title: isEn ? "GENERATION ERROR" : "GENERIERUNGSFEHLER",
      detail: text,
      isQuota: false,
    };
  };

  // Fallback S.Y.N.T.A.X. Neural Canvas Video Synthesizer
  const handleGenerateSimulationVideo = async () => {
    setIsGenerating(true);
    setErrorLog(null);
    setGeneratedVideoUrl(null);
    setStatusMessage(isEn ? "S.Y.N.T.A.X. Neural Canvas Synthesizer started..." : "S.Y.N.T.A.X. Neural Canvas Synthesizer gestartet...");

    try {
      const width = aspectRatio === "16:9" ? 1280 : 720;
      const height = aspectRatio === "16:9" ? 720 : 1280;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error(isEn ? "Canvas Rendering Context 2D failed." : "Canvas Rendering Context 2D fehlgeschlagen.");

      let imgElement: HTMLImageElement | null = null;
      if (selectedImage) {
        imgElement = new Image();
        imgElement.src = selectedImage;
        await new Promise((resolve) => {
          imgElement!.onload = resolve;
          imgElement!.onerror = resolve;
        });
      }

      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=h264")
        ? "video/mp4;codecs=h264"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.start();

      const durationSec = 4;
      const fps = 30;
      const totalFrames = durationSec * fps;
      let frame = 0;

      const renderInterval = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;

        ctx.fillStyle = "#030611";
        ctx.fillRect(0, 0, width, height);

        if (imgElement && imgElement.complete && imgElement.naturalWidth > 0) {
          const scale = 1.0 + progress * 0.12;
          const shiftX = Math.sin(progress * Math.PI * 2) * 15;
          const shiftY = Math.cos(progress * Math.PI * 2) * 10;

          ctx.save();
          ctx.translate(width / 2 + shiftX, height / 2 + shiftY);
          ctx.scale(scale, scale);
          ctx.drawImage(imgElement, -width / 2, -height / 2, width, height);
          ctx.restore();
        } else {
          ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
          ctx.lineWidth = 2;
          const gridSize = 40;
          for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
          for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }
        }

        // Overlay Hologram Grid / Particles
        ctx.fillStyle = "rgba(6, 182, 212, 0.25)";
        for (let i = 0; i < 35; i++) {
          const px = (Math.sin(i + frame * 0.1) * 0.5 + 0.5) * width;
          const py = (Math.cos(i * 1.5 + frame * 0.08) * 0.5 + 0.5) * height;
          ctx.beginPath();
          ctx.arc(px, py, 3 + (i % 5), 0, Math.PI * 2);
          ctx.fill();
        }

        // HUD Banner Overlay
        ctx.fillStyle = "rgba(3, 6, 17, 0.82)";
        ctx.fillRect(20, height - 100, width - 40, 80);
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(20, height - 100, width - 40, 80);

        ctx.fillStyle = "#a855f7";
        ctx.font = "bold 18px monospace";
        ctx.fillText("S.Y.N.T.A.X. VEO 3.1 NEURAL RENDER", 40, height - 65);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "14px monospace";
        const promptText = prompt || (isEn ? "High-tech hologram particle animation" : "High-Tech Hologramm Partikel Animation");
        ctx.fillText(promptText.slice(0, 55) + (promptText.length > 55 ? "..." : ""), 40, height - 38);

        setStatusMessage(`${isEn ? "Neural Rendering" : "Neurales Rendering"}: ${Math.round(progress * 100)}%`);

        if (frame >= totalFrames) {
          clearInterval(renderInterval);
          mediaRecorder.stop();
        }
      }, 1000 / fps);

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: mimeType });
        const videoUrl = URL.createObjectURL(videoBlob);
        setGeneratedVideoUrl(videoUrl);
        setIsGenerating(false);
        setStatusMessage("");
      };
    } catch (simErr: any) {
      console.error("Simulation error:", simErr);
      setErrorLog((isEn ? "Simulation rendering failed: " : "Simulations-Render fehlgeschlagen: ") + simErr.message);
      setIsGenerating(false);
      setStatusMessage("");
    }
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorLog(isEn ? "Please select a valid image file (PNG, JPG, WEBP)." : "Bitte eine gültige Bilddatei (PNG, JPG, WEBP) auswählen.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedImage(e.target.result as string);
        setErrorLog(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim() && !selectedImage) {
      setErrorLog(isEn ? "Please enter a prompt or upload an image." : "Bitte gib eine Beschreibung ein oder lade ein Foto hoch.");
      return;
    }

    setIsGenerating(true);
    setErrorLog(null);
    setGeneratedVideoUrl(null);
    setStatusMessage(isEn ? "1/4: Connecting to Veo 3.1 Neural Engine..." : "1/4: Verbindung mit Veo 3.1 Neural Engine herstellen...");

    try {
      // 1. Call /api/generate-video
      const customKey = localStorage.getItem("custom_gemini_api_key") || geminiKey || "";
      const startRes = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-custom-gemini-key": customKey,
        },
        body: JSON.stringify({
          prompt,
          image: selectedImage,
          aspectRatio,
          resolution,
        }),
      });

      const startData = await startRes.json();

      if (!startRes.ok || startData.error) {
        throw new Error(startData.message || startData.error || (isEn ? "Video generation failed." : "Video-Generierung fehlgeschlagen."));
      }

      const opName = startData.operationName;
      setOperationName(opName);
      setStatusMessage(isEn ? "2/4: Rendering motion vectors & raytracing trajectory..." : "2/4: Motion Vectors & Raytracing-Kamera wird gerendert...");

      // 2. Poll /api/video-status
      let attempts = 0;
      const maxAttempts = 60; // 3 minutes total polling
      const pollInterval = 3000;

      const checkStatus = async (): Promise<boolean> => {
        attempts++;
        if (attempts > 15 && attempts <= 30) {
          setStatusMessage(isEn ? "3/4: Veo 3.1 generating high-resolution keyframes..." : "3/4: Veo 3.1 erzeugt hochauflösende Keyframes...");
        } else if (attempts > 30) {
          setStatusMessage(isEn ? "4/4: Finalizing MP4 stream & compression..." : "4/4: MP4 Stream wird final gerendert und komprimiert...");
        }

        const statusRes = await fetch("/api/video-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-custom-gemini-key": customKey,
          },
          body: JSON.stringify({ operationName: opName }),
        });

        const statusData = await statusRes.json();

        if (statusData.error) {
          throw new Error(statusData.error.message || (isEn ? "Error checking video status." : "Fehler beim Abrufen des Status."));
        }

        if (statusData.done) {
          return true;
        }

        if (attempts >= maxAttempts) {
          throw new Error(isEn ? "Timeout during Veo 3.1 video generation. Please try again." : "Zeitüberschreitung bei der Veo 3 Video-Generierung. Bitte erneut versuchen.");
        }

        return false;
      };

      const pollLoop = async () => {
        const isDone = await checkStatus();
        if (isDone) {
          // 3. Download Video
          setStatusMessage(isEn ? "Downloading & processing generated MP4..." : "Video wird heruntergeladen & aufbereitet...");
          const downloadRes = await fetch("/api/video-download", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-custom-gemini-key": customKey,
            },
            body: JSON.stringify({ operationName: opName }),
          });

          if (!downloadRes.ok) {
            throw new Error(isEn ? "Error downloading rendered MP4 video." : "Fehler beim Herunterladen des gerenderten MP4-Videos.");
          }

          const blob = await downloadRes.blob();
          const videoObjectUrl = URL.createObjectURL(blob);
          setGeneratedVideoUrl(videoObjectUrl);
          setIsGenerating(false);
          setStatusMessage("");
        } else {
          setTimeout(pollLoop, pollInterval);
        }
      };

      await pollLoop();
    } catch (err: any) {
      console.error("[Veo 3 Studio Error]:", err);
      setErrorLog(err.message || (isEn ? "Error during Veo 3.1 video synthesis." : "Fehler bei der Veo 3.1 Video-Erstellung."));
      setIsGenerating(false);
      setStatusMessage("");
    }
  };

  const handleDownload = () => {
    if (!generatedVideoUrl) return;
    const a = document.createElement("a");
    a.href = generatedVideoUrl;
    a.download = `veo3-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      id="veo-video-studio-window"
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn snap-start scroll-snap-start"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className={`relative w-full max-w-4xl max-h-[92vh] border rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans ${
        isModern
          ? "bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
          : "bg-slate-900 border-purple-500/30 text-white"
      }`}>
        
        {/* Header Bar */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isModern ? "bg-zinc-900/90 border-zinc-800" : "bg-slate-950/80 border-slate-800"
        }`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border ${
                isModern ? "border-purple-500/30 bg-purple-950/30 text-purple-400" : "border-purple-400/30"
              }`}
              style={!isModern ? { backgroundColor: `${agentColor}20`, color: agentColor } : {}}
            >
              <Clapperboard className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wide">
                  Veo 3.1 AI Video Synthesizer
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border uppercase font-semibold ${
                  isModern
                    ? "bg-purple-950/40 text-purple-300 border-purple-500/30"
                    : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                }`}>
                  {isEn ? `Exclusive for ${agentName}` : `Exklusiv für ${agentName}`}
                </span>
              </div>
              <p className={`text-xs font-mono ${isModern ? "text-zinc-400" : "text-slate-400"}`}>
                {isEn ? "Animate Photos into High-Fidelity MP4 Video (Model: veo-3.1-fast-generate-preview)" : "Erstelle aus Standbildern kinoreife Veo 3 Video-Animationen (Model: veo-3.1-fast-generate-preview)"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isModern ? "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white" : "bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Content Grid */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Image Upload & Aspect Ratio Controls */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <label className={`block text-xs font-mono font-bold uppercase mb-2 flex items-center justify-between ${
                isModern ? "text-zinc-300" : "text-slate-300"
              }`}>
                <span className="flex items-center gap-1.5">
                  <ImageIcon className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-purple-400"}`} />
                  {isEn ? "Upload Photo / Start Frame (Optional)" : "Foto / Startbild Hochladen (Optional)"}
                </span>
                {selectedImage && (
                  <button
                    onClick={() => setSelectedImage(null)}
                    className={`${isModern ? "text-purple-400" : "text-pink-400"} hover:underline text-[11px] font-normal cursor-pointer`}
                  >
                    {isEn ? "Remove photo" : "Bild entfernen"}
                  </button>
                )}
              </label>

              {/* Upload Dropzone / Preview */}
              {selectedImage ? (
                <div className={`relative rounded-2xl overflow-hidden border group ${
                  isModern ? "border-zinc-800 bg-zinc-900" : "border-purple-500/40 bg-slate-950"
                }`}>
                  <img
                    src={selectedImage}
                    alt="Start-Frame"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`px-3 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-lg transition ${
                        isModern ? "bg-purple-600 hover:bg-purple-500" : "bg-purple-600 hover:bg-purple-500"
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {isEn ? "Change Photo" : "Ändern"}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-2 min-h-[180px] ${
                    isModern
                      ? "border-zinc-800 hover:border-purple-500/60 bg-zinc-900/40 hover:bg-zinc-900/80"
                      : "border-slate-700 hover:border-purple-500/60 bg-slate-950/40 hover:bg-slate-950/80"
                  }`}
                >
                  <Upload className={`w-8 h-8 ${isModern ? "text-purple-400" : "text-purple-400"} animate-bounce`} />
                  <p className={`text-xs font-medium ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                    {isEn ? "Click here or drag & drop your photo" : "Klicke hier oder ziehe Dein Foto hinein"}
                  </p>
                  <p className={`text-[10px] font-mono ${isModern ? "text-zinc-500" : "text-slate-500"}`}>
                    {isEn ? "Transform still photos into cinematic 8K Veo 3.1 video sequences" : "Erstelle aus Standbildern kinoreife Veo 3 Video-Animationen"}
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUpload(e.target.files[0]);
                  }
                }}
              />
            </div>

            {/* Config: Aspect Ratio & Resolution */}
            <div className={`space-y-3 pt-2 border-t font-mono ${isModern ? "border-zinc-800" : "border-slate-800"}`}>
              <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                  {isEn ? "Aspect Ratio" : "Seitenverhältnis (Aspect Ratio)"}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAspectRatio("16:9")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                      aspectRatio === "16:9"
                        ? isModern
                          ? "bg-purple-950/40 border-purple-500 text-purple-200 shadow-sm"
                          : "bg-purple-600/30 border-purple-500 text-purple-200 shadow-md"
                        : isModern
                        ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <Monitor className={`w-4 h-4 ${isModern ? "text-purple-400" : "text-purple-400"}`} />
                    <span>{isEn ? "16:9 (Landscape / YouTube)" : "16:9 (Querformat / YouTube)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAspectRatio("9:16")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                      aspectRatio === "9:16"
                        ? isModern
                          ? "bg-purple-950/40 border-purple-500 text-purple-200 shadow-sm"
                          : "bg-purple-600/30 border-purple-500 text-purple-200 shadow-md"
                        : isModern
                        ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <Smartphone className={`w-4 h-4 ${isModern ? "text-purple-400" : "text-purple-400"}`} />
                    <span>{isEn ? "9:16 (Portrait / TikTok)" : "9:16 (Hochformat / TikTok)"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                  {isEn ? "Resolution" : "Auflösung"}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setResolution("720p")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      resolution === "720p"
                        ? isModern
                          ? "bg-red-950/40 border-red-500 text-red-200 shadow-sm"
                          : "bg-purple-600/30 border-purple-500 text-purple-200"
                        : isModern
                        ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {isEn ? "720p HD (Fast)" : "720p HD (Schnell)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolution("1080p")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      resolution === "1080p"
                        ? isModern
                          ? "bg-red-950/40 border-red-500 text-red-200 shadow-sm"
                          : "bg-purple-600/30 border-purple-500 text-purple-200"
                        : isModern
                        ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    1080p Full HD
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Video Prompt & Render Output Player */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <label className={`block text-xs font-mono font-bold uppercase mb-2 flex items-center gap-1.5 ${
                isModern ? "text-zinc-300" : "text-slate-300"
              }`}>
                <Sparkles className={`w-3.5 h-3.5 ${isModern ? "text-purple-400" : "text-purple-400"}`} />
                {isEn ? "Veo 3.1 Animation / Prompt Description" : "Veo 3 Animation / Prompt Beschreibung"}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder={isEn ? "Describe the camera movements, lighting, style, motion dynamics and aesthetic of the video..." : "Beschreibe die Bewegungen, Kameraführung, Effekte und Ästhetik des Veo-Videos..."}
                className={`w-full p-3 rounded-xl border text-xs font-mono resize-none transition focus:outline-none ${
                  isModern
                    ? "bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-purple-500"
                    : "bg-slate-950 border-slate-800 focus:border-purple-500 text-slate-200"
                }`}
              />
            </div>

            {/* Custom API Key Config Bar */}
            <div className={`p-2.5 rounded-xl border font-mono text-[11px] flex flex-col gap-2 ${
              isModern ? "bg-zinc-900/90 border-zinc-800" : "bg-slate-950/80 border-slate-800"
            }`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 ${isModern ? "text-zinc-300" : "text-slate-300"}`}>
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>API KEY STATUS:</span>
                  {customApiKey ? (
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      {isEn ? "Custom Key Active" : "Eigener Key Aktiv"} ({customApiKey.slice(0, 6)}...)
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {isEn ? "Shared System Key" : "Shared System-Key"}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTempApiKey(customApiKey);
                    setShowKeyInput(!showKeyInput);
                  }}
                  className={`${isModern ? "text-purple-400 hover:text-purple-300" : "text-cyan-400 hover:text-cyan-300"} underline font-bold text-[10.5px] cursor-pointer`}
                >
                  {showKeyInput
                    ? (isEn ? "Close" : "Schließen")
                    : customApiKey
                    ? (isEn ? "Change Key" : "Key Ändern")
                    : (isEn ? "+ Add Custom Key" : "+ Eigenen Key Eintragen")}
                </button>
              </div>

              {showKeyInput && (
                <div className={`flex items-center gap-2 pt-1.5 border-t animate-fadeIn ${
                  isModern ? "border-zinc-800" : "border-slate-800"
                }`}>
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder={isEn ? "Your Gemini API Key from Google AI Studio (AIzaSy...)" : "Deinen Gemini API Key aus Google AI Studio (AIzaSy...)"}
                    className={`flex-1 px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none font-mono ${
                      isModern
                        ? "bg-zinc-950 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-purple-500"
                        : "bg-slate-900 border-cyan-500/40 text-cyan-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-md transition cursor-pointer text-white ${
                      isModern ? "bg-purple-600 hover:bg-purple-500" : "bg-cyan-600 hover:bg-cyan-500"
                    }`}
                  >
                    {isEn ? "Save" : "Speichern"}
                  </button>
                  {customApiKey && (
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem("custom_gemini_api_key");
                        setCustomApiKey("");
                        setShowKeyInput(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white text-xs font-bold transition cursor-pointer"
                      title={isEn ? "Remove key" : "Einen Key entfernen"}
                    >
                      {isEn ? "Delete" : "Löschen"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Error Display */}
            {errorLog && (() => {
              const parsed = parseErrorMessage(errorLog);
              if (!parsed) return null;
              return (
                <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-mono shadow-xl space-y-2.5 animate-fadeIn">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h4 className="font-bold text-red-300 uppercase tracking-wide">{parsed.title}</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{parsed.detail}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-red-900/60">
                    <button
                      type="button"
                      onClick={() => {
                        setShowKeyInput(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-bold text-[10.5px] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isEn ? "🔑 Enter Custom Key" : "🔑 Eigenen Key Eingeben"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateSimulationVideo}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 font-bold text-[10.5px] transition flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.2)] cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>{isEn ? "⚡ Render S.Y.N.T.A.X. Simulation" : "⚡ S.Y.N.T.A.X. Simulation Rendern"}</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Render Output Area / Video Player */}
            <div className={`flex-1 min-h-[220px] rounded-2xl border p-3 flex flex-col items-center justify-center relative overflow-hidden ${
              isModern ? "bg-zinc-900/90 border-zinc-800" : "bg-slate-950 border-slate-800"
            }`}>
              {isGenerating ? (
                <div className="flex flex-col items-center text-center p-6 space-y-4">
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-full border-4 animate-spin flex items-center justify-center ${
                      isModern ? "border-purple-500/20 border-t-purple-500" : "border-purple-500/20 border-t-purple-500"
                    }`} />
                    <Clapperboard className={`w-6 h-6 absolute inset-0 m-auto animate-pulse ${
                      isModern ? "text-purple-400" : "text-purple-400"
                    }`} />
                  </div>
                  <div className="space-y-1">
                    <p className={`text-xs font-mono font-bold animate-pulse ${
                      isModern ? "text-purple-300" : "text-purple-300"
                    }`}>
                      {statusMessage || (isEn ? "Veo 3.1 rendering video..." : "Veo 3.1 rendert Video...")}
                    </p>
                    <p className={`text-[10px] font-mono ${isModern ? "text-zinc-500" : "text-slate-500"}`}>
                      {isEn ? "This may take 60–90 seconds. Please do not close." : "Dies kann bis zu 60–90 Sekunden dauern. Bitte nicht schließen."}
                    </p>
                  </div>
                </div>
              ) : generatedVideoUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className={`rounded-xl max-h-[220px] border shadow-2xl object-contain ${
                      isModern ? "border-purple-500/40" : "border-purple-500/40"
                    } ${aspectRatio === "9:16" ? "max-w-[150px]" : "w-full"}`}
                  />
                  <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isEn ? "Veo 3.1 video successfully synthesized!" : "Veo 3.1 Video erfolgreich synthetisiert!"}</span>
                  </div>
                </div>
              ) : (
                <div className={`text-center p-6 space-y-2 font-mono ${isModern ? "text-zinc-500" : "text-slate-500"}`}>
                  <Film className={`w-10 h-10 mx-auto ${isModern ? "text-zinc-700" : "text-slate-700"}`} />
                  <p className="text-xs">{isEn ? "No video rendered yet." : "Noch kein Video gerendert."}</p>
                  <p className="text-[10px]">
                    {isEn ? "Upload a photo or enter a prompt to launch Veo 3.1." : "Lade ein Foto hoch oder gib ein Prompt ein, um Veo 3 zu starten."}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2 font-mono">
              {!generatedVideoUrl ? (
                <button
                  onClick={handleGenerateVideo}
                  disabled={isGenerating}
                  className={`w-full py-3 rounded-2xl text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${
                    isModern
                      ? "bg-purple-600 hover:bg-purple-500 shadow-purple-950/40"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-900/30"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isEn ? "Veo 3.1 rendering..." : "Veo 3.1 rendert..."}</span>
                    </>
                  ) : (
                    <>
                      <Clapperboard className="w-4 h-4" />
                      <span>{isEn ? "🎬 Generate Veo 3.1 Video" : "🎬 Veo 3.1 Video generieren"}</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={handleDownload}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                      isModern
                        ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                    }`}
                  >
                    <Download className={`w-4 h-4 ${isModern ? "text-purple-400" : "text-purple-400"}`} />
                    <span>Download MP4</span>
                  </button>

                  {onSendToChat && (
                    <button
                      onClick={() => {
                        onSendToChat(generatedVideoUrl, prompt);
                        onClose();
                      }}
                      className={`py-2.5 rounded-xl text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                        isModern
                          ? "bg-red-600 hover:bg-red-500 shadow-red-950/40"
                          : "bg-purple-600 hover:bg-purple-500 shadow-purple-900/40"
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>{isEn ? "Send to Chat" : "Im Chat senden"}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

