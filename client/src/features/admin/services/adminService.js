import { getFirestore, doc, getDoc, deleteDoc, collection, query, where, getDocs, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { app } from '../../../lib/firebase'; // Assuming firebase.js exports 'app'

/**
 * @file adminService.js
 * @description Centralized service for all administrative actions.
 *              Handles interactions with Firestore (deletions, updates, logging)
 *              and Firebase Storage (file deletions).
 *              Ensures all critical actions are logged with admin sign-off.
 */

const db = getFirestore(app);
const storage = getStorage(app);

export const adminService = {
  /**
   * Deletes a file from Firestore and Firebase Storage.
   * Requires admin sign-off.
   * @param {string} fileId - The ID of the file to delete.
   * @param {string} adminName - Name of the admin performing the action.
   * @param {string} adminEmail - Email of the admin performing the action.
   * @param {string} reason - Reason for deletion.
   */
  deleteFile: async (fileId, adminName, adminEmail, reason) => {
    if (!fileId || !adminName || !adminEmail || !reason) {
      throw new Error("Missing required parameters for file deletion.");
    }

    const fileRef = doc(db, 'files', fileId);
    const fileSnap = await getDoc(fileRef);

    if (!fileSnap.exists()) {
      throw new Error("File not found.");
    }

    const fileData = fileSnap.data();

    try {
      // 1. Delete from Firebase Storage
      const storageRef = ref(storage, fileData.storagePath);
      await deleteObject(storageRef);
      if (fileData.thumbnailPath) {
        const thumbnailRef = ref(storage, fileData.thumbnailPath);
        await deleteObject(thumbnailRef);
      }

      // 2. Delete from Firestore 'files' collection
      await deleteDoc(fileRef);

      // 3. Update associated report status to 'resolved' or delete it
      const reportRef = doc(db, 'reports', fileId);
      const reportSnap = await getDoc(reportRef);
      if (reportSnap.exists()) {
        await updateDoc(reportRef, {
          status: 'resolved',
          resolvedBy: { adminName, adminEmail, timestamp: serverTimestamp() },
          reason: reason,
        });
      }

      // 4. Log the action
      await addDoc(collection(db, 'admin_logs'), {
        action: 'DELETE_FILE',
        targetId: fileId,
        targetName: fileData.name,
        performedBy: adminName,
        adminEmail: adminEmail,
        reason: reason,
        timestamp: serverTimestamp(),
      });

      console.log(`File ${fileId} deleted and logged by ${adminName}.`);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  },

  /**
   * Resolves a report without deleting the content.
   * Requires admin sign-off.
   * @param {string} fileId - The ID of the reported file.
   * @param {string} adminName - Name of the admin performing the action.
   * @param {string} adminEmail - Email of the admin performing the action.
   * @param {string} reason - Reason for resolving the report.
   */
  resolveReport: async (fileId, adminName, adminEmail, reason) => {
    if (!fileId || !adminName || !adminEmail || !reason) {
      throw new Error("Missing required parameters for report resolution.");
    }

    const reportRef = doc(db, 'reports', fileId);
    try {
      await updateDoc(reportRef, {
        status: 'resolved',
        resolvedBy: { adminName, adminEmail, timestamp: serverTimestamp() },
        reason: reason,
      });

      await addDoc(collection(db, 'admin_logs'), {
        action: 'RESOLVE_REPORT',
        targetId: fileId,
        targetName: `Report for file ${fileId}`, // Consider fetching file name for better log
        performedBy: adminName,
        adminEmail: adminEmail,
        reason: reason,
        timestamp: serverTimestamp(),
      });
      console.log(`Report for file ${fileId} resolved and logged by ${adminName}.`);
    } catch (error) {
      console.error("Error resolving report:", error);
      throw new Error(`Failed to resolve report: ${error.message}`);
    }
  },

  /**
   * Helper function to create a Firestore query for reports with a specific status.
   * @param {string} status - The status to filter by ('pending', 'resolved').
   * @returns {QueryConstraint} - A Firestore query constraint.
   */
  whereReportStatus: (status) => where('status', '==', status),

  // TODO: Add deleteClass, suspendUser, etc. methods here
};
