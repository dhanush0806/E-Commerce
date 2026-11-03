import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="page-btn nav-btn"
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} /> Previous
      </button>

      {Array.from({ length: totalPages }).map((_, idx) => (
        <button
          key={idx}
          className={`page-btn ${currentPage === idx ? 'active' : ''}`}
          onClick={() => onPageChange(idx)}
        >
          {idx + 1}
        </button>
      ))}

      <button
        className="page-btn nav-btn"
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
};
