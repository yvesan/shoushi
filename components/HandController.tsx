import React, { useEffect, useRef } from 'react';

interface HandControllerProps {
  onHandSpread: (spread: number) => void;
  onCameraStatus: (ready: boolean) => void;
  onError: (error: string) => void;
}

const HandController: React.FC<HandControllerProps> = ({ onHandSpread, onCameraStatus, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastVideoTimeRef = useRef(-1);
  const requestRef = useRef<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const landmarkerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      try {
        // 1. Check support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           throw new Error("NOT_SUPPORTED");
        }

        // 2. Request Camera
        // Using basic constraints to maximize compatibility
        // Explicitly requesting video: true lets browser choose default capable device
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        
        // If unmounted while waiting for stream, stop it immediately
        if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for video to actually be ready to play
          await new Promise<void>((resolve, reject) => {
             if (!videoRef.current) return resolve();
             videoRef.current.onloadedmetadata = () => {
                 if (!videoRef.current) return;
                 videoRef.current.play().then(resolve).catch(e => {
                     // Autoplay policy might block, but usually muted video is fine
                     console.warn("Video play warning:", e);
                     resolve(); // Continue anyway, loop will verify readyState
                 });
             };
             videoRef.current.onerror = (e) => reject(e);
          });
        }

        // 3. Load MediaPipe
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { FilesetResolver, HandLandmarker } = await import("https://esm.sh/@mediapipe/tasks-vision@0.10.14");

        if (!isMounted) return;

        const visionGen = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );

        if (!isMounted) return;

        landmarkerRef.current = await HandLandmarker.createFromOptions(visionGen, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        if (isMounted) {
          onCameraStatus(true);
          loop();
        }

      } catch (err: any) {
        console.error("Initialization failed:", err);
        let msg = "初始化失败，请刷新页面重试";
        
        if (err.message === "NOT_SUPPORTED") {
            msg = "您的浏览器不支持摄像头访问，或者当前环境不安全(需要HTTPS)。";
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            msg = "权限被拒绝。请检查：1.浏览器地址栏权限 2.操作系统(Windows/Mac)隐私设置是否允许浏览器使用摄像头。";
        } else if (err.name === 'NotFoundError') {
            msg = "未检测到摄像头设备，请连接摄像头后刷新。";
        } else if (err.name === 'NotReadableError') {
            msg = "摄像头可能被其他应用(如会议软件)占用，请关闭它们后刷新页面。";
        } else if (err.message && err.message.includes("dynamically imported")) {
            msg = "网络错误：无法加载AI模型，请检查网络连接。";
        }
        
        if (isMounted) onError(msg);
      }
    };

    setup();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (landmarkerRef.current) {
          try {
            landmarkerRef.current.close();
          } catch (e) {
            // Ignore close errors if it wasn't fully ready
          }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loop = () => {
    if (videoRef.current && videoRef.current.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      
      if (landmarkerRef.current && videoRef.current.readyState >= 2) {
        const result = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
        
        if (result.landmarks && result.landmarks.length > 0) {
          const landmarks = result.landmarks[0];
          const thumb = landmarks[4];
          const index = landmarks[8];
          
          const distance = Math.sqrt(
            Math.pow(thumb.x - index.x, 2) +
            Math.pow(thumb.y - index.y, 2) +
            Math.pow(thumb.z - index.z, 2)
          );

          // Calibrate sensitivity
          const minD = 0.03;
          const maxD = 0.20;
          const normalized = Math.min(Math.max((distance - minD) / (maxD - minD), 0), 1);
          
          onHandSpread(normalized);
        } else {
          onHandSpread(0);
        }
      }
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  return (
    <video 
      ref={videoRef} 
      className="absolute bottom-4 right-4 w-32 h-24 object-cover rounded-lg border-2 border-white/20 opacity-80 z-50 transform scale-x-[-1] hidden md:block pointer-events-none"
      playsInline 
      muted
    />
  );
};

export default HandController;