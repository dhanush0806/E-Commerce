import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, CheckCircle } from 'lucide-react';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { Pagination } from '../../components/Pagination/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Category, Product } from '../../types';
import './Products.css';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    categoryParam ? parseInt(categoryParam) : undefined
  );
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getAllCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(parseInt(categoryParam));
    }
  }, [categoryParam]);

  useEffect(() => {
    setLoading(true);
    productService.getProducts(currentPage, 12, sortBy, sortDir, selectedCategory)
      .then((data) => {
        setProducts(data.content);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [currentPage, selectedCategory, sortBy, sortDir]);

  const handleCategoryChange = (catId?: number) => {
    setSelectedCategory(catId);
    setCurrentPage(0);
    if (catId) setSearchParams({ category: catId.toString() });
    else setSearchParams({});
  };

  return (
    <div className="container catalogue-wrapper">
      <div className="catalogue-layout">
        {/* Amazon / Flipkart Style Left Filters */}
        <aside className="filters-sidebar">
          <div className="filter-block">
            <h3>Department</h3>
            <ul className="filter-cat-list">
              <li>
                <button
                  className={`filter-item-btn ${!selectedCategory ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(undefined)}
                >
                  All Categories
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    className={`filter-item-btn ${selectedCategory === c.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(c.id)}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-block">
            <h3>Customer Reviews</h3>
            <div className="rating-filter-options">
              <div className="rating-item">
                <div className="stars-gold">★★★★☆</div>
                <span>& Up</span>
              </div>
              <div className="rating-item">
                <div className="stars-gold">★★★☆☆</div>
                <span>& Up</span>
              </div>
            </div>
          </div>

          <div className="filter-block">
            <h3>Assured Shipping</h3>
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span className="assured-brand"><CheckCircle size={14} /> NexStore Assured</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Main Pane */}
        <div className="products-main-pane">
          <div className="sort-bar">
            <span className="search-stat-count">
              Showing {products.length} products
            </span>
            <div className="sort-dropdown-wrap">
              <label htmlFor="cat-sort">Sort by:</label>
              <select
                id="cat-sort"
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [sb, sd] = e.target.value.split('-');
                  setSortBy(sb);
                  setSortDir(sd);
                  setCurrentPage(0);
                }}
              >
                <option value="id-asc">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Customer Ratings</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Updating selection..." />
          ) : products.length === 0 ? (
            <div className="no-products-pane">
              <h3>No matching items found</h3>
              <p>Check spelling or clear filters to see more results.</p>
            </div>
          ) : (
            <div className="commercial-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};
