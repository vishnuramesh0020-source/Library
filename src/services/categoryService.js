import { bookService } from './bookService';
import { dashboardService } from './dashboardService';

const CATEGORIES_STORAGE_KEY = 'lms_categories_store';

export const INITIAL_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'Computer Science',
    slug: 'computer-science',
    description: 'Software engineering, system architectures, distributed systems, algorithms, and computing principles.',
    color: 'indigo', // bg-indigo-50 text-indigo-700 border-indigo-200
    colorBadge: 'bg-indigo-500',
    createdAt: '2024-01-10'
  },
  {
    id: 'cat-2',
    name: 'Literature & Fiction',
    slug: 'literature-fiction',
    description: 'Classic novels, modern narrative fiction, literary criticism, and canonical world literature.',
    color: 'violet',
    colorBadge: 'bg-violet-500',
    createdAt: '2024-01-12'
  },
  {
    id: 'cat-3',
    name: 'Engineering & Tech',
    slug: 'engineering-tech',
    description: 'Civil, mechanical, electrical engineering monographs, applied technology, and computational design.',
    color: 'blue',
    colorBadge: 'bg-blue-500',
    createdAt: '2024-01-15'
  },
  {
    id: 'cat-4',
    name: 'Natural Sciences',
    slug: 'natural-sciences',
    description: 'Theoretical physics, astrophysics, cosmology, biology, chemistry, and environmental sciences.',
    color: 'emerald',
    colorBadge: 'bg-emerald-500',
    createdAt: '2024-01-18'
  },
  {
    id: 'cat-5',
    name: 'History & Biography',
    slug: 'history-biography',
    description: 'World history, civilizations, anthropologic studies, autobiographies, and historical archives.',
    color: 'amber',
    colorBadge: 'bg-amber-500',
    createdAt: '2024-01-22'
  },
  {
    id: 'cat-6',
    name: 'Philosophy & Ethics',
    slug: 'philosophy-ethics',
    description: 'Stoicism, moral philosophy, epistemological inquiries, logic, and existential philosophy.',
    color: 'rose',
    colorBadge: 'bg-rose-500',
    createdAt: '2024-01-25'
  },
  {
    id: 'cat-7',
    name: 'Mathematics & Logic',
    slug: 'mathematics-logic',
    description: 'Discrete mathematics, linear algebra, mathematical logic, combinatorics, and proof theory.',
    color: 'teal',
    colorBadge: 'bg-teal-500',
    createdAt: '2024-02-01'
  },
  {
    id: 'cat-8',
    name: 'General Collection',
    slug: 'general-collection',
    description: 'Interdisciplinary works, reference materials, general academic encyclopedias, and unclassified texts.',
    color: 'slate',
    colorBadge: 'bg-slate-500',
    createdAt: '2024-02-10'
  }
];

