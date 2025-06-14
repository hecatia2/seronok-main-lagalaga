
"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [image, setImage] = useState(null);
  const [engines, setEngines] = useState({});
  const [selectedEngine, setSelectedEngine] = useState("waifu2x");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [scale, setScale] = useState(2);
  const [noise, setNoise] = useState(0);
  const [format, setFormat] = useState("png");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Fetch engine/model
  useEffect(() => {
    fetch(`${BACKEND_URL}/available-engines`)
      .then(res => res.json())
      .then(data => {
        setEngines(data.engines);
        setSelectedEngine(Object.keys(data.engines)[0]);
      });
  }, [BACKEND_URL]);

  useEffect(() => {
    if (engines[selectedEngine]) {
      setModels(engines[selectedEngine]);
      setSelectedModel(engines[selectedEngine][0]);
    }
  }, [selectedEngine, engines]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", image);
    formData.append("engine", selectedEngine);
    formData.append("model", selectedModel);
    formData.append("scale", scale);
    formData.append("noise", noise);
    formData.append("output_format", format);

    const res = await fetch(`${BACKEND_URL}/upscale`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const blob = await res.blob();
      setResult(URL.createObjectURL(blob));
    } else {
      alert("Upscale gagal");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen p-8 flex flex-col items-center bg-gray-50">
      <h1 className="text-2xl mb-4 font-bold">AI Image Upscaler</h1>
      <form onSubmit={handleUpload} className="space-y-4 w-full max-w-md bg-white rounded-xl shadow p-6">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
          className="block"
        />
        <div>
          <label className="block font-medium">Engine:</label>
          <select value={selectedEngine} onChange={e => setSelectedEngine(e.target.value)} className="w-full">
            {Object.keys(engines).map((eng) => (
              <option key={eng} value={eng}>{eng}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Model:</label>
          <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} className="w-full">
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <div>
            <label>Scale:</label>
            <input
              type="number"
              min={1} max={32}
              value={scale}
              onChange={e => setScale(e.target.value)}
              className="w-16 ml-2"
            />
          </div>
          <div>
            <label>Noise:</label>
            <input
              type="number"
              min={-1} max={3}
              value={noise}
              onChange={e => setNoise(e.target.value)}
              className="w-16 ml-2"
            />
          </div>
          <div>
            <label>Format:</label>
            <select value={format} onChange={e => setFormat(e.target.value)} className="ml-2">
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="webp">WEBP</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Processing..." : "Upscale"}
        </button>
      </form>

      {image && (
        <div className="mt-6">
          <div className="font-bold mb-2">Original:</div>
          <img
            src={URL.createObjectURL(image)}
            alt="input"
            className="max-w-xs border shadow rounded"
          />
        </div>
      )}

      {result && (
        <div className="mt-6">
          <div className="font-bold mb-2">Upscaled Result:</div>
          <img src={result} alt="result" className="max-w-xs border shadow rounded" />
          <a href={result} download="upscaled" className="block mt-2 text-blue-600 underline">
            Download
          </a>
        </div>
      )}
    </main>
  );
}

