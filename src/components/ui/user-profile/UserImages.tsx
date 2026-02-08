'use client';
import React, { useState } from 'react';
import { Typography, Box } from "@mui/material";
import FileUpload from "react-material-file-upload";
import Modal from '../modal';
import { Plus, X } from "lucide-react";
import Button from "../button/Button";
import "react-photo-album/rows.css";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Captions from "yet-another-react-lightbox/plugins/captions";

type Image = {
  _id: string;
  src: string;
  date: string | Date;
};

type Props = {
  patient: {
    patientId: string;
    images: Image[];
  };
};

export default function UserImages({ patient }: Props) {
  const [images, setImages] = useState<Image[]>(patient.images || []);
  const [uploadImages, setUploadImages] = useState<File[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [index, setIndex] = useState<number>(-1);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image? This action cannot be undone.")) return;

    // Optimistically remove from UI
    setImages((prev) => prev.filter((img) => img._id !== id));

    try {
      const response = await fetch(`/api/patients/${patient.patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteImageIds: [id] }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete image");
    } catch (error) {
      console.error("Error deleting image:", error);
      // Optional: Restore image to state if API fails
      alert("Failed to delete image. Please try again.");
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const formData = new FormData();
      uploadImages.forEach((file) => {
        formData.append('newImages', file);
      });

      const res = await fetch(`/api/patients/${patient.patientId}`, {
        method: 'PATCH',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to upload images");

      setImages(data.data.images || []);
      setUploadImages([]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving images:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white/90">Patient Gallery</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <div key={img._id} className="relative group cursor-pointer">
              <img
                src={img.src}
                alt={`Patient record ${i + 1}`}
                onClick={() => setIndex(i)}
                className="w-full h-32 md:h-48 object-cover rounded-md border border-gray-100 dark:border-gray-700"
              />
              <button
                onClick={() => handleDelete(img._id)}
                className="absolute top-2 right-2 bg-red-600 bg-opacity-80 text-white rounded-full p-1 hidden group-hover:flex items-center justify-center transition-all hover:bg-opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <Lightbox
          slides={images.map((img) => ({
            src: img.src,
            width: 1200,
            height: 800,
            description: img.date
              ? `Uploaded on: ${new Date(img.date).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Date unavailable",
          }))}
          open={index >= 0}
          index={index}
          close={() => setIndex(-1)}
          plugins={[Fullscreen, Slideshow, Thumbnails, Zoom, Captions]}
          carousel={{ finite: true }}
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex text-sm items-center gap-2 px-4 py-2 mt-6 text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Photos / Edit
        </button>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isFullscreen>
          <div className="p-6">
            <h4 className="text-xl font-semibold mb-6">Manage Patient Photos</h4>

            <Box className="mt-4">
              <Typography className="mb-2 font-medium">Upload New Images</Typography>
              <FileUpload
                value={uploadImages}
                onChange={setUploadImages}
                title="Drag and drop images here or click to browse"
                buttonText="Select Photos"
                multiple
                accept="image/*"
                buttonProps={{
                  variant: "contained",
                  sx: {
                    backgroundColor: "#d1922b",
                    color: "#fff",
                    '&:hover': { backgroundColor: '#b57d25' }
                  },
                }}
              />
            </Box>

            {uploadImages.length > 0 && (
              <div className="mt-8">
                <Typography className="mb-4 font-medium">Preview Selected Files</Typography>
                <div className="flex flex-wrap gap-4">
                  {uploadImages.map((file, idx) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={`preview-${idx}`} className="relative w-28 h-28">
                        <img
                          src={url}
                          alt="Preview"
                          className="rounded-lg w-full h-full object-cover border border-gray-200"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-8 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setUploadImages([]);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving || uploadImages.length === 0}>
                {isSaving ? "Saving..." : "Upload Photos"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}