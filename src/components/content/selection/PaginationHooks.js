// PaginationHooks.js
import { useState } from 'react';

export const usePagination = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const onPageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return { currentPage, pageSize, onPageChange, onPageSizeChange, startIndex, endIndex };
};
