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
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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
  console.log("Using High-Fidelity LocalStorage Fallback. (Configure your Firebase keys to connect to cloud Firestore).");
}

// ==========================================
// initial mock data with Professional Bangla Promoted Description and Tags
// ==========================================
const INITIAL_BOOKS: Book[] = [
  {
    id: "sample-book-1",
    name: "হিমু সমগ্র",
    author: "হুমায়ূন আহমেদ",
    publisher: "অনন্যা প্রকাশনী",
    costPrice: 280,
    wholesalePrice: 320,
    retailPrice: 450,
    stock: 120,
    supplierInfo: "আলী বুক সাপ্লাই, বাংলাবাজার",
    promotionalTag: "সর্বকালের বেস্টসেলার",
    promoDescription: "হুমায়ূন আহমেদের অমর সৃষ্টি হিমুর সব রোমাঞ্চকর অভিযানের এক জমকালো সংকলন! পাঠকনন্দিত পীত বসনধারী যুবকের মায়াবী জগতে ডুব দিতে এবং আপনার লাইব্রেরির মর্যাদা বাড়াতে আর অপেক্ষা না করে আজই সংগ্রহ করুন আপনার পরম কাঙ্খিত কপিটি!",
    createdAt: new Date("2026-01-10").toISOString(),
    updatedAt: new Date("2026-05-25").toISOString()
  },
  {
    id: "sample-book-2",
    name: "লাল নীল தீপাবলী",
    author: "হুমায়ুন আজাদ",
    publisher: "আগামী প্রকাশনী",
    costPrice: 130,
    wholesalePrice: 160,
    retailPrice: 220,
    stock: 45,
    supplierInfo: "আগামী ডিপো, ঢাকা",
    promotionalTag: "অনন্য প্রকাশনা",
    promoDescription: "বাঙলা সাহিত্যের বিস্ময়কর ইতিহাস ও নান্দনিক বিশ্লেষণ। কিশোর ও তরুণ সাহিত্যপ্রেমীদের মুক্তচিন্তার ধারক এই অসামান্য মাস্টারপিসটি বাঙালির মনন গঠনের এক অপরিহার্য চাবিকাঠি!",
    createdAt: new Date("2026-02-15").toISOString(),
    updatedAt: new Date("2026-05-25").toISOString()
  },
  {
    id: "sample-book-3",
    name: "চিলেকোঠার সেপাই",
    author: "আখতারুজ্জামান ইলিয়াস",
    publisher: "মাওলা ব্রাদার্স",
    costPrice: 210,
    wholesalePrice: 260,
    retailPrice: 350,
    stock: 8,
    supplierInfo: "মাওলা স্টক ডিস্ট্রিবিউটরস",
    promotionalTag: "স্টক সীমিত",
    promoDescription: "ঊনসত্তরের গণঅভ্যুত্থানের প্রেক্ষাপটে রচিত বাঙলা কথাসাহিত্যের এক অবিসংবাদিত কালজয়ী ক্ল্যাসিক। অবহেলিত ও শোষিত মানুষের জীবনযাত্রার মহাকাব্যিক রূপায়ণ—চিন্তাশীল গম্ভীর পাঠকের অন্যতম পছন্দের শ্রেষ্ঠ বই!",
    createdAt: new Date("2026-03-05").toISOString(),
    updatedAt: new Date("2026-05-25").toISOString()
  },
  {
    id: "sample-book-4",
    name: "কাব্য ও জীবনের জলছবি",
    author: "শামসুর রাহমান",
    publisher: "প্রথমা প্রকাশন",
    costPrice: 190,
    wholesalePrice: 230,
    retailPrice: 300,
    stock: 65,
    supplierInfo: "প্রথমা ডিস্ট্রিবিউশন হাউজ",
    promotionalTag: "বিশেষ ছাড় (১৫%)",
    promoDescription: "আধুনিক বাঙালি জীবনের সুখ-দুঃখ ও আশা-আকাঙ্ক্ষার কাব্যময় প্রতিচ্ছবি। প্রিয় কবি শামসুর রাহমানের সমৃদ্ধ কবিতাগুচ্ছের এই বিশেষ সংকলনটি আপনার হৃদয়কে ছুঁয়ে যাবেই। আজই হ্রাসকৃত পাইকারি মূল্যে বুক করুন!",
    createdAt: new Date("2026-03-20").toISOString(),
    updatedAt: new Date("2026-05-25").toISOString()
  },
  {
    id: "sample-book-5",
    name: "কাকাবাবু সমগ্র",
    author: "সুনীল গঙ্গোপাধ্যায়",
    publisher: "কাকলী প্রকাশনী",
    costPrice: 310,
    wholesalePrice: 370,
    retailPrice: 500,
    stock: 35,
    supplierInfo: "কাকলী ডিস্ট্রিবিউশন",
    promotionalTag: "জনপ্রিয় সংস্করণ",
    promoDescription: "কাকাবাবু আর সন্তুর শ্বাসরুদ্ধকর এডভেঞ্চার ও রহস্যের এক শিহরণ জাগানো ভুবন! ছোট-বড় সবার রোমাঞ্চপ্রিয় মন জয় করার অনন্য ক্ষমতা রাখে এই প্রফেশনাল রাজকীয় কালেকশনটি। এখনই পাইকারি রেটে স্টক করুন!",
    createdAt: new Date("2026-04-01").toISOString(),
    updatedAt: new Date("2026-05-25").toISOString()
  }
];

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
