import { Link } from 'react-router-dom';
import { User, Eye, Edit2, Trash2, Calendar, Building2 } from 'lucide-react';

export default function BookCard({ book, onEdit, onDelete }) {
  const isAvailable = book.availableCopies > 0;

  // Category Color Map
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Computer Science':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Literature & Fiction':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'Engineering & Tech':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Natural Sciences':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'History & Biography':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Philosophy & Ethics':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Mathematics & Logic':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Cover Image & Category Badge Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={book.coverImage}
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

        {/* Category Pill Top-Left */}
        <div className="absolute top-3 left-3">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs backdrop-blur-md ${getCategoryColor(book.category)}`}>
            {book.category}
          </span>
        </div>

        {/* Copies Availability Pill Bottom-Left */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs flex items-center gap-1.5 backdrop-blur-md ${
              isAvailable
                ? 'bg-emerald-500/90 text-white border-emerald-400'
                : 'bg-rose-500/90 text-white border-rose-400'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-white' : 'bg-red-200'}`}></span>
            {isAvailable ? `${book.availableCopies} of ${book.totalCopies} Available` : 'All Copies Loaned'}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <Link
            to={`/books/${book.id}`}
            className="block text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1"
            title={book.title}
          >
            {book.title}
          </Link>

          {/* Author */}
          <p className="text-xs text-slate-600 mt-1 flex items-center gap-1 font-medium truncate">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{book.author}</span>
          </p>

          {/* Metadata Snippet */}
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
            <span className="flex items-center gap-1 truncate max-w-[130px]" title={book.publisher}>
              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{book.publisher}</span>
            </span>
            <span className="flex items-center gap-1 shrink-0 font-mono">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{book.publishedYear}</span>
            </span>
          </div>

          <div className="mt-1 text-[10px] font-mono text-slate-400 truncate">
            ISBN: {book.isbn}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
          <Link
            to={`/books/${book.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 rounded-xl transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </Link>

          <button
            onClick={() => onEdit(book)}
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
            title="Edit Book Details"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(book)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Delete from Catalog"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
