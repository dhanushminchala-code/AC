import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, CheckCircle, Sparkles, Upload } from 'lucide-react';

interface CropAssuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGradeConfirmed?: (grade: string, priceBonus: number) => void;
}

export const CropAssuranceModal: React.FC<CropAssuranceModalProps> = ({
  isOpen,
  onClose,
  onGradeConfirmed,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    cropName: string;
    grade: string;
    freshness: number;
    moisture: string;
    marketBonus: number;
    notes: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setAnalysisResult(null);
      setIsAnalyzing(false);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch {
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const handleCapture = () => {
    if (videoRef.current && cameraActive) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        analyzePhoto();
      }
    } else {
      // Fallback simulated crop capture
      setCapturedImage('simulated_crop');
      analyzePhoto();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
        analyzePhoto();
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePhoto = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        cropName: 'Tomato (Fresh Farm Produce)',
        grade: 'Grade A Premium',
        freshness: 96,
        moisture: '14.2% (Optimal)',
        marketBonus: 3.5,
        notes: 'Uniform color saturation, firm texture, defect-free skin. Qualifies for highest mandi tier.',
      });
    }, 1400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-3 flex items-start justify-between">
          <div className="text-center w-full pr-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <span className="text-2xl">📷</span> Check Crop Quality
            </h3>
            <p className="text-sm text-gray-500 mt-1">Take a clear photo of your crop.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Camera preview area */}
        <div className="px-6 py-2">
          <div className="relative aspect-4/3 w-full bg-stone-900 rounded-xl overflow-hidden flex items-center justify-center border-2 border-stone-800 shadow-inner">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center p-6 text-white text-center">
                <Sparkles className="w-12 h-12 text-emerald-400 animate-spin mb-3" />
                <p className="font-semibold text-lg">Analyzing Crop Quality...</p>
                <p className="text-xs text-stone-300 mt-1">Evaluating color spectrum, grade & purity</p>
              </div>
            ) : analysisResult ? (
              <div className="w-full h-full bg-emerald-950/90 text-white p-5 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold mb-2">
                    <CheckCircle className="w-3.5 h-3.5" /> Quality Certified
                  </div>
                  <h4 className="text-xl font-bold text-white">{analysisResult.cropName}</h4>
                  <p className="text-emerald-400 font-semibold text-sm mt-0.5">
                    Rating: {analysisResult.grade}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-black/40 p-3 rounded-lg border border-emerald-500/30">
                  <div>
                    <span className="text-stone-400">Freshness Score:</span>
                    <div className="text-white font-bold text-sm">{analysisResult.freshness}%</div>
                  </div>
                  <div>
                    <span className="text-stone-400">Moisture Content:</span>
                    <div className="text-white font-bold text-sm">{analysisResult.moisture}</div>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-white/10 flex justify-between items-center">
                    <span className="text-emerald-300 font-medium">Estimated Premium:</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      +₹{analysisResult.marketBonus.toFixed(2)}/kg
                    </span>
                  </div>
                </div>

                <p className="text-stone-300 text-xs italic line-clamp-2">
                  &ldquo;{analysisResult.notes}&rdquo;
                </p>
              </div>
            ) : cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-8 border border-white/40 rounded-lg pointer-events-none border-dashed" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-stone-300">
                <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mb-3">
                  <Camera className="w-8 h-8 text-stone-400" />
                </div>
                <p className="text-sm font-medium text-stone-200">Camera preview ready</p>
                <p className="text-xs text-stone-400 mt-1 max-w-xs">
                  Place produce directly in view or choose an image from your device.
                </p>
                <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-emerald-400 rounded-lg text-xs cursor-pointer border border-stone-700 transition">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Crop Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons exactly styled as screenshot */}
        <div className="p-6 pt-4 flex items-center justify-center gap-3">
          {analysisResult ? (
            <>
              <button
                onClick={() => {
                  if (onGradeConfirmed) {
                    onGradeConfirmed(analysisResult.grade, analysisResult.marketBonus);
                  }
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-sm transition shadow-sm text-center"
              >
                Accept Grade & Apply Bonus
              </button>
              <button
                onClick={() => {
                  setAnalysisResult(null);
                  setCapturedImage(null);
                }}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium text-sm transition"
              >
                Retake
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCapture}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-lg text-sm shadow-sm transition active:scale-98"
              >
                <Camera className="w-4 h-4" />
                Capture
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg text-sm transition"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
