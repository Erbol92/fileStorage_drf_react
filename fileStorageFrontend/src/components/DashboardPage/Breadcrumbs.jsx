import React from 'react';
import { FaHome, FaChevronRight } from 'react-icons/fa';

const Breadcrumbs = ({ items, onItemClick }) => {
  return (
    <div className="breadcrumbs">
      <span 
        className="breadcrumb-item home"
        onClick={() => onItemClick(-1)}
      >
        <FaHome /> Мои файлы
      </span>
      
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <FaChevronRight className="separator" />
          <span
            className={`breadcrumb-item ${index === items.length - 1 ? 'active' : ''}`}
            onClick={() => onItemClick(index)}
          >
            {item.name}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;