import axios from 'axios';
import { dashboardService } from './dashboardService';

const BOOKS_STORAGE_KEY = 'lms_books_store';
const OPEN_LIBRARY_SEARCH_API = 'https://openlibrary.org/search.json';
const OPEN_LIBRARY_SUBJECT_API = 'https://openlibrary.org/subjects';

// Academic Category Mapping helper based on book subjects
const mapCategoryFromSubjects = (subjects, index) => {
  const academicCategories = [
    'Computer Science',
    'Literature & Fiction',
    'Engineering & Tech',
    'Natural Sciences',
    'History & Biography',
    'Philosophy & Ethics',
    'Mathematics & Logic'
  ];

  if (!subjects || subjects.length === 0) {
    return academicCategories[index % academicCategories.length];
  }

  const subStr = Array.isArray(subjects) ? subjects.join(' ').toLowerCase() : String(subjects).toLowerCase();

  if (
    subStr.includes('computer') ||
    subStr.includes('programming') ||
    subStr.includes('software') ||
    subStr.includes('algorithm') ||
    subStr.includes('data') ||
    subStr.includes('artificial intelligence')
  ) {
    return 'Computer Science';
  }
  if (
    subStr.includes('fiction') ||
    subStr.includes('literature') ||
    subStr.includes('drama') ||
    subStr.includes('poetry') ||
    subStr.includes('novel') ||
    subStr.includes('classic')
  ) {
    return 'Literature & Fiction';
  }
  if (
    subStr.includes('engineering') ||
    subStr.includes('technology') ||
    subStr.includes('mechanical') ||
    subStr.includes('electrical') ||
    subStr.includes('civil')
  ) {
    return 'Engineering & Tech';
  }
  if (
    subStr.includes('physics') ||
    subStr.includes('chemistry') ||
    subStr.includes('biology') ||
    subStr.includes('astronomy') ||
    subStr.includes('environment') ||
    subStr.includes('science')
  ) {
    return 'Natural Sciences';
  }
  if (
    subStr.includes('history') ||
    subStr.includes('biography') ||
    subStr.includes('civilization') ||
    subStr.includes('historical') ||
    subStr.includes('war')
  ) {
    return 'History & Biography';
  }
  if (
    subStr.includes('philosophy') ||
    subStr.includes('ethics') ||
    subStr.includes('moral') ||
    subStr.includes('logic')
  ) {
    return 'Philosophy & Ethics';
  }
  if (
    subStr.includes('mathematics') ||
    subStr.includes('algebra') ||
    subStr.includes('calculus') ||
    subStr.includes('geometry') ||
    subStr.includes('statistics')
  ) {
    return 'Mathematics & Logic';
  }

  return academicCategories[index % academicCategories.length];
};

// Transform Open Library Doc to Book
const transformOpenLibraryDocToBook = (doc, index) => {
  const category = mapCategoryFromSubjects(doc.subject, index);
  const total = doc.edition_count
    ? Math.min(12, Math.max(4, Math.floor(doc.edition_count / 10) + 4))
    : 6 + (index % 5);
  const available = Math.max(1, total - 1);

  // Derive ISBN
  let isbn = `978-0${String(index + 1).padStart(2, '0')}-${Math.floor(100000 + (index + 1) * 73921)}-${(index + 1) % 9}`;
  if (doc.isbn && doc.isbn.length > 0) {
    const valid13 = doc.isbn.find((i) => i.startsWith('978') || i.length === 13);
    isbn = valid13 || doc.isbn[0];
  }

  // Cover image
  let coverImage = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500';
  if (doc.cover_i) {
    coverImage = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
  } else if (doc.cover_id) {
    coverImage = `https://covers.openlibrary.org/b/id/${doc.cover_id}-L.jpg`;
  }

  const author = doc.author_name
    ? doc.author_name[0]
    : doc.authors
    ? doc.authors[0].name
    : 'Acclaimed Scholar';
  const publisher = doc.publisher
    ? Array.isArray(doc.publisher)
      ? doc.publisher[0]
      : doc.publisher
    : 'University Press International';

  return {
    id: `book-${index + 1}`,
    apiId: doc.key || `/works/OL${index + 1}W`,
    title: doc.title,
    author,
    isbn,
    publisher,
    category,
    publishedYear: doc.first_publish_year || 2018 + (index % 6),
    availableCopies: available,
    totalCopies: total,
    coverImage,
    description:
      doc.subject && doc.subject.length > 0
        ? `A canonical scholarly volume examining ${doc.subject.slice(0, 4).join(', ')}. Cataloged live from Open Library Books API.`
        : 'Comprehensive monograph cataloged live from Open Library Books API.'
  };
};

