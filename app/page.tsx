"use client";

import { useRef, useState } from "react";

type Segment = {
  start: number;
  end: number;
  text: string;        // 原文（変更不可）
  editedText?: string; // 記者が修正する文章
};
export default function Page() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const uploadAndTranscribe = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setSegments(data.segments || []);
    setLoading(false);
  };

  return (
    <main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1>音声文字起こし（Rimo風）</h1>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <br /><br />

      <button onClick={uploadAndTranscribe} disabled={loading}>
        {loading ? "文字起こし中…" : "文字起こしする"}
      </button>

      <br /><br />

      {file && (
        <audio
          ref={audioRef}
          controls
          src={URL.createObjectURL(file)}
          onTimeUpdate={(e) =>
            setCurrentTime(e.currentTarget.currentTime)
          }
        />
      )}

      <hr />

      <div style={{ lineHeight: 1.8 }}>
{segments.map((seg, i) => (
  <div
    key={i}
    style={{
      borderBottom: "1px solid #ddd",
      padding: "12px 0",
    }}
  >
    <div style={{ fontSize: 12, color: "#666" }}>
      [{seg.start.toFixed(2)} – {seg.end.toFixed(2)}]
      <button
        style={{ marginLeft: 8 }}
        onClick={() => {
          if (!audioRef.current) return;
          audioRef.current.currentTime = seg.start;
          audioRef.current.play();
        }}
      >
        ▶︎
      </button>
    </div>

    <div style={{ marginTop: 6 }}>
      <strong>原文：</strong>
      <div style={{ background: "#f5f5f5", padding: 6 }}>
        {seg.text}
      </div>
    </div>

    <div style={{ marginTop: 6 }}>
      <strong>修正：</strong>
      <textarea
        style={{ width: "100%", minHeight: 60 }}
        value={seg.editedText ?? seg.text}
        onChange={(e) => {
          const updated = [...segments];
          updated[i] = {
            ...seg,
            editedText: e.target.value,
          };
          setSegments(updated);
        }}
      />
    </div>
  </div>
))}      </div>
    </main>
  );
}
