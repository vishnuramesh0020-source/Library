import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  RotateCcw,
  CloudDownload,
  AlertCircle,
  LayoutGrid,
  List,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookX
} from 'lucide-react';
import { toast } from 'react-toastify';
import { bookService } from '../services/bookService';
import BookCard from '../components/books/BookCard';
import BookModal from '../components/books/BookModal';
import DeleteConfirmModal from '../components/books/DeleteConfirmModal';

export default function BookList() {
  const [books, setBooks] = useState(() => bookService.getAllBooks());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter & Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAuthor, setSelectedAuthor] = useState('All');
  const [sortBy, setSortBy] = useState('title_asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedBook, setSelectedBook] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Categories & Authors lists derived from current books
  const categories = useMemo(() => {
    const list = Array.from(new Set(books.map((b) => b.category))).filter(Boolean);
    return ['All', ...list.sort()];
  }, [books]);

  const authors = useMemo(() => {
    const list = Array.from(new Set(books.map((b) => b.author))).filter(Boolean);
    return ['All', ...list.sort()];
  }, [books]);

  // Filter & Sort logic
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Search filter (Title, Author, ISBN)
        const matchSearch =
          !searchTerm.trim() ||
          book.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
          (book.isbn && book.isbn.toLowerCase().includes(searchTerm.toLowerCase().trim()));

        // Category filter
        const matchCategory =
          selectedCategory === 'All' || book.category === selectedCategory;

        // Author filter
        const matchAuthor =
          selectedAuthor === 'All' || book.author === selectedAuthor;

        return matchSearch && matchCategory && matchAuthor;
      })
      .sort((a, b) => {
        if (sortBy === 'title_asc') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'title_desc') {
          return b.title.localeCompare(a.title);
        }
        if (sortBy === 'year_desc') {
          return (b.publishedYear || 0) - (a.publishedYear || 0);
        }
        if (sortBy === 'year_asc') {
          return (a.publishedYear || 0) - (b.publishedYear || 0);
        }
        if (sortBy === 'available_desc') {
          return (b.availableCopies || 0) - (a.availableCopies || 0);
        }
        return 0;
      });
  }, [books, searchTerm, selectedCategory, selectedAuthor, sortBy]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedAuthor, sortBy]);

  // Paginated books slice
  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage, pageSize]);

  // Third-Party API Sync via Axios
  const handleSyncThirdParty = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookService.fetchThirdPartyBooks(6);
      if (res.success && res.books) {
        // Merge without duplicating existing IDs
        const existingIds = new Set(books.map((b) => b.id));
        const newItems = res.books.filter((b) => !existingIds.has(b.id));

        if (newItems.length > 0) {
          const updated = [...newItems, ...books];
          setBooks(updated);
          bookService.saveBooks(updated);
          toast.success(`Imported ${newItems.length} books from Third-Party API (DummyJSON)!`);
        } else {
          toast.info('Catalog already in sync with Third-Party API.');
        }
      } else {
        setError(res.message || 'Failed to fetch from third-party API.');
        toast.error('Third-Party API synchronization failed.');
      }
    } catch (err) {
      setError(err.message || 'Network error communicating with Third-Party API.');
      toast.error('Network error during API fetch.');
    } finally {
      setLoading(false);
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setSelectedBook(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (book) => {
    setSelectedBook(book);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Success handler for Add/Edit
  const handleModalSuccess = () => {
    setBooks(bookService.getAllBooks());
  };

  // Open Delete Modal
  const handleOpenDelete = (book) => {
    setBookToDelete(book);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    const res = await bookService.deleteBook(bookToDelete.id);
    setIsDeleting(false);

    if (res.success) {
      toast.success(res.message);
      setBooks(bookService.getAllBooks());
      setIsDeleteModalOpen(false);
      setBookToDelete(null);
    } else {
      toast.error(res.message || 'Failed to delete book.');
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedAuthor('All');
    setSortBy('title_asc');
    setCurrentPage(1);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Total Catalog: {books.length} titles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Library Catalog & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage repository accessions, ISBN registry, classifications, and stock levels.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSyncThirdParty}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer disabled:opacity-60"
            title="Fetch from Third-Party REST API (DummyJSON)"
          >
            <CloudDownload className={`w-4 h-4 text-indigo-600 ${loading ? 'animate-bounce' : ''}`} />
            <span>{loading ? 'Syncing API...' : 'Sync Third-Party API'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span><strong>Third-Party API Notice:</strong> {error}</span>
          </div>
          <button
            onClick={handleSyncThirdParty}
            className="px-3 py-1 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors cursor-pointer shrink-0"
          >
            Retry Fetch
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Search Bar (5 cols) */}
          <div className="lg:col-span-5 relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, author name, or ISBN..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter (3 cols) */}
          <div className="lg:col-span-3">
            <div className="relative rounded-xl">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white text-slate-700 cursor-pointer"
              >
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat === 'All' ? '📂 All Categories' : `• ${cat}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Author Filter (2 cols) */}
          <div className="lg:col-span-2">
            <div className="relative rounded-xl">
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white text-slate-700 cursor-pointer truncate"
              >
                {authors.map((auth, i) => (
                  <option key={i} value={auth}>
                    {auth === 'All' ? '✍️ All Authors' : auth}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort By Title (2 cols) */}
          <div className="lg:col-span-2">
            <div className="relative rounded-xl">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white text-slate-700 cursor-pointer"
              >
                <option value="title_asc">🔤 Title (A to Z)</option>
                <option value="title_desc">🔤 Title (Z to A)</option>
                <option value="year_desc">📅 Newest Published</option>
                <option value="year_asc">📅 Oldest Published</option>
                <option value="available_desc">📚 Most Available Copies</option>
              </select>
            </div>
          </div>

        </div>

        {/* Toolbar Sub-bar: Active Filter pills & View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Showing <strong className="text-slate-800">{filteredBooks.length}</strong> matching titles</span>
            {(searchTerm || selectedCategory !== 'All' || selectedAuthor !== 'All' || sortBy !== 'title_asc') && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline cursor-pointer ml-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset filters
              </button>
            )}
          </div>

          {/* View Mode Toggle: Grid vs Table */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="w-full aspect-[4/3] bg-slate-200 rounded-xl"></div>
              <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
              <div className="h-8 bg-slate-100 rounded-lg w-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* Books Content: Empty State vs Grid vs Table */}
      {!loading && filteredBooks.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
            <BookX className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No books found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No library accession matched your search keywords or filter criteria. Try adjusting terms or resetting filters.
          </p>
          <div className="pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : (
        !loading && (
          viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                />
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                      <th className="py-3 px-4">Book</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">ISBN / Publisher</th>
                      <th className="py-3 px-4">Year</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedBooks.map((book) => {
                      const isAvailable = book.availableCopies > 0;
                      return (
                        <tr key={book.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-10 h-14 object-cover rounded-md shadow-2xs border border-slate-200 shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100';
                                }}
                              />
                              <div>
                                <Link
                                  to={`/books/${book.id}`}
                                  className="font-bold text-slate-900 hover:text-indigo-600 line-clamp-1 text-xs sm:text-sm"
                                >
                                  {book.title}
                                </Link>
                                <p className="text-[11px] text-slate-500 font-medium">{book.author}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {book.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                            <div>{book.isbn}</div>
                            <div className="text-[10px] text-slate-400 font-sans">{book.publisher}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-mono">
                            {book.publishedYear}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                isAvailable
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                              {book.availableCopies} / {book.totalCopies}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <Link
                                to={`/books/${book.id}`}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleOpenEdit(book)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Book"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenDelete(book)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Book"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )
      )}

      {/* Pagination Footer */}
      {!loading && filteredBooks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
          
          {/* Page Size & Item Count */}
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-800">{Math.min((currentPage - 1) * pageSize + 1, filteredBooks.length)}</strong> to{' '}
              <strong className="text-slate-800">{Math.min(currentPage * pageSize, filteredBooks.length)}</strong> of{' '}
              <strong className="text-slate-800">{filteredBooks.length}</strong> books
            </span>

            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 outline-hidden font-semibold cursor-pointer"
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
              </select>
            </div>
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Add / Edit Unified Modal */}
      <BookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialBook={selectedBook}
        mode={modalMode}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBookToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        bookTitle={bookToDelete?.title}
        isDeleting={isDeleting}
      />

    </div>
  );
}
