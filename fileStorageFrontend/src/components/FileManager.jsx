import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRootRequest,
  fetchFolderContentRequest,
  openCreateFolderModal,
  searchFilesRequest,
  clearError
} from '../slices/fileSlice';
import FileList from './FileList';
import Breadcrumbs from './Breadcrumbs';
import UploadModal from './UploadModal';
import CreateFolderModal from './CreateFolderModal';
import MoveModal from './MoveModal';
import { FaFolderPlus, FaUpload, FaSearch, FaSync } from 'react-icons/fa';

export const FileManager = () => {
  const dispatch = useDispatch();
  const { 
    files, 
    currentFolder, 
    breadcrumbs, 
    loading, 
    error,
    uploadProgress 
  } = useSelector((state) => state.files);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    dispatch(fetchRootRequest());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleFolderClick = (folder) => {
    const newBreadcrumbs = [
      ...breadcrumbs,
      { id: folder.id, name: folder.name }
    ];
    dispatch(fetchFolderContentRequest({
      folderId: folder.id,
      folderName: folder.name,
      breadcrumbs: newBreadcrumbs
    }));
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      dispatch(fetchRootRequest());
      return;
    }

    const targetBreadcrumb = breadcrumbs[index];
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    
    dispatch(fetchFolderContentRequest({
      folderId: targetBreadcrumb.id,
      folderName: targetBreadcrumb.name,
      breadcrumbs: newBreadcrumbs
    }));
  };

  const handleRefresh = () => {
    if (currentFolder) {
      dispatch(fetchFolderContentRequest({
        folderId: currentFolder.id,
        folderName: currentFolder.name,
        breadcrumbs
      }));
    } else {
      dispatch(fetchRootRequest());
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.trim()) {
      setSearchTimeout(setTimeout(() => {
        dispatch(searchFilesRequest(query));
      }, 500));
    } else {
      handleRefresh();
    }
  };

  const activeUploads = Object.keys(uploadProgress).filter(
    name => uploadProgress[name] < 100
  );

  return (
    <div className="file-manager">
      <div className="toolbar">
        <div className="toolbar-left">
          <button 
            className="btn btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            <FaUpload /> Загрузить
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => dispatch(openCreateFolderModal(currentFolder?.id))}
          >
            <FaFolderPlus /> Создать папку
          </button>
          <button 
            className="btn btn-icon"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FaSync className={loading ? 'spin' : ''} />
          </button>
        </div>
        
        <div className="toolbar-right">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Поиск файлов..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      {activeUploads.length > 0 && (
        <div className="upload-progress">
          {activeUploads.map(fileName => (
            <div key={fileName} className="progress-item">
              <span>{fileName}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${uploadProgress[fileName]}%` }}
                />
              </div>
              <span>{uploadProgress[fileName]}%</span>
            </div>
          ))}
        </div>
      )}

      <Breadcrumbs 
        items={breadcrumbs}
        onItemClick={handleBreadcrumbClick}
      />

      {loading && !files.length ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <FileList 
          files={files}
          onFolderClick={handleFolderClick}
          currentFolder={currentFolder}
          onRefresh={handleRefresh}
        />
      )}

      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)}
          parentId={currentFolder?.id}
        />
      )}

      <CreateFolderModal />
      <MoveModal />
    </div>
  );
};

