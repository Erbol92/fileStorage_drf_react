import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  moveItemRequest,
  closeMoveModal,
  fetchRootRequest,
  fetchFolderContentRequest
} from '../slices/fileSlice';
import { FaTimes, FaFolder, FaChevronRight } from 'react-icons/fa';

const MoveModal = () => {
  const dispatch = useDispatch();
  const { isOpen, item } = useSelector((state) => state.files.moveModal);
  const { files, currentFolder, breadcrumbs } = useSelector((state) => state.files);
  
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [navigation, setNavigation] = useState({
    currentFolder: null,
    breadcrumbs: []
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchRootRequest());
      setNavigation({
        currentFolder: null,
        breadcrumbs: []
      });
    }
  }, [isOpen, dispatch]);

  if (!isOpen || !item) return null;

  const handleFolderClick = (folder) => {
    dispatch(fetchFolderContentRequest({
      folderId: folder.id,
      folderName: folder.name,
      breadcrumbs: [...navigation.breadcrumbs, { id: folder.id, name: folder.name }]
    }));
    setNavigation({
      currentFolder: folder,
      breadcrumbs: [...navigation.breadcrumbs, { id: folder.id, name: folder.name }]
    });
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      dispatch(fetchRootRequest());
      setNavigation({
        currentFolder: null,
        breadcrumbs: []
      });
      setSelectedFolder(null)
      return;
    }

    const targetBreadcrumb = navigation.breadcrumbs[index];
    const newBreadcrumbs = navigation.breadcrumbs.slice(0, index + 1);
    
    dispatch(fetchFolderContentRequest({
      folderId: targetBreadcrumb.id,
      folderName: targetBreadcrumb.name,
      breadcrumbs: newBreadcrumbs
    }));
    setNavigation({
      currentFolder: targetBreadcrumb,
      breadcrumbs: newBreadcrumbs
    });
  };

  const handleMove = () => {
    dispatch(moveItemRequest({
      itemId: item.id,
      parentId: selectedFolder?.id || null,
      currentFolderId: currentFolder?.id,
      currentFolderName: currentFolder?.name,
      breadcrumbs
    }));
  };

  const handleClose = () => {
    dispatch(closeMoveModal());
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content medium" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Переместить "{item.name}"</h3>
          <button className="close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <div className="move-modal-content">
          <div className="breadcrumbs">
            <span 
              className="breadcrumb-item"
              onClick={() => handleBreadcrumbClick(-1)}
            >
              Мои файлы
            </span>
            {navigation.breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                <FaChevronRight className="separator" />
                <span
                  className={`breadcrumb-item ${
                    index === navigation.breadcrumbs.length - 1 ? 'active' : ''
                  }`}
                  onClick={() => handleBreadcrumbClick(index)}
                >
                  {crumb.name}
                </span>
              </React.Fragment>
            ))}
          </div>

          <div className="folder-list">
            {files
              .filter(f => f.is_directory && f.id !== item.id)
              .map(folder => (
                <div
                  key={folder.id}
                  className={`folder-item ${
                    selectedFolder?.id === folder.id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedFolder(folder)}
                  onDoubleClick={() => handleFolderClick(folder)}
                >
                  <FaFolder className="folder-icon" />
                  <span className="folder-name">{folder.name}</span>
                </div>
              ))}
            
            {files.filter(f => f.is_directory && f.id !== item.id).length === 0 && (
              <div className="empty-folders">
                Нет папок для перемещения
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Отмена
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleMove}
          >
            Переместить сюда
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveModal;