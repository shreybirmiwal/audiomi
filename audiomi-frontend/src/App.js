import React, { useState, useEffect } from "react";
import "tailwindcss/tailwind.css";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import OpenAI from "openai";
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["JPG", "PNG"];


function App() {
  const uid = new URLSearchParams(window.location.search).get("uid");
  const [musicInput, setMusicInput] = useState("");
  const [savedMusic, setSavedMusic] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const client = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  useEffect(() => {
    if (uid) {
      const fetchMusic = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setSavedMusic(data.musicCode || []);
          }
        } catch (error) {
          console.error("Error fetching music:", error);
          setError("Failed to fetch saved music.");
        }
        setLoading(false);
      };
      fetchMusic();
    }
  }, [uid]);

  const extractMusicFromSheet = async (file) => {
    setLoading(true);
    setError(null);

    const base64Image = await getBase64(file);

    // GPT prompt for music sheet analysis
    const jsonOutput = JSON.stringify({
      musicCode: [{
        note: "a",
        duration: 1,
      }, {
        note: "b",
        duration: 2,
      }, {
        note: "c",
        duration: 3,
      }],
    });

    const promptText = `
        You are a music theory assistant. Given an image of a music sheet, extract the musical notes and durations as JSON. Note should be the note. Duration should be 'length' relative in beats. smallest 'length' unit should be 1. So c1 mean c note for 1 beat (or smallest unit)
        Return in JSON format:
        ${jsonOutput}
      `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          "role": "user",
          "content": [
            { "type": "text", "text": promptText },
            { type: "image_url", image_url: { url: base64Image } } // Remove "data:image/png;base64," prefix
          ],
        }
      ],
      temperature: 0,
      response_format: { "type": "json_object" },
      //max_tokens = 300,
    });

    console.log("Response:", response);

    const extractedMusic = JSON.parse(response.choices[0].message.content);
    console.log("Extracted music:", extractedMusic);

    saveMusic(extractedMusic.musicCode);

    setLoading(false);
  };

  const saveMusic = async (musicCode) => {
    try {
      if (!uid) {
        throw new Error("User ID not found. Please provide a valid user ID.");
      }

      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { musicCode });
      setSavedMusic(musicCode);
    } catch (error) {
      console.error("Error saving music:", error);
      setError("Failed to save extracted music.");
    }
  };

  const handleManualInputSave = () => {
    if (!musicInput.trim()) {
      alert("Please enter a valid music input.");
      return;
    }
    const musicCode = parseMusicInput(musicInput);
    saveMusic(musicCode);
    setMusicInput("");
  };

  const parseMusicInput = (input) => {
    return input.split(",").map((item) => {
      const [note, duration] = item.trim().split(/(\d+)/);
      return { note, duration: parseInt(duration) || 0 };
    });
  };


  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };



  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Music Practice Tracker
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Processing...</p>
        ) : (
          <div className="space-y-6">
            {error && <p className="text-red-500 text-sm">{error}</p>}

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
                placeholder="e.g., a1, b2, c4"
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

            <div>
              <label
                htmlFor="sheetUpload"
                className="block text-sm font-medium text-gray-700"
              >
                Upload Sheet Music (Image) [**HIGHLY EXPERIMENTAL**]
              </label>

              <FileUploader handleChange={extractMusicFromSheet} name="file" types={fileTypes} />


            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
