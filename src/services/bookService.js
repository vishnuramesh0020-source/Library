import axios from 'axios';
import { dashboardService } from './dashboardService';

const BOOKS_STORAGE_KEY = 'lms_books_store';
const THIRD_PARTY_API_URL = 'https://dummyjson.com/products';

export const INITIAL_BOOKS = [
  {
    id: 'book-1',
    title: 'Clean Architecture: A Craftsman\'s Guide to Software Structure',
    author: 'Robert C. Martin',
    isbn: '978-0134494166',
    publisher: 'Prentice Hall',
    category: 'Computer Science',
    publishedYear: 2017,
    availableCopies: 5,
    totalCopies: 8,
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    description: 'By applying universal rules of software architecture, you can dramatically improve developer productivity throughout the life of any software system. Uncle Bob presents direct, pragmatic advice for building robust and maintainable frameworks.'
  },
  {
    id: 'book-2',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '978-1449373320',
    publisher: 'O\'Reilly Media',
    category: 'Computer Science',
    publishedYear: 2017,
    availableCopies: 3,
    totalCopies: 6,
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80',
    description: 'Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability. Martin Kleppmann provides an exhaustive technical deep dive.'
  },
  {
    id: 'book-3',
    title: 'The Pragmatic Programmer: Your Journey to Mastery',
    author: 'David Thomas & Andrew Hunt',
    isbn: '978-0135957059',
    publisher: 'Addison-Wesley Professional',
    category: 'Computer Science',
    publishedYear: 2019,
    availableCopies: 7,
    totalCopies: 10,
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=500&auto=format&fit=crop&q=80',
    description: 'The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern software development to examine the core process—taking a requirement and producing working, maintainable code that delights users.'
  },
  {
    id: 'book-4',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen & Charles E. Leiserson',
    isbn: '978-0262046305',
    publisher: 'MIT Press',
    category: 'Mathematics & Logic',
    publishedYear: 2022,
    availableCopies: 2,
    totalCopies: 5,
    coverImage: 'https://images.unsplash.com/photo-1509266272358-7701da638078?w=500&auto=format&fit=crop&q=80',
    description: 'A comprehensive update of the leading algorithms text, with new chapters on bipartite matching, online algorithms, machine learning, and new working implementations throughout.'
  },
  {
    id: 'book-5',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0451524935',
    publisher: 'Signet Classic',
    category: 'Literature & Fiction',
    publishedYear: 1949,
    availableCopies: 6,
    totalCopies: 12,
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80',
    description: 'Written more than 70 years ago, 1984 was George Orwell\'s chilling prophecy about the dystopian totalitarian future. A profound exploration of surveillance, truth, propaganda, and human rebellion.'
  },
  {
    id: 'book-6',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0060935467',
    publisher: 'Harper Perennial',
    category: 'Literature & Fiction',
    publishedYear: 1960,
    availableCopies: 4,
    totalCopies: 8,
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&auto=format&fit=crop&q=80',
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. Compassionate, dramatic, and deeply moving, Harper Lee\'s Pulitzer Prize-winning masterpiece remains timeless.'
  },
  {
    id: 'book-7',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '978-0062316097',
    publisher: 'Harper',
    category: 'History & Biography',
    publishedYear: 2015,
    availableCopies: 8,
    totalCopies: 10,
    coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&auto=format&fit=crop&q=80',
    description: 'One hundred thousand years ago, at least six human species inhabited the earth. Today there is just one: Homo sapiens. How did our species succeed in the battle for dominance? Yuval Noah Harari spans the whole of human history.'
  },
  {
    id: 'book-8',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    isbn: '978-0553380163',
    publisher: 'Bantam Books',
    category: 'Natural Sciences',
    publishedYear: 1988,
    availableCopies: 5,
    totalCopies: 7,
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
    description: 'A landmark volume in science writing by one of the great minds of our time, Stephen Hawking explores profound questions about the universe: How did it begin? What happens inside a black hole? Does time always move forward?'
  },
  {
    id: 'book-9',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    isbn: '978-0812968255',
    publisher: 'Modern Library',
    category: 'Philosophy & Ethics',
    publishedYear: 2002,
    availableCopies: 6,
    totalCopies: 9,
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&auto=format&fit=crop&q=80',
    description: 'A series of personal writings by the Roman Emperor Marcus Aurelius, recording his private notes to himself and ideas on Stoic philosophy, duty, inner peace, and the resilience of the human mind.'
  },
  {
    id: 'book-10',
    title: 'Structure and Interpretation of Computer Programs',
    author: 'Harold Abelson & Gerald Jay Sussman',
    isbn: '978-0262510875',
    publisher: 'MIT Press',
    category: 'Computer Science',
    publishedYear: 1996,
    availableCopies: 3,
    totalCopies: 4,
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80',
    description: 'Widely known as the Wizard Book, SICP introduces core computer science principles using Scheme (Lisp). It teaches fundamental paradigms including abstraction, higher-order procedures, and metalinguistic abstraction.'
  },
  {
    id: 'book-11',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    publisher: 'Scribner',
    category: 'Literature & Fiction',
    publishedYear: 1925,
    availableCopies: 9,
    totalCopies: 15,
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&auto=format&fit=crop&q=80',
    description: 'The story of the fabulously wealthy Jay Gatsby and his new love for the beautiful Daisy Buchanan. A portrait of the Jazz Age in all its decadence and excess that has stood as a consummate American classic.'
  },
  {
    id: 'book-12',
    title: 'Engineering Mechanics: Statics & Dynamics',
    author: 'Russell C. Hibbeler',
    isbn: '978-0133915426',
    publisher: 'Pearson',
    category: 'Engineering & Tech',
    publishedYear: 2015,
    availableCopies: 4,
    totalCopies: 6,
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
    description: 'Empowers students to succeed in civil and mechanical engineering through clear, thorough presentation of engineering statics and dynamics theory alongside practical computational applications.'
  }
];

