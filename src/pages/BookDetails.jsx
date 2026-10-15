import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Hash,
  Building2,
  Calendar,
  Layers,
  BookOpen,
  Edit2,
  Trash2,
  BookMarked,
  Share2,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import { bookService } from '../services/bookService';
import BookModal from '../components/books/BookModal';
import DeleteConfirmModal from '../components/books/DeleteConfirmModal';
import IssueModal from '../components/loans/IssueModal';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(() => bookService.getBookById(id));
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const found = bookService.getBookById(id);
    setBook(found);

    if (found) {
      // Find related titles by category excluding current book
      const all = bookService.getAllBooks();
      const related = all
        .filter((b) => b.category === found.category && String(b.id) !== String(found.id))
        .slice(0, 4);
      setRelatedBooks(related);
    }
  }, [id]);

  if (!book) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Book Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          The requested book volume or catalog accession ID does not exist in the active repository.
        </p>
        <Link
          to="/books"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;
  const stockPercentage = Math.round((book.availableCopies / (book.totalCopies || 1)) * 100);

  // Open Issue Modal with preselected book
  const handleIssueBook = () => {
    if (!isAvailable) {
      toast.error('No copies currently available to borrow.');
      return;
    }
    setIsIssueModalOpen(true);
  };

  // Delete Book
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const res = await bookService.deleteBook(book.id);
    setIsDeleting(false);

    if (res.success) {
      toast.success(res.message);
      navigate('/books', { replace: true });
    } else {
      toast.error(res.message || 'Failed to delete book.');
    }
  };

  // Copy share link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.info('Book share link copied to clipboard!');
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Navigation & Actions Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/books"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library Catalog</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer"
            title="Share Book Link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Book</span>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Book Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Book Cover Graphic & Stock Status (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100 shadow-md border border-slate-200/80 group">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';
                }}
              />
              <div className="absolute top-3 left-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/90 text-slate-800 border border-slate-200 shadow-sm backdrop-blur-md">
                  {book.category}
                </span>
              </div>
            </div>

            {/* Live Inventory Status Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">Inventory Status</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {isAvailable ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Available on Shelf</span>
                  <span className="font-mono">{book.availableCopies} / {book.totalCopies} copies</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${stockPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Borrow Action Button */}
              <button
                onClick={handleIssueBook}
                disabled={!isAvailable}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                <BookMarked className="w-4 h-4" />
                <span>{isAvailable ? 'Issue / Loan This Copy' : 'Fully Reserved (0 Available)'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Book Details & Description (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Title & Author */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  Accession #{book.id}
                </span>
                <span className="text-xs text-slate-400 font-mono">ISBN {book.isbn}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {book.title}
              </h1>
              <p className="text-base font-medium text-slate-600 mt-2 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span>Written by <strong className="text-slate-900">{book.author}</strong></span>
              </p>
            </div>

            {/* Core Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Publisher
                </span>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate" title={book.publisher}>
                  <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">{book.publisher}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Published Year
                </span>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{book.publishedYear}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Category
                </span>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                  <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">{book.category}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  ISBN Number
                </span>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-mono truncate" title={book.isbn}>
                  <Hash className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">{book.isbn}</span>
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Book Synopsis & Overview
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {book.description || 'No detailed description cataloged for this volume yet.'}
              </p>
            </div>

            {/* Highlights / Features Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2 text-xs text-indigo-900">
              <div className="flex items-center gap-2 font-bold">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Academic Loan Guidelines</span>
              </div>
              <p className="text-slate-600 leading-normal">
                Standard circulation period is 14 calendar days. Renewals can be requested twice if no waiting list hold has been placed by another campus member.
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Related Books in Same Category */}
      {relatedBooks.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              More in {book.category}
            </h3>
            <Link
              to="/books"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              View all in category →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedBooks.map((relBook) => (
              <div
                key={relBook.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-3 hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3"
              >
                <img
                  src={relBook.coverImage}
                  alt={relBook.title}
                  className="w-14 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/books/${relBook.id}`}
                    className="block text-xs font-bold text-slate-900 hover:text-indigo-600 line-clamp-2"
                  >
                    {relBook.title}
                  </Link>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">{relBook.author}</p>
                  <span className="text-[10px] font-bold text-emerald-600 mt-1 block">
                    {relBook.availableCopies} available
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Edit Modal */}
      <BookModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updatedBook) => setBook(updatedBook)}
        initialBook={book}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        bookTitle={book.title}
        isDeleting={isDeleting}
      />

      {/* Circulation Issue Modal */}
      <IssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        preselectedBookId={book.id}
        onSuccess={() => {
          const fresh = bookService.getBookById(id);
          setBook(fresh);
        }}
      />

    </div>
  );
}
