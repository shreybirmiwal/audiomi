import React, { useState, useEffect } from "react";
import "tailwindcss/tailwind.css";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const uid = new URLSearchParams(window.location.search).get("uid");
  const [musicInput, setMusicInput] = useState("");
  const [uploadedSheet, setUploadedSheet] = useState(null);
  const [savedMusic, setSavedMusic] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (uid) {
      const fetchMusic = async () => {
        setLoading(true);
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSavedMusic(data.musicCode || []);
        }
        setLoading(false);
      };
      fetchMusic();
    }
  }, [uid]);

  const saveMusic = async (musicCode) => {
    if (!uid) {
      alert("User ID not found. Please provide a valid user ID.");
      console.log("User ID not found. Please provide a valid user ID.");
      return
    };

    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { musicCode });
      setSavedMusic(musicCode);
    } catch (error) {
      console.error("Error saving music:", error);
    }
  };

  const handleManualInputSave = () => {
    if (!musicInput.trim()) {
      alert("Please enter a valid music input.");
      console.log("Please enter a valid music input.");
      return;
    }
    const musicCode = parseMusicInput(musicInput);
    saveMusic(musicCode);
    setMusicInput("");
  };

  const handleSheetUpload = () => {
    if (!uploadedSheet) return;
    const musicCode = extractMusicFromSheet(uploadedSheet);
    saveMusic(musicCode);
    setUploadedSheet(null);
  };

  const parseMusicInput = (input) => {
    // Example of converting user input into a structured format
    // Input: "A1, B2, C#4"
    // Output: [{ note: "A", duration: 1 }, { note: "B", duration: 2 }, ...]
    return input.split(",").map((item) => {
      const [note, duration] = item.trim().split(/(\d+)/);
      return { note, duration: parseInt(duration) };
    });
  };

  const extractMusicFromSheet = (file) => {
    // Placeholder for GPT API integration to extract music from the sheet
    console.log("Extracting music from:", file);
    return [{ note: "C", duration: 4 }, { note: "D", duration: 2 }]; // Example output
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Music Practice Tracker
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-6">
            {/* Display saved music */}
            {savedMusic.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-700">
                  Saved Music:
                </h2>
                <ul className="list-disc pl-6 text-gray-600">
                  {savedMusic.map((item, index) => (
                    <li key={index}>
                      {item.note} (Duration: {item.duration})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Manual Input Section */}
            <div>
              <label
                htmlFor="manualInput"
                className="block text-sm font-medium text-gray-700"
              >
                Manually Input Music
              </label>
              <input
                type="text"
                id="manualInput"
                className="mt-1 p-3 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., A1, B2, C4"
                value={musicInput}
                onChange={(e) => setMusicInput(e.target.value)}
              />
              <button
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                onClick={handleManualInputSave}
              >
                Save Music
              </button>
            </div>

            {/* Upload Sheet Music Section */}
            <div>
              <label
                htmlFor="sheetUpload"
                className="block text-sm font-medium text-gray-700"
              >
                Upload Sheet Music (Image)
              </label>
              <input
                type="file"
                id="sheetUpload"
                className="mt-1 block w-full text-gray-500"
                accept="image/*"
                onChange={(e) => setUploadedSheet(e.target.files[0])}
              />
              <button
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                onClick={handleSheetUpload}
              >
                Extract & Save Music
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
