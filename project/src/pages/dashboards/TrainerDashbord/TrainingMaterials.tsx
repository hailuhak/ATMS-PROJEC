import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Upload, FileText, File, Download, Image, Video } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { db, storage } from '../../../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface Material {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export const TrainingMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Fetch existing materials from Firestore
  useEffect(() => {
    const fetchMaterials = async () => {
      const snapshot = await getDocs(collection(db, 'trainingMaterials'));
      const data = snapshot.docs.map((doc) => {
        const mat = doc.data() as Omit<Material, 'id'>;
        return {
          id: doc.id,
          ...mat,
          uploadedAt: mat.uploadedAt.toDate ? mat.uploadedAt.toDate() : new Date(mat.uploadedAt)
        };
      });
      setMaterials(data);
    };
    fetchMaterials();
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const storageRef = ref(storage, `trainingMaterials/${file.name}-${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
        },
        (error) => {
          console.error('Upload error:', error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          const docRef = await addDoc(collection(db, 'trainingMaterials'), {
            name: file.name,
            url,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
          });
          setMaterials((prev) => [
            ...prev,
            { id: docRef.id, name: file.name, url, size: file.size, type: file.type, uploadedAt: new Date() },
          ]);
          setUploadProgress((prev) => {
            const updated = { ...prev };
            delete updated[file.name];
            return updated;
          });
        }
      );
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (type.includes('image')) return <Image className="w-6 h-6 text-green-500" />;
    if (type.includes('video')) return <Video className="w-6 h-6 text-purple-500" />;
    return <File className="w-6 h-6 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Training Materials
        </h1>
        <Button
          onClick={() => {
            const fileInput = document.getElementById('materialUpload') as HTMLInputElement;
            fileInput?.click();
          }}
        >
          <Upload className="w-4 h-4 mr-2" /> Upload File
        </Button>
        <input
          type="file"
          id="materialUpload"
          className="hidden"
          multiple
          onChange={handleUpload}
        />
      </div>

      {/* Files list */}
      {materials.length === 0 && Object.keys(uploadProgress).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No materials uploaded yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {materials.map((material) => (
            <Card
              key={material.id}
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => window.open(material.url, '_blank')}
            >
              <div className="flex items-center gap-3">
                {getFileIcon(material.type)}
                <div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{material.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {(material.size / 1024).toFixed(2)} KB • {material.uploadedAt.toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => window.open(material.url, '_blank')}
              >
                <Download className="w-4 h-4" /> Open
              </Button>
            </Card>
          ))}

          {/* Uploading files */}
          {Object.keys(uploadProgress).map((fileName) => (
            <Card key={fileName} className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-900 dark:text-gray-100">{fileName}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {uploadProgress[fileName].toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded">
                <div
                  className="bg-blue-500 h-2 rounded"
                  style={{ width: `${uploadProgress[fileName]}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
