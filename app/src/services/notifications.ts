import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notifications } from './config';

/**
 * Local notifications for Sabiha's Day.
 *
 * Rules:
 *  · every notification is optional and off-able from Settings
 *  · the tone is an invitation, never a reminder of illness
 *  · the treatment reminder ("Tomorrow — Chemotherapy") is only ever
 *    scheduled from an AUTHORISED treatment_events row written by an admin —
 *    the app never invents medical content.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  } as any),
});

export async function ensurePermission() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    return req.status === 'granted';
  }
  return true;
}

/** Cancel everything, then re-schedule from the current preferences. */
export async function syncSchedule(prefs: Record<string, boolean>, nextTreatment?: {
  title: string; date: string;
} | null) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily', {
      name: 'আজকের দিন',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5E8A6D',
    });
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!(await ensurePermission())) return;

  for (const n of notifications) {
    if (prefs[n.key] === false) continue;
    if (!('hour' in n) || n.hour == null) continue;

    await Notifications.scheduleNotificationAsync({
      content: { title: `${n.emoji} ${n.text}`, sound: false },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: n.hour,
        minute: n.minute ?? 0,
        channelId: 'daily',
      } as any,
    });
  }

  // Treatment reminder — only from authorised data.
  if (prefs.treatment !== false && nextTreatment) {
    const when = new Date(`${nextTreatment.date}T19:00:00`);
    if (when.getTime() > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏥 আগামীকাল',
          body: nextTreatment.title,
          sound: false,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: 'daily' } as any,
      });
    }
  }
}

/** Shown the moment a new approved message arrives (via realtime channel). */
export async function notifyNewMessage() {
  await Notifications.scheduleNotificationAsync({
    content: { title: '💌 আপনার জন্য নতুন একটি বার্তা এসেছে।', sound: false },
    trigger: null as any,
  });
}
