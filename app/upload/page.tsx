'use client';

import { Check, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image'; // Adjust the import path as needed

interface FileMetadata {
  eTag?: string;
  size?: number;
  mimetype?: string;
  cacheControl?: string;
  lastModified?: string;
  contentLength?: number;
  httpStatusCode?: number;
  [key: string]: unknown; // For any additional properties
}

interface FileObject {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: FileMetadata;
  url?: string;
}

const folders = [
  { id: 'tasty', name: 'Tasty', icon: '🍕' },
  { id: 'phd-hostels', name: 'PhD Hostels', icon: '🏠' },
  { id: 'psb', name: 'PSB', icon: '🏢' },
  { id: 'cdh2', name: 'CDH2', icon: '🏘️' },
  { id: 'library', name: 'Library', icon: '📚' },
  { id: 'lhc', name: 'LHC', icon: '⚛️' },
  { id: 'kathinpara', name: 'Kathinpara', icon: '🌳' },
  { id: 'guest', name: 'Guest House', icon: '🏨' },
  { id: 'anamudi', name: 'Anamudi', icon: '🏔️' },
  { id: 'bsb', name: 'BSB', icon: '🏗️' },
  { id: 'cake-world', name: 'Cake World', icon: '🎂' },
  { id: 'cdh1', name: 'CDH1', icon: '🏘️' },
  { id: 'csb', name: 'CSB', icon: '🏢' },
  { id: 'indoor', name: 'Indoor', icon: '🏠' }
];

export default function MinimalisticGalleryUpload() {
  const [selectedFolder, setSelectedFolder] = useState(folders[0].id);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  const [editMode, setEditMode] = useState(false);
  const [existingImages, setExistingImages] = useState<FileObject[]>([]);
  const [selectedImages, setSelectedImages] = useState(new Set<string>());
  const [loading, setLoading] = useState(false);

  // Fetch folder counts
  useEffect(() => {
    const fetchAllCounts = async () => {
      const counts: Record<string, number> = {};
      
      for (const folder of folders) {
        try {
          const { data, error } = await supabase.storage
            .from('gallery')
            .list(folder.id);

          if (error) {
            console.error(`Error fetching folder ${folder.id}:`, error);
            // If folder doesn't exist, it might return an error, but we'll set count to 0
            counts[folder.id] = 0;
          } else if (data) {
            const imageFiles = data.filter((file: FileObject) =>
              file.name && file.name.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/i)
            );
            counts[folder.id] = imageFiles.length;
            console.log(`Folder ${folder.id} has ${imageFiles.length} images`);
          } else {
            counts[folder.id] = 0;
          }
        } catch (err) {
          console.error(`Exception fetching folder ${folder.id}:`, err);
          counts[folder.id] = 0;
        }
      }
      
      console.log('Final folder counts:', counts);
      setFolderCounts(counts);
    };

    fetchAllCounts();
  }, []);

  // Fetch existing images when folder changes or edit mode is toggled

  const fetchExistingImages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('gallery')
        .list(selectedFolder);
  
      if (error) {
        console.error('Error fetching images:', error);
        setExistingImages([]);
      } else if (data) {
        const imageFiles = (data as FileObject[])?.filter((file: FileObject) =>
          file.name && file.name.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/i)
        ) || [];
        
        // Get public URLs for each image
        const imagesWithUrls = imageFiles.map(file => {
          const { data: urlData } = supabase.storage
            .from('gallery')
            .getPublicUrl(`${selectedFolder}/${file.name}`);
          
          return {
            ...file,
            url: urlData.publicUrl
          };
        });
        
        setExistingImages(imagesWithUrls);
        console.log(`Found ${imageFiles.length} images in ${selectedFolder}`);
      } else {
        setExistingImages([]);
      }
    } catch (err) {
      console.error('Exception fetching images:', err);
      setExistingImages([]);
    }
    setLoading(false);
  }, [selectedFolder]);

  useEffect(() => {
    if (editMode) {
      fetchExistingImages();
    }
  }, [selectedFolder, editMode, fetchExistingImages]);

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMessage('Please select at least one image.');
      return;
    }

    const currentCount = folderCounts[selectedFolder] || 0;
    const total = currentCount + files.length;
    
    if (total > 12) {
      setMessage(`Folder already has ${currentCount} image(s). You can upload only ${12 - currentCount} more.`);
      return;
    }

    setUploading(true);
    setMessage(null);

    let successCount = 0;
    const uploadPromises = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `${selectedFolder}/${file.name}`;

      uploadPromises.push(
        supabase.storage
          .from('gallery')
          .upload(filePath, file)
          .then(({ error }) => {
            if (error) {
              console.error(`Failed to upload ${file.name}:`, error);
            } else {
              successCount++;
            }
          })
      );
    }

    await Promise.all(uploadPromises);

    setUploading(false);
    setFiles(null);

    // Update folder count and refresh counts
    if (successCount > 0) {
      setFolderCounts(prev => ({
        ...prev,
        [selectedFolder]: (prev[selectedFolder] || 0) + successCount
      }));
      setMessage(`Successfully uploaded ${successCount} file(s) to "${folders.find(f => f.id === selectedFolder)?.name}".`);
      
      // Refresh the folder counts to ensure accuracy
      setTimeout(() => {
        const refreshCounts = async () => {
          try {
            const { data, error } = await supabase.storage
              .from('gallery')
              .list(selectedFolder);

            if (!error && data) {
              const imageFiles = data.filter((file: FileObject) =>
                file.name && file.name.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/i)
              );
              setFolderCounts(prev => ({
                ...prev,
                [selectedFolder]: imageFiles.length
              }));
            }
          } catch (err) {
            console.error('Error refreshing counts:', err);
          }
        };
        refreshCounts();
      }, 1000);
    } else {
      setMessage('Upload failed for all selected files.');
    }

    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleDeleteSelectedBatch = async () => {
    if (selectedImages.size === 0) return;
  
    setLoading(true);
    
    try {
      // Get the current list of files to verify they exist
      const { data: currentFiles, error: listError } = await supabase.storage
        .from('gallery')
        .list(selectedFolder);
  
      if (listError) {
        console.error('Error listing current files:', listError);
        setMessage('Failed to verify files for deletion.');
        setLoading(false);
        return;
      }
  
      // Filter to only delete files that actually exist
      const existingFiles = currentFiles?.filter(file => 
        selectedImages.has(file.name)
      ) || [];
  
      if (existingFiles.length === 0) {
        setMessage('No files found to delete.');
        setLoading(false);
        return;
      }
  
      // Construct paths for existing files only
      const pathsToDelete = existingFiles.map(file => `${selectedFolder}/${file.name}`);
      
      console.log('Deleting existing files:', pathsToDelete);
  
      const { data, error } = await supabase.storage
        .from('gallery')
        .remove(pathsToDelete);
  
      if (error) {
        console.error('Batch delete error:', error);
        setMessage(`Failed to delete images: ${error.message}`);
      } else {
        console.log('Batch delete successful:', data);
        setMessage(`Successfully deleted ${existingFiles.length} image(s).`);
        setSelectedImages(new Set());
        
        // Refresh the data
        await fetchExistingImages();
        
        // Update folder count
        const newCount = Math.max(0, (folderCounts[selectedFolder] || 0) - existingFiles.length);
        setFolderCounts(prev => ({
          ...prev,
          [selectedFolder]: newCount
        }));
      }
  
    } catch (err) {
      console.error('Exception during batch delete:', err);
      setMessage('An error occurred while deleting images.');
    }
    
    setLoading(false);
  };

  const toggleImageSelection = (imageName: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageName)) {
        newSet.delete(imageName);
      } else {
        newSet.add(imageName);
      }
      return newSet;
    });
  };

  const selectedFolderData = folders.find(f => f.id === selectedFolder);
  const currentCount = folderCounts[selectedFolder] || 0;
  const canUpload = currentCount < 12;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-white mb-2">Gallery Manager</h1>
          <p className="text-gray-400 text-sm">Upload and manage your photo collections</p>
        </div>

        {/* Folder Selection */}
        <div className="mb-8">
          <label className="block text-gray-300 text-sm mb-3">Select Folder</label>
          <select
            value={selectedFolder}
            onChange={(e) => {
              setSelectedFolder(e.target.value);
              setEditMode(false);
              setSelectedImages(new Set());
            }}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded text-white focus:border-gray-500 focus:outline-none"
          >
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id} className="bg-gray-900">
                {folder.icon} {folder.name} ({folderCounts[folder.id] || 0}/12)
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900 rounded p-4 text-center">
            <div className="text-xl font-light">{currentCount}</div>
            <div className="text-xs text-gray-400">Current Images</div>
          </div>
          <div className="bg-gray-900 rounded p-4 text-center">
            <div className="text-xl font-light">{12 - currentCount}</div>
            <div className="text-xs text-gray-400">Available Slots</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              editMode
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {editMode ? 'Cancel' : 'Edit Images'}
          </button>
          
          {editMode && selectedImages.size > 0 && (
            <button
              onClick={handleDeleteSelectedBatch}
              className="px-4 py-2 rounded text-sm bg-red-600 hover:bg-red-700 transition-colors"
              disabled={loading}
            >
              Delete ({selectedImages.size})
            </button>
          )}
        </div>

        {/* Edit Mode - Existing Images */}
        {editMode && (
          <div className="mb-6">
            <h3 className="text-gray-300 text-sm mb-4">
              Images in {selectedFolderData?.name}
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                <p className="text-gray-400 mt-2 text-sm">Loading...</p>
              </div>
            ) : existingImages.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-sm">No images found</p>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {existingImages.map((image) => (
                  <div
                    key={image.name}
                    className={`relative cursor-pointer rounded overflow-hidden border transition-colors ${
                      selectedImages.has(image.name)
                        ? 'border-white bg-gray-800'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => toggleImageSelection(image.name)}
                  >
                    <div className="aspect-square bg-gray-800 overflow-hidden relative">
                      {image.url ? (
                        // Replace the problematic onError handler with this fixed version:

                        <Image
                          src={image.url} 
                          alt={image.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // Hide the failed image
                            e.currentTarget.style.display = 'none';

                            // Show the fallback div (next sibling element)
                            const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextSibling) {
                              nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center" style={{ display: image.url ? 'none' : 'flex' }}>
                        <Camera className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                    {selectedImages.has(image.name) && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                      <p className="text-white text-xs truncate">{image.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload Section */}
        {!editMode && (
          <div className="mb-6">
            <h3 className="text-gray-300 text-sm mb-4">Upload New Images</h3>
            
            {!canUpload && (
              <div className="bg-red-900/50 border border-red-700 rounded p-3 mb-4">
                <p className="text-red-200 text-sm">Folder is full (12/12 images)</p>
              </div>
            )}

            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                disabled={!canUpload}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded text-white focus:border-gray-500 focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600 disabled:opacity-50"
              />

              <button
                onClick={handleUpload}
                disabled={uploading || !canUpload}
                className="w-full bg-white text-black py-3 rounded font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Images'}
              </button>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className="p-3 rounded bg-gray-900 border border-gray-700 mb-6">
            <p className="text-gray-300 text-sm text-center">{message}</p>
          </div>
        )}

        {/* Folder Overview */}
        <div className="bg-gray-900 rounded p-4">
          <h3 className="text-gray-300 text-sm mb-4">All Folders</h3>
          <div className="space-y-2">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={`flex items-center justify-between p-2 rounded text-sm ${
                  folder.id === selectedFolder
                    ? 'bg-gray-800'
                    : 'hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{folder.icon}</span>
                  <span>{folder.name}</span>
                </div>
                <span className="text-gray-400">{folderCounts[folder.id] || 0}/12</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}