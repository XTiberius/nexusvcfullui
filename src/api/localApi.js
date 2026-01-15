// Base44 removed: use local offline API (no auth redirects).
// This is a localStorage-backed implementation that works offline without authentication.

// Helper function to safely access localStorage
const getStorage = () => {
  try {
    return window.localStorage;
  } catch (e) {
    // Private browsing mode or localStorage disabled
    console.warn('localStorage not available, using in-memory storage');
    return {
      _data: {},
      getItem(key) {
        return this._data[key] || null;
      },
      setItem(key, value) {
        this._data[key] = value;
      },
      removeItem(key) {
        delete this._data[key];
      },
      clear() {
        this._data = {};
      }
    };
  }
};

const storage = getStorage();

// Generate a unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generic entity storage key
const getEntityKey = (entityName) => `localApi:${entityName}:v1`;

// Generic entity class
class EntityClass {
  constructor(name) {
    this.name = name;
    this.storageKey = getEntityKey(name);
  }

  // Get all entities from storage
  _getAll() {
    try {
      const data = storage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading ${this.name} from storage:`, e);
      return [];
    }
  }

  // Save all entities to storage
  _saveAll(entities) {
    try {
      storage.setItem(this.storageKey, JSON.stringify(entities));
      return true;
    } catch (e) {
      console.error(`Error saving ${this.name} to storage:`, e);
      return false;
    }
  }

  // List all entities with optional sorting
  list(sortBy = '-created_date', limit = null) {
    let entities = this._getAll();
    
    // Sort entities
    if (sortBy) {
      const [field, direction] = sortBy.startsWith('-') 
        ? [sortBy.slice(1), 'desc'] 
        : [sortBy, 'asc'];
      
      entities.sort((a, b) => {
        const aVal = a[field] || '';
        const bVal = b[field] || '';
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return direction === 'desc' ? -comparison : comparison;
      });
    }
    
    // Apply limit
    if (limit && limit > 0) {
      entities = entities.slice(0, limit);
    }
    
    return Promise.resolve(entities);
  }

  // Filter entities by criteria
  filter(criteria = {}, sortBy = '-created_date', limit = null) {
    let entities = this._getAll();
    
    // Apply filters
    if (Object.keys(criteria).length > 0) {
      entities = entities.filter(entity => {
        return Object.entries(criteria).every(([key, value]) => {
          return entity[key] === value;
        });
      });
    }
    
    // Sort entities
    if (sortBy) {
      const [field, direction] = sortBy.startsWith('-') 
        ? [sortBy.slice(1), 'desc'] 
        : [sortBy, 'asc'];
      
      entities.sort((a, b) => {
        const aVal = a[field] || '';
        const bVal = b[field] || '';
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return direction === 'desc' ? -comparison : comparison;
      });
    }
    
    // Apply limit
    if (limit && limit > 0) {
      entities = entities.slice(0, limit);
    }
    
    return Promise.resolve(entities);
  }

  // Create a new entity
  create(data) {
    const entities = this._getAll();
    const newEntity = {
      id: generateId(),
      ...data,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };
    entities.push(newEntity);
    this._saveAll(entities);
    return Promise.resolve(newEntity);
  }

  // Update an entity
  update(id, data) {
    const entities = this._getAll();
    const index = entities.findIndex(e => e.id === id);
    if (index === -1) {
      return Promise.reject(new Error(`${this.name} with id ${id} not found`));
    }
    entities[index] = {
      ...entities[index],
      ...data,
      updated_date: new Date().toISOString(),
    };
    this._saveAll(entities);
    return Promise.resolve(entities[index]);
  }

  // Delete an entity
  delete(id) {
    const entities = this._getAll();
    const filtered = entities.filter(e => e.id !== id);
    if (filtered.length === entities.length) {
      return Promise.reject(new Error(`${this.name} with id ${id} not found`));
    }
    this._saveAll(filtered);
    return Promise.resolve({ success: true });
  }
}

// Mock auth object
const auth = {
  // Get current user (mock user for local development)
  me() {
    const userData = storage.getItem('localApi:user');
    if (userData) {
      return Promise.resolve(JSON.parse(userData));
    }
    // Return a default mock user
    const defaultUser = {
      id: 'local-user-1',
      email: 'user@example.com',
      full_name: 'Local User',
      created_date: new Date().toISOString(),
    };
    storage.setItem('localApi:user', JSON.stringify(defaultUser));
    return Promise.resolve(defaultUser);
  },

  // Check if authenticated (always true for local API)
  isAuthenticated() {
    return Promise.resolve(true);
  },

  // Logout (just clears user data)
  logout(redirectUrl = null) {
    storage.removeItem('localApi:user');
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
    return Promise.resolve();
  },

  // Redirect to login (no-op for local API)
  redirectToLogin(redirectUrl = null) {
    console.log('Login redirect called (no-op in local mode)');
    return Promise.resolve();
  },
};

// Mock integrations object (for file uploads, etc.)
const integrations = {
  Core: {
    UploadFile: async ({ file }) => {
      // Return a mock file URL
      return Promise.resolve({
        file_url: `https://example.com/uploads/${file.name || 'file'}`,
      });
    },
  },
};

// Mock appLogs object
const appLogs = {
  logUserInApp: async (pageName) => {
    console.log(`User logged in app: ${pageName}`);
    return Promise.resolve();
  },
};

// Create entity instances
const entities = {
  Company: new EntityClass('Company'),
  Deal: new EntityClass('Deal'),
  Investment: new EntityClass('Investment'),
  Entity: new EntityClass('Entity'),
  AccessRequest: new EntityClass('AccessRequest'),
  User: new EntityClass('User'),
  NDA: new EntityClass('NDA'),
  Transaction: new EntityClass('Transaction'),
};

// Export the local API that mimics Base44 structure
export const localApi = {
  entities,
  auth,
  integrations,
  appLogs,
};

// Also export individual entities for convenience
export const Company = entities.Company;
export const Deal = entities.Deal;
export const Investment = entities.Investment;
export const Entity = entities.Entity;
export const AccessRequest = entities.AccessRequest;
export const User = entities.User;
export const NDA = entities.NDA;
export const Transaction = entities.Transaction;