export const bookService = {
  // Initialize storage if not present
  initBooks() {
    try {
      const stored = localStorage.getItem(BOOKS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(INITIAL_BOOKS));
        return INITIAL_BOOKS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_BOOKS;
    }
  },

  getAllBooks() {
    return this.initBooks();
  },

  getBookById(id) {
    const books = this.getAllBooks();
    return books.find((b) => String(b.id) === String(id)) || null;
  },

  saveBooks(books) {
    try {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
    } catch (e) {
      console.error('Error saving books to localStorage', e);
    }
  },

  // Third-party API Integration (DummyJSON) using Axios
  async fetchThirdPartyBooks(limit = 6) {
    try {
      // Third-party API call via Axios
      const response = await axios.get(`${THIRD_PARTY_API_URL}?limit=${limit}&select=title,description,category,thumbnail,stock`);
      const products = response.data.products || [];

      // Category mapping dictionary
      const categoryMap = {
        beauty: 'Natural Sciences',
        fragrances: 'Natural Sciences',
        furniture: 'Engineering & Tech',
        groceries: 'Natural Sciences',
        laptops: 'Computer Science',
        smartphones: 'Engineering & Tech'
      };

      const transformedBooks = products.map((item, index) => {
        const mappedCategory = categoryMap[item.category] || 'General Literature';
        const total = item.stock || 8;
        const available = Math.max(1, Math.floor(total * 0.7));

        return {
          id: `api-book-${item.id}`,
          title: `Treatise on ${item.title}`,
          author: `Dr. Research Fellow ${index + 1}`,
          isbn: `978-0${Math.floor(100000000 + Math.random() * 900000000)}`,
          publisher: 'Academic Press International',
          category: mappedCategory,
          publishedYear: 2020 + (index % 5),
          availableCopies: available,
          totalCopies: total,
          coverImage: item.thumbnail || `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80`,
          description: `${item.description} A comprehensive technical monograph cataloged from third-party scientific repository archives.`
        };
      });

      return { success: true, books: transformedBooks };
    } catch (error) {
      console.error('Failed to fetch from third-party API:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Third-Party API network error'
      };
    }
  },

  // Add new book with local persistence and simulated third-party post
  async addBook(bookData) {
    const books = this.getAllBooks();
    const newId = `book-${Date.now()}`;

    const newBook = {
      id: newId,
      title: bookData.title.trim(),
      author: bookData.author.trim(),
      isbn: bookData.isbn ? bookData.isbn.trim() : `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      publisher: bookData.publisher ? bookData.publisher.trim() : 'University Press',
      category: bookData.category || 'Computer Science',
      publishedYear: parseInt(bookData.publishedYear, 10) || new Date().getFullYear(),
      availableCopies: parseInt(bookData.availableCopies, 10) || parseInt(bookData.totalCopies, 10) || 5,
      totalCopies: parseInt(bookData.totalCopies, 10) || 5,
      coverImage: bookData.coverImage && bookData.coverImage.trim() !== ''
        ? bookData.coverImage.trim()
        : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
      description: bookData.description ? bookData.description.trim() : 'No synopsis provided.'
    };

    // Try posting to third-party API (simulated)
    try {
      await axios.post(`${THIRD_PARTY_API_URL}/add`, {
        title: newBook.title,
        description: newBook.description,
        category: newBook.category
      });
    } catch (err) {
      // Non-fatal if third-party mockup doesn't write to DB
      console.warn('Third-party API POST simulated notification:', err.message);
    }

    books.unshift(newBook);
    this.saveBooks(books);

    // Sync with dashboardService
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
    const total = updatedData.totalCopies !== undefined
      ? parseInt(updatedData.totalCopies, 10)
      : current.totalCopies;

    let available = updatedData.availableCopies !== undefined
      ? parseInt(updatedData.availableCopies, 10)
      : current.availableCopies;

    // Safety constraint: available cannot exceed total
    if (available > total) available = total;

    const modifiedBook = {
      ...current,
      ...updatedData,
      totalCopies: total,
      availableCopies: available,
      publishedYear: updatedData.publishedYear ? parseInt(updatedData.publishedYear, 10) : current.publishedYear
    };

    // Try sending PUT to third-party API
    try {
      await axios.put(`${THIRD_PARTY_API_URL}/1`, {
        title: modifiedBook.title,
        description: modifiedBook.description
      });
    } catch (err) {
      console.warn('Third-party API PUT simulated notification:', err.message);
    }

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

    // Try sending DELETE to third-party API
    try {
      await axios.delete(`${THIRD_PARTY_API_URL}/1`);
    } catch (err) {
      console.warn('Third-party API DELETE simulated notification:', err.message);
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
