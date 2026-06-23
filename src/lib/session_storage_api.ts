import type { EntryDTO } from "./models/entry_dto";
import type { FolderDTO } from "./models/folder_dto";

const STORAGE_KEY = 'folders';

export function foldersExist(): boolean {
  return sessionStorage.getItem(STORAGE_KEY) != null;
}

export function getFolders(): FolderDTO[] {
  const data = sessionStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function storeFolder(folder: FolderDTO): void {
  const folders = getFolders();
  const existingIndex = folders.findIndex(f => f.id === folder.id);
  
  if (existingIndex > -1) {
    folders[existingIndex] = folder;
  } else {
    folders.push(folder);
  }
  
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
}

export function getFolderById(folderId: string): FolderDTO | undefined {
  const folders = getFolders();
  return folders.find(f => f.id === folderId);
}

export function addEntryToFolder(folderId: string, entry: EntryDTO): void {
  const folder = getFolderById(folderId);
  
  if (folder) {
    const existingIndex = folder.entries.findIndex(e => e.id === entry.id);
    
    if (existingIndex > -1) {
      folder.entries[existingIndex] = entry;
    } else {
      folder.entries.push(entry);
    }
    
    storeFolder(folder);
  }
}

export function removeEntryFromFolder(folderId: string, entryId: string): void {
  const folder = getFolderById(folderId);
  
  if (folder) {
    folder.entries = folder.entries.filter(e => e.id !== entryId);
    storeFolder(folder);
  }
}

export function removeFolder(folderId: string): void {
  const folders = getFolders();
  const filteredFolders = folders.filter(f => f.id !== folderId);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filteredFolders));
}

export function clearAllFolders(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
