// src/components/CompactImageUpload.tsx

import React, { useRef, useState } from "react";
import { Image, X, Camera, AlertCircle } from "lucide-react";
import {
  validateImageFile,
  processImageFile,
  ProcessedImage,
} from "../utils/imageUtils";

interface CompactImageUploadProps {
  onImageSelect: (image: ProcessedImage | null) => void;
  selectedImage: ProcessedImage | null;
  disabled?: boolean;
}

const CompactImageUpload: React.FC<CompactImageUploadProps> = ({
  onImageSelect,
  selectedImage,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadArea, setShowUploadArea] = useState(false);

  const handleFileSelect = async (file: File) => {
    setError(null);

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);

    try {
      const processedImage = await processImageFile(file);
      onImageSelect(processedImage);
      setShowUploadArea(false);
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
      if (e.target.files && e.target.files.length > 1) {
        setError("Please upload only one image at a time.");
        return;
      }
      handleFileSelect(file);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = () => {
    onImageSelect(null);
    setError(null);
    setShowUploadArea(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleImageMode = () => {
    if (selectedImage) {
      removeImage();
    } else {
      setShowUploadArea(!showUploadArea);
      setError(null);
    }
  };

  return (
    <div className="compact-image-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        style={{ display: "none" }}
        disabled={disabled}
      />

      {/* Image Mode Toggle Button */}
      <button
        type="button"
        className={`image-toggle-btn ${selectedImage ? "active" : ""} ${
          showUploadArea ? "uploading" : ""
        }`}
        onClick={toggleImageMode}
        disabled={disabled || isProcessing}
        title={selectedImage ? "Remove image" : "Add image for playlist vibe"}
      >
        {isProcessing ? (
          <Camera size={16} className="processing-icon" />
        ) : selectedImage ? (
          <X size={16} />
        ) : (
          <Image size={16} />
        )}
      </button>

      {/* Compact Upload Area */}
      {showUploadArea && !selectedImage && (
        <div className="compact-upload-area">
          <div className="upload-options">
            <button
              type="button"
              className="upload-option-btn"
              onClick={openFileDialog}
              disabled={isProcessing}
            >
              <Image size={18} />
              choose image
            </button>
          </div>
          <p className="compact-upload-hint">jpg, png, webp • max 10mb</p>
        </div>
      )}

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="compact-image-preview">
          <div className="preview-container">
            <img
              src={selectedImage.dataUrl}
              alt="Playlist vibe"
              className="compact-preview-image"
            />
            <div className="preview-overlay">
              <span>image mode active</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="compact-image-error">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default CompactImageUpload;
