import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FileItem from './FileItem';
import {
  selectFile,
  deselectFile,
  clearSelection,
  openMoveModal,
  openRenameModal,
  deleteItemRequest
} from '../slices/fileSlice';
import { FaTrash, FaArrowRight, FaEdit } from 'react-icons/fa';

const FileList = ({ files, onFolderClick, currentFolder, onRefresh }) => {
  const dispatch = useDispatch();
  const { selectedFiles } = useSelector((state) => state.files);
  const [selectMode, setSelectMode] = useState(false);

  useEffect(()=>{
    if (selectedFiles.length===0) setSelectMode(false)
  },[selectedFiles])

  const handleFileClick = (file) => {
    if (selectMode) {
      toggleSelect(file.id);
    } else if (file.is_directory) {
      onFolderClick(file);
    }
  };

  const toggleSelect = (fileId) => {
    if (selectedFiles.includes(fileId)) {
      dispatch(deselectFile(fileId));
    } else {
      dispatch(selectFile(fileId));
    }
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      dispatch(clearSelection());
    } else {
      files.forEach(file => dispatch(selectFile(file.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Удалить ${selectedFiles.length} элемент(ов)?`)) {
      selectedFiles.forEach(fileId => {
        dispatch(deleteItemRequest(fileId));
      });
      dispatch(clearSelection());
    }
  };

  const handleRenameSelected = () => {
    if (selectedFiles.length === 1) {
      const item = files.find(f => f.id === selectedFiles[0]);
      dispatch(openRenameModal(item))
      dispatch(clearSelection());
      } else {
      alert('Переименовать можно только 1 файл');
    }
  };

  const handleMoveSelected = () => {
    if (selectedFiles.length === 1) {
      const item = files.find(f => f.id === selectedFiles[0]);
      dispatch(openMoveModal(item));
      dispatch(clearSelection())
    } else {
      alert('Пока поддерживается перемещение только одного элемента');
    }
  };

  if (!files.length) {
    return (
      <div className="empty-folder">
        <p>Папка пуста</p>
      </div>
    );
  }

  return (
    <div className="file-list">
      {selectedFiles.length > 0 && (
        <div className="selection-toolbar">
          <span>Выбрано: {selectedFiles.length}</span>
          <button onClick={handleSelectAll}>
            {selectedFiles.length === files.length ? 'Снять все' : 'Выбрать все'}
          </button>
          <button onClick={handleMoveSelected}>
            <FaArrowRight /> Переместить
          </button>
          <button onClick={handleRenameSelected}>
            <FaEdit /> Переименовать
          </button>
          <button onClick={handleDeleteSelected} className="danger">
            <FaTrash /> Удалить
          </button>
          <button onClick={() => dispatch(clearSelection())}>
            Отмена
          </button>
        </div>
      )}

      <div className="file-grid">
        {files.map(file => (
          <FileItem
            key={file.id}
            file={file}
            onClick={() => handleFileClick(file)}
            onSelect={() => toggleSelect(file.id)}
            isSelected={selectedFiles.includes(file.id)}
            selectMode={selectMode}
            onSelectModeChange={setSelectMode}
            currentFolder={currentFolder}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  );
};

export default FileList;