import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  BookOpen,
  User,
  Barcode,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { bookService } from '../../services/bookService';

const RECENT_SEARCHES_KEY = 'lms_recent_searches';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [searchScope, setSearchScope] = useState('all'); // 'all' | 'title' | 'author' | 'isbn' | 'category'
  const [books, setBooks] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  // Load books and recent searches on modal open
  useEffect(() => {
    if (isOpen) {
      const current = bookService.getAllBooks();
      setBooks(current);
      if (!current || current.length === 0 || !current.every((b) => b.apiId && String(b.apiId).includes('/works/'))) {
        bookService.fetchBooksFromApi(25).then((res) => {
          if (res.success && res.books) {
            setBooks(res.books);
          }
        });
      }
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) setRecentSearches(JSON.parse(stored));
      } catch {
        // fallback
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global key listener for Ctrl+K and Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Save query to recent searches
  const recordRecentSearch = (text) => {
    if (!text || text.trim().length < 2) return;
    const clean = text.trim();
    const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  // Filtered results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const cleanIsbnQuery = q.replace(/[^0-9xX]/g, '');

    return books.filter((book) => {
      const titleMatch = book.title?.toLowerCase().includes(q);
      const authorMatch = book.author?.toLowerCase().includes(q);
      const categoryMatch = book.category?.toLowerCase().includes(q);
      
      const cleanBookIsbn = (book.isbn || '').replace(/[^0-9xX]/g, '').toLowerCase();
      const isbnMatch = (book.isbn && book.isbn.toLowerCase().includes(q)) ||
        (cleanIsbnQuery.length > 2 && cleanBookIsbn.includes(cleanIsbnQuery));

      if (searchScope === 'title') return titleMatch;
      if (searchScope === 'author') return authorMatch;
      if (searchScope === 'isbn') return isbnMatch;
      if (searchScope === 'category') return categoryMatch;

      // 'all' scope
      return titleMatch || authorMatch || isbnMatch || categoryMatch;
    });
  }, [books, query, searchScope]);

  if (!isOpen) return null;

  const handleSelectBook = (book) => {
    recordRecentSearch(query || book.title);
    onClose();
    navigate(`/books/${book.id}`);
  };

  const handleViewAllInCatalog = () => {
    recordRecentSearch(query);
    onClose();
    navigate(`/books?search=${encodeURIComponent(query)}&scope=${searchScope}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Search Bar Input */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200/80 bg-white">
          <Search className="w-5 h-5 text-indigo-600 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Global Search: book title, author, ISBN, or academic category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results.length > 0) {
                handleSelectBook(results[0]);
              }
            }}
            className="w-full text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent outline-hidden font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors mr-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Search Scope Filter Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 bg-slate-50/80 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Search In:
          </span>
          {[
            { id: 'all', label: 'All Fields', icon: Search },
            { id: 'title', label: 'Book Title', icon: BookOpen },
            { id: 'author', label: 'Author', icon: User },
            { id: 'isbn', label: 'ISBN Code', icon: Barcode },
            { id: 'category', label: 'Category', icon: Layers }
          ].map((scope) => {
            const Icon = scope.icon;
            const isSelected = searchScope === scope.id;
            return (
              <button
                key={scope.id}
                type="button"
                onClick={() => setSearchScope(scope.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{scope.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results Area */}
        <div className="p-3 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-1">
          {query.trim() === '' ? (
            /* Empty State & Recent Searches */
            <div className="py-6 px-4 space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Recent Queries
                    </span>
                    <button
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem(RECENT_SEARCHES_KEY);
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(term)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center py-6 text-slate-400 space-y-1">
                <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">Quickly find any book in Athenaeum</p>
                <p className="text-[11px] text-slate-400">
                  Search by title (e.g. "Clean Architecture"), author, ISBN, or genre
                </p>
              </div>
            </div>
          ) : results.length === 0 ? (
            /* No Results */
            <div className="text-center py-10 px-4 space-y-2">
              <AlertCircle className="w-9 h-9 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No matching monographs found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No items matched "{query}" under the {searchScope === 'all' ? 'entire catalog' : searchScope} scope.
              </p>
            </div>
          ) : (
            /* Results List */
            results.map((book) => {
              const isAvailable = book.availableCopies > 0;
              return (
                <div
                  key={book.id}
                  onClick={() => handleSelectBook(book)}
                  className="p-3 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                      alt={book.title}
                      className="w-9 h-13 object-cover rounded-md border border-slate-200 shrink-0 shadow-2xs"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{book.author}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-400">ISBN: {book.isbn}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {book.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isAvailable ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{book.availableCopies} avail</span>
                        </>
                      ) : (
                        <span>Out of Stock</span>
                      )}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        {query.trim() !== '' && results.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Found <strong className="text-slate-800">{results.length}</strong> matching book(s)
            </span>
            <button
              onClick={handleViewAllInCatalog}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View full results in Books Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
