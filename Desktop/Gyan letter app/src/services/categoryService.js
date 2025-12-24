// Category management service
const CATEGORIES_KEY = 'data_categories'

export const categoryService = {
  // Get all categories
  getAll() {
    try {
      const categories = localStorage.getItem(CATEGORIES_KEY)
      return categories ? JSON.parse(categories) : this.getDefaultCategories()
    } catch (error) {
      console.error('Error loading categories:', error)
      return this.getDefaultCategories()
    }
  },

  // Get default categories
  getDefaultCategories() {
    return {
      default: {
        name: 'Default',
        type: 'default',
        items: []
      },
      states: {
        name: 'Indian States',
        type: 'states',
        items: []
      },
      universities: {
        name: 'Universities',
        type: 'universities',
        items: []
      },
      emails: {
        name: 'Complete Mails',
        type: 'emails',
        items: []
      }
    }
  },

  // Add a new custom category
  addCategory(categoryName, categoryType = 'custom') {
    const categories = this.getAll()
    const newId = `custom_${Date.now()}`
    categories[newId] = {
      name: categoryName,
      type: categoryType,
      items: [],
      createdAt: new Date().toISOString()
    }
    this.save(categories)
    return newId
  },

  // Rename a category
  renameCategory(categoryId, newName) {
    const categories = this.getAll()
    if (categories[categoryId]) {
      categories[categoryId].name = newName
      categories[categoryId].updatedAt = new Date().toISOString()
      this.save(categories)
      return true
    }
    return false
  },

  // Delete a category
  deleteCategory(categoryId) {
    const categories = this.getAll()
    // Don't allow deleting default categories
    if (['default', 'states', 'universities', 'emails'].includes(categoryId)) {
      return false
    }
    delete categories[categoryId]
    this.save(categories)
    return true
  },

  // Save categories
  save(categories) {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
      return true
    } catch (error) {
      console.error('Error saving categories:', error)
      return false
    }
  },

  // Get category by ID
  getCategory(categoryId) {
    const categories = this.getAll()
    return categories[categoryId] || null
  }
}





