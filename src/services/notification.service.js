const admin = require('firebase-admin');
const config = require('../config/config');
const { User } = require('../models/associations');

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) {
    return;
  }

  try {
    if (config.fcm.serviceAccountKey) {
      // If service account key is provided as JSON string
      const serviceAccount = JSON.parse(config.fcm.serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else if (config.fcm.serviceAccountPath) {
      // If service account key is provided as file path
      admin.initializeApp({
        credential: admin.credential.cert(config.fcm.serviceAccountPath)
      });
    } else {
      console.warn('Firebase Admin SDK not initialized. FCM service account key not provided.');
      return;
    }
    firebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
};

// Initialize Firebase on module load
initializeFirebase();

/**
 * Send push notification to a user by userId
 * @param {number} userId - User ID to send notification to
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload (optional)
 * @returns {Promise<boolean>} - Returns true if notification sent successfully
 */
const sendNotificationToUser = async (userId, title, body, data = {}) => {
  try {
    if (!firebaseInitialized) {
      console.warn('Firebase not initialized. Skipping notification.');
      return false;
    }

    // Get user's FCM token
    const user = await User.findByPk(userId, {
      attributes: ['Id', 'FcmToken', 'Username']
    });

    if (!user || !user.FcmToken) {
      console.log(`User ${userId} does not have an FCM token. Skipping notification.`);
      return false;
    }

    // Convert all data values to strings (required by FCM)
    // React Native apps receive data payload which can be used for navigation
    const dataPayload = {};
    for (const [key, value] of Object.entries(data)) {
      dataPayload[key] = value !== null && value !== undefined ? String(value) : '';
    }

    // Add React Native specific metadata
    const enhancedData = {
      ...dataPayload,
      notificationType: dataPayload.type || 'general',
      timestamp: new Date().toISOString()
    };

    const message = {
      // Notification payload (for apps in foreground/background)
      notification: {
        title: title,
        body: body
      },
      // Data payload (always delivered, used for app logic/navigation)
      data: enhancedData,
      token: user.FcmToken,
      // Android-specific configuration (OPTIONAL but recommended)
      // Without this, FCM uses defaults which may not be optimal
      android: {
        priority: 'high', // Ensures immediate delivery (default is 'normal')
        notification: {
          sound: 'default',
          channelId: 'default', // Required for Android 8.0+ (matches your React Native app's channel)
          tag: 'notification',
          icon: 'ic_notification', // Custom icon (optional)
          color: '#FF5722', // Notification color (optional)
          clickAction: 'OPEN_NOTIFICATION' // For React Native notification handling
        }
      },
      // iOS-specific configuration (OPTIONAL but recommended)
      // Without this, FCM uses defaults which may not handle background notifications properly
      apns: {
        headers: {
          'apns-priority': '10' // High priority for immediate delivery (default is '5')
        },
        payload: {
          aps: {
            // Note: alert is optional here since we have notification.title/body above
            // But including it ensures proper iOS handling
            sound: 'default',
            badge: 1,
            'content-available': 1 // Critical for React Native background notifications
          },
          // Custom data for React Native (must be in payload, not just aps)
          ...enhancedData
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log(`Notification sent successfully to user ${userId}:`, response);
    return true;
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
    
    // If token is invalid, remove it from database
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      try {
        await User.update(
          { FcmToken: null },
          { where: { Id: userId } }
        );
        console.log(`Removed invalid FCM token for user ${userId}`);
      } catch (updateError) {
        console.error(`Error removing invalid FCM token for user ${userId}:`, updateError);
      }
    }
    
    return false;
  }
};

/**
 * Send push notification to multiple users
 * @param {Array<number>} userIds - Array of user IDs
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload (optional)
 * @returns {Promise<number>} - Returns number of successful notifications
 */
const sendNotificationToUsers = async (userIds, title, body, data = {}) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return 0;
  }

  let successCount = 0;
  for (const userId of userIds) {
    const success = await sendNotificationToUser(userId, title, body, data);
    if (success) {
      successCount++;
    }
  }
  return successCount;
};

module.exports = {
  sendNotificationToUser,
  sendNotificationToUsers,
  initializeFirebase
};

