/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs
} from 'firebase/firestore';
import { Book } from './types';

// ==========================================
// firebase.js / firebase.ts config file
// ==========================================
// আপনি সহজেই আপনার Firebase ফায়ারবেস কনফিগারেশনটি এখানে পেস্ট করতে পারেন:
export const firebaseConfig = {
  apiKey: "AIzaSyDZl-7A7ftr6_XH8ZGoR6AATxi4BdCA7YM",
  authDomain: "banglabazar-inventory.firebaseapp.com",
  projectId: "banglabazar-inventory",
  storageBucket: "banglabazar-inventory.firebasestorage.app",
  messagingSenderId: "50287417719",
  appId: "1:50287417719:web:2851eea10fc35108d5a972"
};

// Check if credentials are configured (are not default template strings)
export const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "" && 
  !firebaseConfig.apiKey.startsWith("YOUR_");

let app;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    console.log("Firebase initialized successfully for Banglabazar Inventory!");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.log("Firebase credentials not configured, working in offline/local storage mode.");
}

export const INITIAL_BOOKS: Book[] = [];

// LocalStorage helpers to simulate Firebase onSnapshot
const LOCAL_STORAGE_KEY = "banglabazar_books_inventory";

function getLocalBooks(): Book[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_BOOKS));
    return INITIAL_BOOKS;
  }
  return JSON.parse(data);
}

function saveLocalBooks(books: Book[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(books));
}

// Trigger functions to simulate real-time listeners locally
const listeners = new Set<(books: Book[]) => void>();

function notifyLocalChange() {
  const books = getLocalBooks();
  listeners.forEach(listener => listener(books));
}

// Handle Firestore Error Utility
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Check connection to Firestore (from standard Firebase skill)
async function testConnection() {
  if (isFirebaseConfigured && db) {
    try {
      // Create a test collection check or ping
      await getDocs(collection(db, 'books'));
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration or network status.");
      }
    }
  }
}
testConnection();

// ==========================================
// REAL-TIME CRUD CORE OPERATIONS API
// ==========================================

/**
 * Real-time listener for current book inventory
 */
export function subscribeToBooks(onUpdate: (books: Book[]) => void): () => void {
  const collectionName = "books";

  if (isFirebaseConfigured && db) {
    try {
      const q = collection(db, collectionName);
      return onSnapshot(q, (snapshot) => {
        const books: Book[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          books.push({
            id: doc.id,
            ...data
          } as Book);
        });
        // Sort books by name or updatedAt
        books.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        onUpdate(books);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, collectionName);
      });
    } catch (error) {
      console.warn("Firestore onSnapshot setup failed, falling back to LocalStorage:", error);
    }
  }

  // Fallback to LocalStorage subscription-like simulation
  const initialData = getLocalBooks();
  onUpdate(initialData);
  
  listeners.add(onUpdate);
  return () => {
    listeners.delete(onUpdate);
  };
}

/**
 * Adds a new book to the database
 */
export async function addBook(bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const collectionName = "books";
  const now = new Date().toISOString();
  
  const newBookPayload = {
    ...bookData,
    createdAt: now,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, collectionName), newBookPayload);
      console.log(`Successfully added book to Firestore: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collectionName);
    }
  }

  // Local Fallback
  const localBooks = getLocalBooks();
  const id = `local-book-${Date.now()}`;
  const newBook: Book = {
    id,
    ...newBookPayload
  };
  localBooks.unshift(newBook); // Prepend to show on top
  saveLocalBooks(localBooks);
  notifyLocalChange();
  return id;
}

/**
 * Update stock, price, promo information, or general details of a book
 */
export async function updateBook(id: string, updates: Partial<Book>): Promise<void> {
  const collectionName = "books";
  const now = new Date().toISOString();
  
  // Exclude immutable IDs, and add updatedAt timestamp
  const { id: _, createdAt: __, ...filteredUpdates } = updates;
  const dbUpdates = {
    ...filteredUpdates,
    updatedAt: now
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, dbUpdates);
      console.log(`Successfully updated book in Firestore: ${id}`);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${id}`);
    }
  }

  // Local Fallback
  const localBooks = getLocalBooks();
  const bookIndex = localBooks.findIndex(b => b.id === id);
  if (bookIndex !== -1) {
    localBooks[bookIndex] = {
      ...localBooks[bookIndex],
      ...dbUpdates
    };
    saveLocalBooks(localBooks);
    notifyLocalChange();
  } else {
    throw new Error(`Book with ID ${id} not found in LocalStorage.`);
  }
}

/**
 * Delete a book from the inventory
 */
export async function deleteBook(id: string): Promise<void> {
  const collectionName = "books";

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      console.log(`Successfully deleted book from Firestore: ${id}`);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
    }
  }

  // Local Fallback
  const localBooks = getLocalBooks();
  const filteredBooks = localBooks.filter(b => b.id !== id);
  saveLocalBooks(filteredBooks);
  notifyLocalChange();
}

/**
 * Utility: Reset state back to initial values (useful for testing & demo)
 */
export function resetToDefaultStock(): void {
  saveLocalBooks(INITIAL_BOOKS);
  notifyLocalChange();
}
