"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "ai" }[]
  >([]);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  // Handle file selection for screenshot upload.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setScreenshot(e.target.files[0]);
    }
  };

  // Upload the screenshot to your API route (assumes it processes the image and returns extracted text).
  const uploadScreenshot = async () => {
    if (!screenshot) return;
    const formData = new FormData();
    formData.append("file", screenshot);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      // If the API returns extracted text, add it as a user message.
      if (data.text) {
        setMessages((prev) => [...prev, { text: data.text, sender: "user" }]);
      }
    } catch (error) {
      console.error("Error uploading screenshot:", error);
    }
  };

  // Send the chat message.
  const sendMessage = async () => {
    if (!input.trim()) return;
    // Add the user's message to the conversation.
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    const userInput = input;
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),
      });
      const data = await res.json();
      // Append the AI's reply to the conversation.
      setMessages((prev) => [...prev, { text: data.reply, sender: "ai" }]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          AI Chatbot
        </h1>

        {/* Screenshot upload area */}
        <div className="mb-4 flex items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-gray-900"
          />
          <button
            className="bg-green-500 text-white px-4 py-2 ml-2 rounded hover:bg-green-600 transition-colors"
            onClick={uploadScreenshot}
          >
            Upload Screenshot
          </button>
        </div>

        {/* Chat messages container */}
        <div className="h-64 overflow-y-auto border rounded p-4 mb-6 bg-gray-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 my-2 rounded-lg max-w-[80%] break-words ${
                msg.sender === "user"
                  ? "bg-blue-200 self-end text-gray-900"
                  : "bg-gray-300 self-start text-gray-900"
              }`}
            >
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          ))}
        </div>

        {/* Input field and Send button */}
        <div className="flex">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
          />
          <button
            className="bg-blue-500 text-white px-6 py-3 ml-3 rounded hover:bg-blue-600 transition-colors"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
