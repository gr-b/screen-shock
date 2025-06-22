import { useState, useRef, useCallback } from 'react';

export const useScreenCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);
  const mediaStreamRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCapture = useCallback(async (onCapture) => {
    try {
      setError(null);
      
      // Request screen capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      mediaStreamRef.current = stream;
      
      // Create video element to capture frames
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      videoRef.current = video;

      // Create canvas for image processing
      const canvas = document.createElement('canvas');
      canvasRef.current = canvas;
      const ctx = canvas.getContext('2d');

      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Start capturing every 2 seconds
        captureIntervalRef.current = setInterval(() => {
          try {
            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0);
            
            // Convert to base64
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            const base64Data = imageData.split(',')[1];
            
            // Call the capture callback
            onCapture(base64Data);
            
          } catch (captureError) {
            console.error('Error capturing frame:', captureError);
          }
        }, 2000);

        setIsCapturing(true);
      });

      // Handle stream end (user stops sharing)
      stream.getTracks().forEach(track => {
        track.addEventListener('ended', () => {
          stopCapture();
        });
      });

    } catch (err) {
      console.error('Screen capture error:', err);
      setError(err.message || 'Failed to start screen capture');
      throw err;
    }
  }, []);

  const stopCapture = useCallback(() => {
    // Clear interval
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Clean up video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }

    setIsCapturing(false);
    setError(null);
  }, []);

  return {
    isCapturing,
    error,
    startCapture,
    stopCapture
  };
};