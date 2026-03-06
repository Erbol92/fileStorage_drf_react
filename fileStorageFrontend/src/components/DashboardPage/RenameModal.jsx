import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  renameItemRequest,
  fetchRootRequest,
  closeRenameModal
} from '../../slices/fileSlice';
import { FaTimes, FaFolder, FaChevronRight } from 'react-icons/fa';

const RenameModal = () => {
  const dispatch = useDispatch();
  const { isOpen, item } = useSelector((state) => state.files.renameModal);
  const [newName, setNewName] = useState(() => {
    const parts = (item?.name || '').split('.');
    return parts.slice(0, -1).join('.') || parts[0] || '';
  });

  const ext = item?.name?.split('.').slice(1).join('.') || '';
  useEffect(() => {
    if (!isOpen) {
      dispatch(fetchRootRequest());
    }
  }, [isOpen, dispatch]);

  if (!isOpen || !item) return null;



  const handleRename = () => {
    const finalName = ext ? `${newName}.${ext}` : newName;
    dispatch(renameItemRequest({
      itemId: item.id,
      name: finalName,
    }));
  };

  const handleClose = () => {
    dispatch(closeRenameModal());
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content medium" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Переименовать "{item.name}"</h3>
          <button className="close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <div className="rename-modal-content p-3">
            <div className="form-floating"> 
                <input value={newName} onChange={(e)=>setNewName(e.target.value)} required type="text" className="form-control" id="floatingName" placeholder="имя"/> 
                <label htmlFor="floatingName">новое имя</label> 
            </div> 
            <div className="form-text">
              Расширение: .{ext} — итоговое имя: {newName}.{ext}
            </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Отмена
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleRename}
          >
            Переименовать
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameModal;