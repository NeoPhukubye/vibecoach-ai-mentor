import { useRef, useState, useCallback, useEffect } from "react";
import { useSignLanguage } from "@/lib/sign-language-context";

export interface RecognizedSign {
  gesture: string;
  confidence: number;
  timestamp: number;
}

interface UseSignRecognitionOptions {
  videoElement: HTMLVideoElement | null;
  onSign?: (sign: RecognizedSign) => void;
}

// Basic hand landmark gesture classification
// Maps hand poses to sign language letters based on finger positions
function classifyGesture(landmarks: Array<{ x: number; y: number; z: number }>): { gesture: string; confidence: number } | null {
  if (!landmarks || landmarks.length < 21) return null;

  // Key landmark indices for finger tips and bases
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const wrist = landmarks[0];
  const indexBase = landmarks[5];
  const middleBase = landmarks[9];
  const ringBase = landmarks[13];
  const pinkyBase = landmarks[17];

  // Check if fingers are extended (tip above base in y-axis, inverted for screen coords)
  const indexUp = indexTip.y < indexBase.y;
  const middleUp = middleTip.y < middleBase.y;
  const ringUp = ringTip.y < ringBase.y;
  const pinkyUp = pinkyTip.y < pinkyBase.y;
  const thumbOut = Math.abs(thumbTip.x - wrist.x) > 0.1;

  // Simple gesture classification
  if (!indexUp && !middleUp && !ringUp && !pinkyUp && !thumbOut) {
    return { gesture: "A", confidence: 0.7 }; // Fist = A
  }
  if (indexUp && middleUp && ringUp && pinkyUp && thumbOut) {
    return { gesture: "B", confidence: 0.75 }; // Open hand = B
  }
  if (indexUp && !middleUp && !ringUp && !pinkyUp) {
    return { gesture: "D", confidence: 0.7 }; // Index pointing = D
  }
  if (indexUp && middleUp && !ringUp && !pinkyUp) {
    return { gesture: "V", confidence: 0.8 }; // Peace sign = V
  }
  if (thumbOut && pinkyUp && !indexUp && !middleUp && !ringUp) {
    return { gesture: "Y", confidence: 0.75 }; // Hang loose = Y
  }
  if (indexUp && pinkyUp && !middleUp && !ringUp && thumbOut) {
    return { gesture: "I love you", confidence: 0.8 }; // ILY sign
  }
  if (thumbOut && indexUp && !middleUp && !ringUp && !pinkyUp) {
    return { gesture: "L", confidence: 0.7 }; // L shape
  }
  if (!indexUp && !middleUp && !ringUp && pinkyUp) {
    return { gesture: "I", confidence: 0.65 }; // Pinky up = I
  }
  if (indexUp && middleUp && ringUp && !pinkyUp) {
    return { gesture: "W", confidence: 0.7 }; // Three fingers = W
  }
  if (thumbOut && !indexUp && !middleUp && !ringUp && !pinkyUp) {
    return { gesture: "Thumbs up", confidence: 0.8 };
  }

  return { gesture: "?", confidence: 0.3 };
}

export function useSignRecognition({ videoElement, onSign }: UseSignRecognitionOptions) {
  const { settings } = useSignLanguage();
  const [isActive, setIsActive] = useState(false);
  const [lastSign, setLastSign] = useState<RecognizedSign | null>(null);
  const [recognizedText, setRecognizedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const handLandmarkerRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastGestureRef = useRef<string>("");
  const gestureCountRef = useRef(0);

  const startRecognition = useCallback(async () => {
    if (!videoElement || !settings.signRecognitionEnabled) return;

    try {
      const vision = await import("@mediapipe/tasks-vision");
      const { HandLandmarker, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      handLandmarkerRef.current = await HandLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });

      setIsActive(true);
      setError(null);
      detectFrame();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to initialize hand tracking");
      setIsActive(false);
    }
  }, [videoElement, settings.signRecognitionEnabled]);

  const detectFrame = useCallback(() => {
    if (!handLandmarkerRef.current || !videoElement || videoElement.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const result = handLandmarkerRef.current.detectForVideo(videoElement, performance.now());

    if (result.landmarks && result.landmarks.length > 0) {
      const classification = classifyGesture(result.landmarks[0]);
      if (classification && classification.confidence > 0.6) {
        // Require consistent gesture for 3 frames to confirm
        if (classification.gesture === lastGestureRef.current) {
          gestureCountRef.current++;
          if (gestureCountRef.current === 3) {
            const sign: RecognizedSign = {
              gesture: classification.gesture,
              confidence: classification.confidence,
              timestamp: Date.now(),
            };
            setLastSign(sign);
            setRecognizedText((prev) => prev + classification.gesture);
            onSign?.(sign);
          }
        } else {
          lastGestureRef.current = classification.gesture;
          gestureCountRef.current = 1;
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(detectFrame);
  }, [videoElement, onSign]);

  const stopRecognition = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    handLandmarkerRef.current?.close();
    handLandmarkerRef.current = null;
    setIsActive(false);
  }, []);

  const clearText = useCallback(() => {
    setRecognizedText("");
    setLastSign(null);
  }, []);

  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, [stopRecognition]);

  return {
    isActive,
    lastSign,
    recognizedText,
    error,
    startRecognition,
    stopRecognition,
    clearText,
  };
}
