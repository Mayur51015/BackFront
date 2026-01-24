import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';

const FaceCapture = ({ onCapture }) => {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const videoConstraints = {
        width: 480,
        height: 480,
        facingMode: "user"
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
        onCapture(imageSrc);
    }, [webcamRef, onCapture]);

    const retake = () => {
        setImgSrc(null);
        onCapture(null);
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-white/5 shadow-2xl bg-black/40 group">
                {!imgSrc ? (
                    <div className="relative">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            onUserMedia={() => setIsCapturing(true)}
                            className="w-full max-w-[320px] aspect-square object-cover"
                        />
                        {!isCapturing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        )}
                    </div>
                ) : (
                    <img src={imgSrc} alt="capture" className="w-full max-w-[320px] aspect-square object-cover animate-in" />
                )}

                {/* Decorative Frame */}
                <div className="absolute inset-4 border border-white/10 rounded-[2rem] pointer-events-none group-hover:border-primary/30 transition-colors"></div>
            </div>

            <div className="flex gap-4">
                {!imgSrc ? (
                    <button
                        onClick={capture}
                        disabled={!isCapturing}
                        className="btn-premium flex items-center gap-2"
                    >
                        <Camera size={18} /> Capture Identity
                    </button>
                ) : (
                    <button onClick={retake} className="btn-premium !from-red-600 !to-red-800 shadow-[0_8px_20px_rgba(239,68,68,0.2)] flex items-center gap-2">
                        <RefreshCw size={18} /> Re-Initialize
                    </button>
                )}
            </div>

            {imgSrc && (
                <div className="text-emerald-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] animate-slide-up">
                    <CheckCircle size={14} /> Biometric Data Ready
                </div>
            )}
        </div>
    );
};

export default FaceCapture;
