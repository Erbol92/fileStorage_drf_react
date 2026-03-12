import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  commentFileRequest,
  closeCommentModal
} from '../../slices/fileSlice';
import { FaTimes } from 'react-icons/fa';

const CommentModal = () => {
  const dispatch = useDispatch();
  const { isOpen, item } = useSelector((state) => state.files.commentModal);
  const [comment, setComment] = useState(() => item?.comment || '' )

  if (!isOpen || !item) return null;

  const handleComment= () => {
    dispatch(commentFileRequest({
      itemId: item.id,
      comment,
    }));
    dispatch(closeCommentModal());
  };

  const handleClose = () => {
    dispatch(closeCommentModal());
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content medium" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>сменить комменарий "{item.comment}"</h3>
          <button className="close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <div className="rename-modal-content p-3">
          <div className="form-floating"> 
              <input value={comment} onChange={(e)=>setComment(e.target.value)} required type="text" className="form-control" id="floatingName" placeholder="комментарий"/> 
              <label htmlFor="floatingName">новый комментарий</label> 
          </div> 
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Отмена
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleComment}
          >
            применить
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;