// src/components/ImageUpload.tsx

import React, { useRef, useState } from "react";
import { Upload, X, Camera, AlertCircle } from "lucide-react";
import {
  validateImageFile,
  processImageFile,
  ProcessedImage,
} from "../utils/imageUtils";

interface ImageUploadProps {
  onImageSelect: (image: ProcessedImage | null) => void;
  selectedImage: ProcessedImage | null;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  selectedImage,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);

    try {
      const processedImage = await processImageFile(file);
      onImageSelect(processedImage);
    } catch (error) {
      console.error("Error processing image:", error);
      setError("Failed to process image. Please try another file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if user is trying to upload multiple files
      if (e.target.files && e.target.files.length > 1) {
        setError("Please upload only one image at a time.");
        return;
      }
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);

    if (files.length > 1) {
      setError("Please upload only one image at a time.");
      return;
    }

    const file = files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeImage = () => {
    onImageSelect(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="image-upload-container">
      {selectedImage ? (
        <div className="image-preview-container">
          <div className="image-preview">
            <img
              src={selectedImage.dataUrl}
              alt="Playlist vibe"
              className="preview-image"
            />
            <button
              className="remove-image-btn"
              onClick={removeImage}
              disabled={disabled}
            >
              <X size={16} />
            </button>
          </div>
          <p className="image-info">
            image will be used for playlist vibe and cover art
          </p>
        </div>
      ) : (
        <div
          className={`image-upload-area ${isProcessing ? "processing" : ""} ${
            disabled ? "disabled" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInputChange}
            style={{ display: "none" }}
            disabled={disabled}
          />

          <div className="upload-content">
            {isProcessing ? (
              <>
                <div className="processing-spinner">
                  <Camera size={24} />
                </div>
                <p>processing image...</p>
              </>
            ) : (
              <>
                <Upload size={24} />
                <p>
                  <span className="upload-primary">click to upload</span> or
                  drag image here
                </p>
                <p className="upload-secondary">jpg, png, webp • max 10mb</p>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="image-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
