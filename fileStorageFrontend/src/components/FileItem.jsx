import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  deleteItemRequest,
  openMoveModal,
  shareItemRequest
} from '../slices/fileSlice';
import {
  FaFile,
  FaFolder,
  FaImage,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileArchive,
  FaTrash,
  FaArrowRight,
  FaEdit,
  FaCheckSquare,
  FaSquare
} from 'react-icons/fa';
import { FcDownload, FcLink, FcLock  } from "react-icons/fc";
import {CONFIG} from '../config'
import { downloadUserFile } from '../api/fileApi'

const getFileIcon = (mimeType, isDirectory) => {
  if (isDirectory) return <FaFolder className="icon folder" />;
  
  if (mimeType?.startsWith('image/')) return <FaImage className="icon image" />;
  if (mimeType === 'application/pdf') return <FaFilePdf className="icon pdf" />;
  if (mimeType?.includes('word')) return <FaFileWord className="icon word" />;
  if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) {
    return <FaFileExcel className="icon excel" />;
  }
  if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('tar')) {
    return <FaFileArchive className="icon archive" />;
  }
  
  return <FaFile className="icon file" />;
};

const formatSize = (size) => {
  if (size === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let bytes = size;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(1)} ${units[i]}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  const diffTime = Math.abs(now - date);
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дней назад`;
  
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
};

const FileItem = ({ 
  file, 
  onClick, 
  onSelect, 
  isSelected, 
  selectMode,
  onSelectModeChange,
  currentFolder,
  onRefresh
}) => {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleDelete = () => {
    if (window.confirm(`Удалить "${file.name}"?`)) {
      dispatch(deleteItemRequest(file.id));
    }
    setShowMenu(false);
  };

  const handleMove = () => {
    dispatch(openMoveModal(file));
    setShowMenu(false);
  };

  const handleSelectClick = (e) => {
    e.stopPropagation();
    onSelect();
    if (!selectMode) {
      onSelectModeChange(true);
    }
  };

  const handleItemClick = () => {
    if (selectMode) {
      onSelect();
    } else {
      onClick();
    }
  };

  const downloadFile = async (file) => {
    try {
      const blob = await downloadUserFile(file.id);
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(href);
    } catch (error) {
      console.error('Ошибка скачивания:', error);
    }
    setShowMenu(false);
  };


  const shareFile = async (id) => {
    dispatch(shareItemRequest({id}))
    setShowMenu(false);
  };

  useEffect(() => {
    if (!showMenu) return;

    const handleOutsideClick = (e) => {
      // если клик вне меню — скрыть
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowMenu(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showMenu]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(`${CONFIG.API_URL}/download/${text}`);
      setShowMenu(false)
    } catch (err) {
      console.error(err)
    }
  };
  const stopAccessShare = async(id) => {
    dispatch(shareItemRequest({id, "stop":true}))
    setShowMenu(false);
  }

  return (
    <>
      <div
        className={`file-item ${isSelected ? 'selected' : ''}`}
        onClick={handleItemClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="file-checkbox" onClick={handleSelectClick}>
          {isSelected ? <FaCheckSquare /> : <FaSquare />}
        </div>
        
        <div className="file-icon">
          {getFileIcon(file.mime_type, file.is_directory)}
        </div>
        
        <div className="file-info">
          <div className="file-name" title={file.name}>
            {file.name}
          </div>
          <div className="file-meta">
            <span className="file-size">{formatSize(file.size)}</span>
            <span className="file-date">{formatDate(file.created_at)}</span>
          </div>
          {
          file.comment && hovered &&
          <div className="file-meta file-comment w-100">
            <p>комментарий</p>
            <p className="file-size">{file.comment}</p>
          </div>
          }
        </div>
      </div>

      {showMenu && (
        <div 
          className="context-menu"
          style={{ top: menuPosition.y, left: menuPosition.x }}
          ref={menuRef}
        >
          {
          !file.is_directory && 
          <>
            <div className="menu-item" onClick={handleMove}>
              <FaArrowRight /> Переместить
            </div>
            <div className="menu-item" onClick={()=>downloadFile(file)}>
              <FcDownload /> Скачать
            </div>
            {!file.uid ? 
              <div className="menu-item" onClick={()=>shareFile(file.id)}>
                <FcLink /> поделиться
              </div>
              :
              <div className="d-flex">
                <div className="menu-item sharedLink" onClick={()=>copyToClipboard(file.uid)}>
                  <FcLink /> копировать ссылку
                </div>
                <div className="menu-item sharedLink" onClick={()=>stopAccessShare(file.id)}>
                  <FcLock />
                </div>
              </div>
            }
            </>
          }
          <div className="menu-item danger" onClick={handleDelete}>
            <FaTrash /> Удалить
          </div>
        </div>
      )} 
    </>
  );
};

export default FileItem;