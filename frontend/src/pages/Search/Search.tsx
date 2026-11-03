import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { Pagination } from '../../components/Pagination/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import './Search.css';

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      setLoading(true);
      productService.searchProducts(query, currentPage, 12)
        .then((data) => {
          setProducts(data.content);
          setTotalPages(data.totalPages);
        })
        .finally(() => setLoading(false));
    }
  }, [query, currentPage]);

  return (
    <div className="container search-wrapper">
      <div className="search-banner-strip">
        <span>Results for &quot;<strong>{query}</strong>&quot;</span>
        <span className="results-total">Check each product page for other buying options.</span>
      </div>

      {loading ? (
        <LoadingSpinner message="Searching our catalog..." />
      ) : products.length === 0 ? (
        <div className="no-search-box">
          <h2>No results for {query}.</h2>
          <p>Try checking your spelling or use more general terms.</p>
        </div>
      ) : (
        <>
          <div className="search-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};
