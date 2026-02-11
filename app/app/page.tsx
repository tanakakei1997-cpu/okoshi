'use client';

import { useState } from 'react';

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');

  const upload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setText(data.text || '文字起こし結果がありません');
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>文字起こしテスト</h1>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <br /><br />

      <button onClick={upload}>文字起こしする</button>

      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 20 }}>
        {text}
      </pre>
    </main>
  );
}
