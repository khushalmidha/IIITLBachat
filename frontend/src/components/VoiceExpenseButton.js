import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button, Spinner as BsSpinner } from "react-bootstrap";
import axios from "axios";
import { voiceExpenseAPI } from "../utils/ApiRequest";

const MAX_DURATION = 25; // seconds

const VoiceExpenseButton = ({ onTranscribed }) => {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState(MAX_DURATION);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError("");
      setTranscript("");
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);

        if (chunksRef.current.length === 0) {
          setError("No audio recorded");
          setRecording(false);
          return;
        }

        setRecording(false);
        setProcessing(true);

        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const base64 = await blobToBase64(blob);

          const { data } = await axios.post(voiceExpenseAPI, {
            audioBase64: base64,
            mimeType: "audio/webm",
          });

          if (data.success) {
            setTranscript(data.transcript || "");
            if (data.transaction) {
              onTranscribed(data.transaction);
            }
          } else {
            setError(data.message || "Could not process voice");
          }
        } catch (err) {
          setError(err.response?.data?.message || "Voice processing failed");
        } finally {
          setProcessing(false);
        }
      };

      mediaRecorder.start(250); // collect data every 250ms
      setRecording(true);
      setCountdown(MAX_DURATION);

      // Start countdown
      let remaining = MAX_DURATION;
      timerRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
          }
        }
      }, 1000);
    } catch (err) {
      setError("Microphone access denied. Please allow microphone access.");
      setRecording(false);
    }
  }, [onTranscribed]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {recording ? (
          <Button
            size="sm"
            variant="danger"
            onClick={stopRecording}
            style={{
              borderRadius: "50%",
              width: 42,
              height: 42,
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse-red 1.2s infinite",
            }}
          >
            ⏹
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={startRecording}
            disabled={processing}
            style={{
              borderRadius: "50%",
              width: 42,
              height: 42,
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #6C47FF, #8B6BFF)",
              border: "none",
            }}
            title="Speak to add expense (Hindi/Hinglish/English)"
          >
            {processing ? <BsSpinner size="sm" /> : "🎤"}
          </Button>
        )}

        {recording && (
          <span style={{ color: "#FF3B30", fontSize: 13, fontWeight: 700 }}>
            🔴 Recording... {countdown}s
          </span>
        )}
        {processing && (
          <span style={{ color: "#8B6BFF", fontSize: 13 }}>
            Processing voice...
          </span>
        )}
        {!recording && !processing && (
          <span style={{ color: "#6c757d", fontSize: 12 }}>
            Speak in Hindi, Hinglish, or English
          </span>
        )}
      </div>

      {transcript && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(108,71,255,0.08)",
            border: "1px solid rgba(108,71,255,0.2)",
            fontSize: 13,
            color: "#333",
          }}
        >
          💬 <em>"{transcript}"</em>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 6, color: "#dc3545", fontSize: 12 }}>
          ⚠️ {error}
        </div>
      )}

      <style>{`
        @keyframes pulse-red {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,59,48,0.4); }
          50% { box-shadow: 0 0 0 10px rgba(255,59,48,0); }
        }
      `}</style>
    </div>
  );
};

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const [, base64] = String(reader.result).split(",");
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

export default VoiceExpenseButton;
