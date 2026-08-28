export type DetectionMethod = "gps_confirmed" | "manual_selection";
export type AmarPujaVisit = { id: string; pandalId: string; pandalName: string; subArea: string; createdAt: string; detectionMethod: DetectionMethod; note?: string };
export type AmarPujaPhoto = { id: string; visitId: string; createdAt: string; blob: Blob; mimeType: string; caption?: string };
export type AmarPujaVisitWithPhotos = AmarPujaVisit & { photos: AmarPujaPhoto[] };

const DB_NAME = "pujoparikroma-amar-pujo"; const DB_VERSION = 1; const VISITS = "visits"; const PHOTOS = "photos";
const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const requestValue = <T>(request: IDBRequest<T>) => new Promise<T>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error ?? new Error("Local memory storage failed")); });

function database(): Promise<IDBDatabase> {
  if (!globalThis.indexedDB) return Promise.reject(new Error("PRIVATE_STORAGE_UNSUPPORTED"));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("PRIVATE_STORAGE_UNSUPPORTED"));
    request.onupgradeneeded = () => { const db = request.result; if (!db.objectStoreNames.contains(VISITS)) db.createObjectStore(VISITS, { keyPath: "id" }); if (!db.objectStoreNames.contains(PHOTOS)) { const store = db.createObjectStore(PHOTOS, { keyPath: "id" }); store.createIndex("visitId", "visitId", { unique: false }); } };
    request.onsuccess = () => resolve(request.result);
  });
}

export const hasPrivateMemoryStorage = () => typeof window !== "undefined" && Boolean(window.indexedDB);
export async function createAmarPujaVisit(input: Omit<AmarPujaVisit, "id" | "createdAt">) { const visit: AmarPujaVisit = { ...input, id: newId(), createdAt: new Date().toISOString() }; const db = await database(); await requestValue(db.transaction(VISITS, "readwrite").objectStore(VISITS).put(visit)); db.close(); return visit; }
export async function addAmarPujaPhoto(input: { visitId: string; blob: Blob; caption?: string }) { const photo: AmarPujaPhoto = { id: newId(), visitId: input.visitId, blob: input.blob, mimeType: input.blob.type || "image/jpeg", caption: input.caption, createdAt: new Date().toISOString() }; const db = await database(); await requestValue(db.transaction(PHOTOS, "readwrite").objectStore(PHOTOS).put(photo)); db.close(); return photo; }
export async function getAmarPujaVisits() { const db = await database(); const transaction = db.transaction([VISITS, PHOTOS], "readonly"); const visits = await requestValue(transaction.objectStore(VISITS).getAll()) as AmarPujaVisit[]; const photos = await requestValue(transaction.objectStore(PHOTOS).getAll()) as AmarPujaPhoto[]; db.close(); return visits.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(visit => ({ ...visit, photos: photos.filter(photo => photo.visitId === visit.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) })); }
export async function deleteAmarPujaPhoto(photoId: string) { const db = await database(); await requestValue(db.transaction(PHOTOS, "readwrite").objectStore(PHOTOS).delete(photoId)); db.close(); }
export async function deleteAmarPujaVisit(visitId: string) { const db = await database(); const transaction = db.transaction([VISITS, PHOTOS], "readwrite"); const photos = await requestValue(transaction.objectStore(PHOTOS).index("visitId").getAll(visitId)) as AmarPujaPhoto[]; transaction.objectStore(VISITS).delete(visitId); photos.forEach(photo => transaction.objectStore(PHOTOS).delete(photo.id)); await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error ?? new Error("Could not delete local visit")); }); db.close(); }
