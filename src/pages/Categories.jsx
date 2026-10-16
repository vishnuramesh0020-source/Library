import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  ArrowRight,
  TrendingUp,
  Copy,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { bookService } from '../services/bookService';
import CategoryModal from '../components/categories/CategoryModal';
import DeleteCategoryModal from '../components/categories/DeleteCategoryModal';

export default function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState(() => categoryService.getCategoriesWithStats());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('booksDesc'); // 'booksDesc' | 'nameAsc' | 'copiesDesc'

  // Ensure API books are loaded so category stats are accurate
  useEffect(() => {
    const load = async () => {
      const books = bookService.getAllBooks();
      if (!books || books.length === 0 || !books.every((b) => b.apiId && String(b.apiId).includes('/works/'))) {
        await bookService.fetchBooksFromApi(25);
        setCategories(categoryService.getCategoriesWithStats());
      }
    };
    load();
  }, []);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const refreshData = () => {
    setCategories(categoryService.getCategoriesWithStats());
  };

  // Filtered & sorted categories
  const filteredCategories = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return categories
      .filter((cat) => {
        return (
          !term ||
          cat.name.toLowerCase().includes(term) ||
          cat.description?.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'booksDesc') return b.bookCount - a.bookCount;
        if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
        if (sortBy === 'copiesDesc') return b.totalCopies - a.totalCopies;
        return 0;
      });
  }, [categories, searchTerm, sortBy]);

  // Overall Statistics
  const totalCategories = categories.length;
  const totalBooks = categories.reduce((sum, c) => sum + c.bookCount, 0);
  const totalCopies = categories.reduce((sum, c) => sum + c.totalCopies, 0);
  const topCategory = [...categories].sort((a, b) => b.bookCount - a.bookCount)[0];

  const handleOpenAdd = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setCategoryToEdit(cat);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (cat) => {
    setCategoryToDelete(cat);
    setIsDeleteModalOpen(true);
  };

  const handleBrowseCategory = (categoryName) => {
    navigate(`/books?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Taxonomy Management • {totalCategories} Registered Categories
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize academic genres, manage taxonomy classifications, and review distribution across catalog holdings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshData}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Refresh Categories"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Categories */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Categories
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalCategories}</span>
            <span className="text-xs text-indigo-600 font-medium">Classifications</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Academic subject streams</p>
        </div>

        {/* Card 2: Catalog Titles */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Categorized Titles
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalBooks}</span>
            <span className="text-xs text-blue-600 font-medium">Catalog items</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Total monographs cataloged</p>
        </div>

        {/* Card 3: Total Inventory Copies */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Physical Copies
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Copy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalCopies}</span>
            <span className="text-xs text-emerald-600 font-medium">Shelf copies</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Across all catalog disciplines</p>
        </div>

        {/* Card 4: Top Stream */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Primary Discipline
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2 min-w-0">
            <span className="text-base font-black text-slate-900 truncate">
              {topCategory?.name || 'N/A'}
            </span>
            <span className="text-xs text-amber-600 font-medium shrink-0">
              ({topCategory?.bookCount || 0} books)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Most populated genre</p>
        </div>

      </div>

      {/* Search & Sorting Toolbar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search category name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 outline-hidden cursor-pointer"
          >
            <option value="booksDesc">Most Books First</option>
            <option value="copiesDesc">Total Copies First</option>
            <option value="nameAsc">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200/80">
            <FolderOpen className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-base font-bold text-slate-700">No categories found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your category search term.</p>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="group bg-white rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-4 space-y-3">
                
                {/* Category Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-3.5 h-3.5 rounded-full ${cat.colorBadge || 'bg-indigo-500'} shrink-0`}></span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {cat.name}
                    </h3>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                    {cat.bookCount} {cat.bookCount === 1 ? 'Book' : 'Books'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                  {cat.description || 'Monographs and research literature cataloged in this branch.'}
                </p>

                {/* Copies Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Stock</span>
                    <span className="font-bold text-slate-800">{cat.totalCopies} Copies</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">On Shelf</span>
                    <span className="font-bold text-emerald-600">{cat.availableCopies} Available</span>
                  </div>
                </div>

                {/* Sample Monograph Covers */}
                {cat.sampleBooks && cat.sampleBooks.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1.5">
                      Sample Monographs
                    </span>
                    <div className="flex items-center gap-2">
                      {cat.sampleBooks.map((b) => (
                        <img
                          key={b.id}
                          src={b.coverImage}
                          alt={b.title}
                          title={b.title}
                          className="w-7 h-10 object-cover rounded shadow-2xs border border-slate-200 hover:scale-105 transition-transform"
                        />
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleBrowseCategory(cat.name)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Filter Books</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDelete(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCategoryToEdit(null);
        }}
        category={categoryToEdit}
        onSuccess={refreshData}
      />

      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        category={categoryToDelete}
        allCategories={categories}
        onSuccess={refreshData}
      />

    </div>
  );
}