export const categoryService = {
  // Dynamically generate categories from catalog books
  generateCategoriesFromBooks() {
    const books = bookService.getAllBooks();
    const uniqueCats = Array.from(new Set(books.map((b) => b.category).filter(Boolean)));
    const colorPalette = [
      { color: 'indigo', colorBadge: 'bg-indigo-500' },
      { color: 'violet', colorBadge: 'bg-violet-500' },
      { color: 'blue', colorBadge: 'bg-blue-500' },
      { color: 'emerald', colorBadge: 'bg-emerald-500' },
      { color: 'amber', colorBadge: 'bg-amber-500' },
      { color: 'rose', colorBadge: 'bg-rose-500' },
      { color: 'teal', colorBadge: 'bg-teal-500' },
      { color: 'slate', colorBadge: 'bg-slate-500' }
    ];

    if (uniqueCats.length === 0) {
      return INITIAL_CATEGORIES;
    }

    return uniqueCats.map((catName, idx) => {
      const palette = colorPalette[idx % colorPalette.length];
      return {
        id: `cat-${idx + 1}`,
        name: catName,
        slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: `Scholarly holdings, research publications, and treatises cataloged in ${catName}.`,
        color: palette.color,
        colorBadge: palette.colorBadge,
        createdAt: new Date().toISOString().split('T')[0]
      };
    });
  },

  initCategories() {
    try {
      const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      let categories = stored ? JSON.parse(stored) : [];

      const books = bookService.getAllBooks();
      if (books.length > 0) {
        const existingNames = new Set(categories.map((c) => c.name.toLowerCase()));
        const uniqueBookCats = Array.from(new Set(books.map((b) => b.category).filter(Boolean)));
        const colorPalette = [
          { color: 'indigo', colorBadge: 'bg-indigo-500' },
          { color: 'violet', colorBadge: 'bg-violet-500' },
          { color: 'blue', colorBadge: 'bg-blue-500' },
          { color: 'emerald', colorBadge: 'bg-emerald-500' },
          { color: 'amber', colorBadge: 'bg-amber-500' },
          { color: 'rose', colorBadge: 'bg-rose-500' },
          { color: 'teal', colorBadge: 'bg-teal-500' },
          { color: 'slate', colorBadge: 'bg-slate-500' }
        ];

        let added = false;
        uniqueBookCats.forEach((catName, idx) => {
          if (!existingNames.has(catName.toLowerCase())) {
            const palette = colorPalette[(categories.length + idx) % colorPalette.length];
            categories.push({
              id: `cat-${Date.now()}-${idx}`,
              name: catName,
              slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: `Scholarly holdings, research publications, and treatises cataloged in ${catName}.`,
              color: palette.color,
              colorBadge: palette.colorBadge,
              createdAt: new Date().toISOString().split('T')[0]
            });
            existingNames.add(catName.toLowerCase());
            added = true;
          }
        });

        if (added || categories.length === 0) {
          if (categories.length === 0) {
            categories = this.generateCategoriesFromBooks();
          }
          this.saveCategories(categories);
        }
      } else if (categories.length === 0) {
        categories = INITIAL_CATEGORIES;
        this.saveCategories(categories);
      }

      return categories;
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  getAllCategories() {
    return this.initCategories();
  },

  getCategoryById(id) {
    const list = this.getAllCategories();
    return list.find((c) => String(c.id) === String(id)) || null;
  },

  getCategoryByName(name) {
    if (!name) return null;
    const list = this.getAllCategories();
    return list.find((c) => c.name.toLowerCase() === name.trim().toLowerCase()) || null;
  },

  saveCategories(categories) {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories to localStorage', e);
    }
  },

  // Calculate live book statistics per category
  getCategoriesWithStats() {
    const categories = this.getAllCategories();
    const books = bookService.getAllBooks();

    return categories.map((cat) => {
      const matchingBooks = books.filter(
        (b) => b.category && b.category.toLowerCase() === cat.name.toLowerCase()
      );

      const totalCopies = matchingBooks.reduce((sum, b) => sum + (b.totalCopies || 0), 0);
      const availableCopies = matchingBooks.reduce((sum, b) => sum + (b.availableCopies || 0), 0);
      const onLoanCopies = Math.max(0, totalCopies - availableCopies);

      return {
        ...cat,
        bookCount: matchingBooks.length,
        totalCopies,
        availableCopies,
        onLoanCopies,
        sampleBooks: matchingBooks.slice(0, 3)
      };
    });
  },

  // Add new Category with uniqueness validation
  addCategory({ name, description = '', color = 'indigo' }) {
    const categories = this.getAllCategories();
    const trimmedName = name.trim();

    if (!trimmedName) {
      return { success: false, message: 'Category name cannot be empty.' };
    }

    const exists = categories.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      return { success: false, message: `Category "${trimmedName}" already exists.` };
    }

    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const colorMap = {
      indigo: 'bg-indigo-500',
      violet: 'bg-violet-500',
      blue: 'bg-blue-500',
      emerald: 'bg-emerald-500',
      amber: 'bg-amber-500',
      rose: 'bg-rose-500',
      teal: 'bg-teal-500',
      slate: 'bg-slate-500',
      cyan: 'bg-cyan-500',
      orange: 'bg-orange-500'
    };

    const newCategory = {
      id: `cat-${Date.now()}`,
      name: trimmedName,
      slug,
      description: description.trim() || `Monographs and literature belonging to the ${trimmedName} discipline.`,
      color,
      colorBadge: colorMap[color] || 'bg-indigo-500',
      createdAt: new Date().toISOString().split('T')[0]
    };

    categories.push(newCategory);
    this.saveCategories(categories);

    // Sync to dashboardService categories
    try {
      const data = dashboardService.getData();
      data.categories = data.categories || [];
      if (!data.categories.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
        data.categories.push({
          name: trimmedName,
          count: 0,
          color: newCategory.colorBadge
        });
        dashboardService.saveData(data);
      }
    } catch (e) {
      console.warn('Dashboard category sync note:', e);
    }

    return {
      success: true,
      category: newCategory,
      message: `Category "${trimmedName}" created successfully.`
    };
  },

  // Edit existing Category & re-tag all books with the old category name
  updateCategory(id, { name, description = '', color = 'indigo' }) {
    const categories = this.getAllCategories();
    const index = categories.findIndex((c) => String(c.id) === String(id));

    if (index === -1) {
      return { success: false, message: 'Category record not found.' };
    }

    const current = categories[index];
    const newName = name ? name.trim() : current.name;
    const oldName = current.name;

    // Check duplicate name if name changed
    if (newName.toLowerCase() !== oldName.toLowerCase()) {
      const duplicate = categories.some(
        (c) => String(c.id) !== String(id) && c.name.toLowerCase() === newName.toLowerCase()
      );
      if (duplicate) {
        return { success: false, message: `Another category with name "${newName}" already exists.` };
      }
    }

    const colorMap = {
      indigo: 'bg-indigo-500',
      violet: 'bg-violet-500',
      blue: 'bg-blue-500',
      emerald: 'bg-emerald-500',
      amber: 'bg-amber-500',
      rose: 'bg-rose-500',
      teal: 'bg-teal-500',
      slate: 'bg-slate-500',
      cyan: 'bg-cyan-500',
      orange: 'bg-orange-500'
    };

    const updatedCategory = {
      ...current,
      name: newName,
      slug: newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: description !== undefined ? description.trim() : current.description,
      color: color || current.color,
      colorBadge: colorMap[color] || current.colorBadge
    };

    categories[index] = updatedCategory;
    this.saveCategories(categories);

    // If name changed, synchronize books in the catalog!
    if (newName !== oldName) {
      try {
        const books = bookService.getAllBooks();
        let updatedCount = 0;
        const modifiedBooks = books.map((b) => {
          if (b.category && b.category.toLowerCase() === oldName.toLowerCase()) {
            updatedCount += 1;
            return { ...b, category: newName };
          }
          return b;
        });

        if (updatedCount > 0) {
          bookService.saveBooks(modifiedBooks);
        }

        // Sync to dashboardService
        const dashData = dashboardService.getData();
        if (dashData.categories) {
          const dashCat = dashData.categories.find((c) => c.name.toLowerCase() === oldName.toLowerCase());
          if (dashCat) {
            dashCat.name = newName;
            dashCat.color = updatedCategory.colorBadge;
            dashboardService.saveData(dashData);
          }
        }
      } catch (e) {
        console.warn('Sync books note upon category rename:', e);
      }
    }

    return {
      success: true,
      category: updatedCategory,
      message: `Category "${newName}" updated successfully.`
    };
  },

  // Delete category with book reassignment safeguard
  deleteCategory(id, { reassignTo = 'General Collection' } = {}) {
    const categories = this.getAllCategories();
    const index = categories.findIndex((c) => String(c.id) === String(id));

    if (index === -1) {
      return { success: false, message: 'Category not found.' };
    }

    const targetCategory = categories[index];

    // Check if books belong to this category
    const books = bookService.getAllBooks();
    const affectedBooks = books.filter(
      (b) => b.category && b.category.toLowerCase() === targetCategory.name.toLowerCase()
    );

    // Reassign affected books to chosen safe category
    if (affectedBooks.length > 0) {
      const reassignCategory = reassignTo.trim() || 'General Collection';
      const updatedBooks = books.map((b) => {
        if (b.category && b.category.toLowerCase() === targetCategory.name.toLowerCase()) {
          return { ...b, category: reassignCategory };
        }
        return b;
      });
      bookService.saveBooks(updatedBooks);
    }

    const filtered = categories.filter((c) => String(c.id) !== String(id));
    this.saveCategories(filtered);

    // Sync dashboardService
    try {
      const dashData = dashboardService.getData();
      if (dashData.categories) {
        dashData.categories = dashData.categories.filter(
          (c) => c.name.toLowerCase() !== targetCategory.name.toLowerCase()
        );
        dashboardService.saveData(dashData);
      }
    } catch (e) {
      console.warn('Dashboard category sync on delete:', e);
    }

    return {
      success: true,
      affectedCount: affectedBooks.length,
      message: `Category "${targetCategory.name}" removed.${affectedBooks.length > 0 ? ` ${affectedBooks.length} book(s) reassigned to "${reassignTo}".` : ''}`
    };
  },

  // Get summary stats
  getCategoryStats() {
    const list = this.getCategoriesWithStats();
    const totalCategories = list.length;
    const totalBooks = list.reduce((sum, c) => sum + c.bookCount, 0);
    const totalCopies = list.reduce((sum, c) => sum + c.totalCopies, 0);

    // Find top genre by book count
    const sorted = [...list].sort((a, b) => b.bookCount - a.bookCount);
    const topCategory = sorted[0] || null;

    return {
      totalCategories,
      totalBooks,
      totalCopies,
      topCategoryName: topCategory ? topCategory.name : 'N/A',
      topCategoryCount: topCategory ? topCategory.bookCount : 0
    };
  }
};
