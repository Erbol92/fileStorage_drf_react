import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createFolderRequest,
  closeCreateFolderModal
} from '../slices/fileSlice';
import { FaTimes } from 'react-icons/fa';

const CreateFolderModal = () => {
  const dispatch = useDispatch();
  const { isOpen, parentId } = useSelector(
    (state) => state.files.createFolderModal
  );
  const [folderName, setFolderName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (folderName.trim()) {
      dispatch(createFolderRequest({
        name: folderName.trim(),
        parentId
      }));
      setFolderName('');
    }
  };

  const handleClose = () => {
    dispatch(closeCreateFolderModal());
    setFolderName('');
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content small" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Создать новую папку</h3>
          <button className="close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="folderName">Название папки</label>
            <input
              type="text"
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Введите название"
              autoFocus
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!folderName.trim()}
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;