'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../../../components/ui/button"
import { FileIcon, Link, Plus, Trash, Upload } from 'lucide-react'
import { BASE_URL } from '../../utils/constants';

interface PDF {
  _id?: any;
  name: string;
  url: string;  
  createdAt: string
}

export default function Home() {
  const [pdfName, setPdfName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setPdfName(selectedFile.name);
      } else {
        alert('Please select a PDF file');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setPdfName(droppedFile.name);
      } else {
        alert('Please drop a PDF file');
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }
  
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
  
      const result = await response.json();
      alert('File uploaded successfully');
      fetchPdfs();
      
      // Reset form
      setFile(null);
      setPdfName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchPdfs = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/pdfs`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch PDFs');
      }
  
      const data = await response.json();
      console.log('Fetched PDFs:', data);
      setPdfs(data)
      return data;
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      alert(error instanceof Error ? error.message : 'Failed to fetch PDFs');
      return [];
    }
  };
  
  // Delete a PDF
  const deletePdf = async (id: string) => {
    try {
      const response = await fetch(`/api/uploads/${id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete PDF');
      }
  
      alert('PDF deleted successfully');
      fetchPdfs(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting PDF:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete PDF');
    }
  };
  

  useEffect(() => {
    fetchPdfs();
  }, []);

  return (
    <div className="min-h-screen bg-[#1C1C1C] rounded-md text-gray-300 p-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <FileIcon className="w-12 h-12 text-gray-400" />
            <h1 className="text-2xl font-semibold text-white">Knowledge Base</h1>
            <p className="text-gray-400 max-w-md">
              Here is your knowledge base of PDFs.
            </p>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 mt-4"
              onClick={fetchPdfs}
              disabled={isFetching}
            >
              {isFetching ? 'Refreshing...' : 'Refresh PDFs'}
            </Button>
          </div>
        </div>

        {pdfs.length > 0 && (
          <div className="bg-[#242424] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Uploaded PDFs</h2>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {pdfs.map((pdf) => (
                  <div
                    key={pdf._id}
                    className="border rounded-lg p-4 bg-[#1f1f1f] flex flex-col items-center"
                  >
                    <FileIcon className="w-12 h-12 text-gray-400" />
                    <p className="text-gray-300 font-medium mt-2">
                      {pdf.url}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(pdf.createdAt).toLocaleString()}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <a
                        href={pdf.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-sm flex items-center gap-2"
                      >
                        <Link className="w-4 h-4" />
                        Open
                      </a>
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => deletePdf(pdf._id)}
                      >
                        <Trash className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {pdfs.length === 0 && !isFetching && (
          <div className="text-center text-gray-400 mt-8">
            <p>No PDFs found. Try refreshing.</p>
          </div>
        )}
      </div>
    </div>
  );
}