// Transform Open Library Subject Work to Book
const transformOpenLibraryWorkToBook = (work, index) => {
  const category = mapCategoryFromSubjects(work.subject, index);
  const total = 5 + (index % 5);
  const available = total - 1;

  let coverImage = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500';
  if (work.cover_id) {
    coverImage = `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`;
  }

  const author = work.authors && work.authors.length > 0 ? work.authors[0].name : 'Distinguished Author';

  return {
    id: `book-${index + 1}`,
    apiId: work.key || `/works/OL${index + 1}W`,
    title: work.title,
    author,
    isbn: `978-0${String(index + 1).padStart(2, '0')}-${Math.floor(200000 + (index + 1) * 54321)}-${(index + 1) % 9}`,
    publisher: 'Open Academic Press',
    category,
    publishedYear: work.first_publish_year || 2019 + (index % 5),
    availableCopies: available,
    totalCopies: total,
    coverImage,
    description:
      work.subject && work.subject.length > 0
        ? `Authoritative volume addressing ${work.subject.slice(0, 3).join(', ')}. Sourced directly from Open Library Books API.`
        : 'Scholarly cataloged publication from Open Library Books API.'
  };
};

export const bookService = {
  // Save books to localStorage cache
  saveBooks(books) {
    try {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
    } catch (e) {
      console.error('Error saving books to localStorage', e);
    }
  },

  // Get currently stored books from local cache with dynamic availableCopies calculation
  getAllBooks() {
    try {
      const stored = localStorage.getItem(BOOKS_STORAGE_KEY);
      if (stored) {
        const books = JSON.parse(stored);
        let activeLoansByBook = {};
        try {
          const storedLoans = localStorage.getItem('lms_loans_store');
          if (storedLoans) {
            const loans = JSON.parse(storedLoans);
            loans.forEach((l) => {
              if (l.status !== 'Returned') {
                activeLoansByBook[l.bookId] = (activeLoansByBook[l.bookId] || 0) + 1;
              }
            });
          }
        } catch {
          // fallback
        }

        return books.map((b) => {
          const loansCount = activeLoansByBook[b.id] || 0;
          const total = parseInt(b.totalCopies, 10) || 5;
          const available = Math.max(0, total - loansCount);
          return {
            ...b,
            totalCopies: total,
            availableCopies: available
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  },

  getBookById(id) {
    const books = this.getAllBooks();
    return books.find((b) => String(b.id) === String(id)) || null;
  },

  // Fetch books from Open Library Books API (Dedicated Books API Architecture)
  async fetchBooksFromApi(limit = 25, force = false) {
    const existing = this.getAllBooks();
    // Validate if existing cache contains genuine Open Library books
    const hasValidOpenLibraryBooks =
      existing &&
      existing.length > 0 &&
      existing.every((b) => b.apiId && String(b.apiId).includes('/works/'));

    if (!force && hasValidOpenLibraryBooks) {
      return { success: true, books: existing, source: 'cache (Open Library)' };
    }

    try {
      // Primary Call: Open Library Search API
      const res = await axios.get(
        `${OPEN_LIBRARY_SEARCH_API}?q=computer+programming+science+literature+history&limit=${limit}&fields=key,title,author_name,first_publish_year,isbn,cover_i,publisher,subject`,
        {
          timeout: 10000,
          headers: { 'User-Agent': 'AntigravityLibrary/2.0' }
        }
      );

      const docs = res.data?.docs || [];
      if (docs.length === 0) {
        throw new Error('No book records returned from Open Library search');
      }

      const transformed = docs.map(transformOpenLibraryDocToBook);
      this.saveBooks(transformed);

      return { success: true, books: transformed, source: 'Open Library Books API' };
    } catch (primaryErr) {
      console.warn('Open Library search failed, trying Open Library Subjects API fallback:', primaryErr.message);

      try {
        // Fallback Call: Open Library Subjects API
        const [csRes, litRes] = await Promise.all([
          axios.get(`${OPEN_LIBRARY_SUBJECT_API}/computer_science.json?limit=13`, {
            timeout: 8000,
            headers: { 'User-Agent': 'AntigravityLibrary/2.0' }
          }),
          axios.get(`${OPEN_LIBRARY_SUBJECT_API}/literature.json?limit=12`, {
            timeout: 8000,
            headers: { 'User-Agent': 'AntigravityLibrary/2.0' }
          })
        ]);

        const works = [...(csRes.data?.works || []), ...(litRes.data?.works || [])];
        const transformedWorks = works.map(transformOpenLibraryWorkToBook);

        this.saveBooks(transformedWorks);
        return { success: true, books: transformedWorks, source: 'Open Library Subjects API' };
      } catch (fallbackErr) {
        console.error('All Open Library Books API endpoints failed:', fallbackErr);

        if (existing && existing.length > 0) {
          return { success: true, books: existing, source: 'cache (offline)' };
        }

        return {
          success: false,
          message: primaryErr.message || 'Error communicating with Open Library Books API'
        };
      }
    }
  },

  // Add new book via API
  async addBook(bookData) {
    const books = this.getAllBooks();
    const newId = `book-${Date.now()}`;

    const newBook = {
      id: newId,
      apiId: `/works/OL${Math.floor(10000000 + Math.random() * 90000000)}W`,
      title: bookData.title.trim(),
      author: bookData.author.trim(),
      isbn: bookData.isbn ? bookData.isbn.trim() : `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      publisher: bookData.publisher ? bookData.publisher.trim() : 'University Press',
      category: bookData.category || 'Computer Science',
      publishedYear: parseInt(bookData.publishedYear, 10) || new Date().getFullYear(),
      availableCopies: parseInt(bookData.availableCopies, 10) || parseInt(bookData.totalCopies, 10) || 5,
      totalCopies: parseInt(bookData.totalCopies, 10) || 5,
      coverImage:
        bookData.coverImage && bookData.coverImage.trim() !== ''
          ? bookData.coverImage.trim()
          : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
      description: bookData.description ? bookData.description.trim() : 'No synopsis provided.'
    };

    books.unshift(newBook);
    this.saveBooks(books);

    dashboardService.recordNewBook({
      title: newBook.title,
      category: newBook.category,
      copies: newBook.totalCopies
    });

    return { success: true, book: newBook };
  },

  // Edit existing book
  async updateBook(id, updatedData) {
    const books = this.getAllBooks();
    const index = books.findIndex((b) => String(b.id) === String(id));

    if (index === -1) {
      return { success: false, message: 'Book record not found' };
    }

    const current = books[index];
    const total =
      updatedData.totalCopies !== undefined
        ? parseInt(updatedData.totalCopies, 10)
        : current.totalCopies;

    let available =
      updatedData.availableCopies !== undefined
        ? parseInt(updatedData.availableCopies, 10)
        : current.availableCopies;

    if (available > total) available = total;

    const modifiedBook = {
      ...current,
      ...updatedData,
      totalCopies: total,
      availableCopies: available,
      publishedYear: updatedData.publishedYear
        ? parseInt(updatedData.publishedYear, 10)
        : current.publishedYear
    };

    books[index] = modifiedBook;
    this.saveBooks(books);
    return { success: true, book: modifiedBook };
  },

  // Delete book
  async deleteBook(id) {
    const books = this.getAllBooks();
    const targetBook = books.find((b) => String(b.id) === String(id));

    if (!targetBook) {
      return { success: false, message: 'Book not found' };
    }

    const filtered = books.filter((b) => String(b.id) !== String(id));
    this.saveBooks(filtered);
    return { success: true, message: `"${targetBook.title}" removed from catalog.` };
  },

  // Get distinct categories
  getCategories() {
    const books = this.getAllBooks();
    const categories = Array.from(new Set(books.map((b) => b.category))).filter(Boolean);
    return categories.sort();
  },

  // Get distinct authors
  getAuthors() {
    const books = this.getAllBooks();
    const authors = Array.from(new Set(books.map((b) => b.author))).filter(Boolean);
    return authors.sort();
  }
};
