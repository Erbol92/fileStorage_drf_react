import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { uploadFileRequest } from '../slices/fileSlice';
import { FaTimes, FaCloudUploadAlt } from 'react-icons/fa';

const UploadModal = ({ onClose, parentId }) => {
  const dispatch = useDispatch();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [comment, setComment] = useState('')

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setUploading(true);
    
    for (const file of selectedFiles) {
      await new Promise((resolve) => {
        dispatch(uploadFileRequest({
          file,
          parentId,
          comment,
          onProgress: (fileName, progress) => {
          }
        }));
        // Даем небольшую задержку между загрузками
        setTimeout(resolve, 100);
      });
    }
    
    setUploading(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Загрузить файлы</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div 
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <FaCloudUploadAlt className="upload-icon" />
          <p>Перетащите файлы сюда или</p>
          <label className="btn btn-primary">
            Выберите файлы
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <div className="form-floating"> 
            <input value={comment} onChange={(e)=>setComment(e.target.value)} required type="text" className="form-control" id="floatingName" placeholder="комментарий"/> 
            <label htmlFor="floatingName">комментарий</label> 
        </div> 

        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <h4>Выбрано файлов: {selectedFiles.length}</h4>
            <div className="file-list">
              {selectedFiles.map((file, index) => (
                <div key={index} className="selected-file">
                  <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  <button onClick={() => removeFile(index)}>
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
          >
            {uploading ? 'Загрузка...' : 'Загрузить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;