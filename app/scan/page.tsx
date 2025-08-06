"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScanReceipt() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setError(null);
    setSuccessMessage(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        handleImageSelect(file);
      } else {
        setError("Please select an image file");
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageSelect(file);
    } else {
      setError("Please drop an image file");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/...;base64, prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleScrapeReceipt = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log("Starting receipt processing...");
      const base64Image = await convertToBase64(selectedImage);
      console.log("Image converted to base64, length:", base64Image.length);

      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64Image }),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
        throw new Error(
          `Failed to process receipt: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();
      console.log("API response data:", data);

      if (!data.items || !Array.isArray(data.items)) {
        throw new Error("Invalid response format from API");
      }

      // Show message if mock data was returned
      if (data.message) {
        console.log("API message:", data.message);
        setSuccessMessage(data.message);
      }

      // Store the extracted items in localStorage for the next page
      localStorage.setItem("extractedItems", JSON.stringify(data.items));

      // Navigate to edit receipt page after a short delay to show the message
      setTimeout(
        () => {
          router.push("/edit-receipt");
        },
        data.message ? 2000 : 500
      );
    } catch (err) {
      console.error("Receipt processing error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing the receipt"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="self-start mb-4 text-orange-500 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-2">Scan Receipt</h1>
      <p className="text-gray-500 mb-6 text-center">
        Take a photo or upload an image of your receipt
      </p>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 w-full max-w-md text-center cursor-pointer hover:border-orange-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        {imagePreview ? (
          <div className="space-y-4">
            <img
              src={imagePreview}
              alt="Receipt preview"
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-600">Click to change image</p>
          </div>
        ) : (
          <div className="space-y-4">
            <span className="text-6xl">📷</span>
            <div>
              <p className="text-black font-medium">Take a photo</p>
              <p className="text-gray-500">or upload receipt</p>
              <p className="text-sm text-gray-400 mt-2">
                Drag and drop an image here, or click to select
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p className="font-medium">Success!</p>
          <p className="text-sm">{successMessage}</p>
          <p className="text-xs mt-2 text-green-600">
            Redirecting to edit page...
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-medium">Error:</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 text-red-600">
            If you're testing, the app will use mock data when the image
            processing fails.
          </p>
        </div>
      )}

      {/* Scrape button */}
      <button
        onClick={handleScrapeReceipt}
        disabled={!selectedImage || isLoading}
        className="bg-orange-500 text-white px-8 py-3 rounded-lg shadow hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Processing..." : "Scrape the Bill"}
      </button>

      {selectedImage && (
        <p className="mt-4 text-sm text-gray-600">
          Selected: {selectedImage.name}
        </p>
      )}
    </main>
  );
}
