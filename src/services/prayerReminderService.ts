/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrayerReminder, PrayerReminderSettings } from '../types/game';
import { DEFAULT_PRAYER_REMINDERS } from '../data/biblicalContent';
import { soundService } from './soundEffects';

const STORAGE_KEY = 'em_nome_de_jesus_prayer_reminders_v1';

export class PrayerReminderService {
  private static instance: PrayerReminderService;
  private settings: PrayerReminderSettings;

  private constructor() {
    this.settings = this.loadFromStorage();
  }

  public static getInstance(): PrayerReminderService {
    if (!PrayerReminderService.instance) {
      PrayerReminderService.instance = new PrayerReminderService();
    }
    return PrayerReminderService.instance;
  }

  private loadFromStorage(): PrayerReminderSettings {
    if (typeof window === 'undefined') {
      return {
        reminders: DEFAULT_PRAYER_REMINDERS,
        browserNotificationsEnabled: false,
        soundAlertsEnabled: true,
      };
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          reminders: parsed.reminders || DEFAULT_PRAYER_REMINDERS,
          browserNotificationsEnabled: !!parsed.browserNotificationsEnabled,
          soundAlertsEnabled: parsed.soundAlertsEnabled !== false,
          lastTriggeredKey: parsed.lastTriggeredKey,
        };
      }
    } catch {
      // ignore JSON parse error
    }

    return {
      reminders: DEFAULT_PRAYER_REMINDERS,
      browserNotificationsEnabled: false,
      soundAlertsEnabled: true,
    };
  }

  public getSettings(): PrayerReminderSettings {
    return { ...this.settings };
  }

  public saveSettings(newSettings: PrayerReminderSettings): void {
    this.settings = newSettings;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch {
        // storage quota
      }
    }
  }

  public toggleReminder(id: string): PrayerReminderSettings {
    const updatedReminders = this.settings.reminders.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    const updatedSettings = { ...this.settings, reminders: updatedReminders };
    this.saveSettings(updatedSettings);
    return updatedSettings;
  }

  public toggleSound(id: string): PrayerReminderSettings {
    const updatedReminders = this.settings.reminders.map((r) =>
      r.id === id ? { ...r, soundEnabled: !r.soundEnabled } : r
    );
    const updatedSettings = { ...this.settings, reminders: updatedReminders };
    this.saveSettings(updatedSettings);
    return updatedSettings;
  }

  public addReminder(newReminder: Omit<PrayerReminder, 'id' | 'isPreset'>): PrayerReminderSettings {
    const reminder: PrayerReminder = {
      ...newReminder,
      id: `custom-rem-${Date.now()}`,
      isPreset: false,
      createdTimestamp: Date.now(),
    };

    // Keep sorted by time (HH:mm)
    const sorted = [...this.settings.reminders, reminder].sort((a, b) =>
      a.time.localeCompare(b.time)
    );

    const updatedSettings = { ...this.settings, reminders: sorted };
    this.saveSettings(updatedSettings);
    return updatedSettings;
  }

  public deleteReminder(id: string): PrayerReminderSettings {
    const filtered = this.settings.reminders.filter((r) => r.id !== id);
    const updatedSettings = { ...this.settings, reminders: filtered };
    this.saveSettings(updatedSettings);
    return updatedSettings;
  }

  public resetToDefaults(): PrayerReminderSettings {
    const updatedSettings = {
      ...this.settings,
      reminders: DEFAULT_PRAYER_REMINDERS,
    };
    this.saveSettings(updatedSettings);
    return updatedSettings;
  }

  public async requestBrowserNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      const updated = { ...this.settings, browserNotificationsEnabled: granted };
      this.saveSettings(updated);
      return granted;
    } catch {
      return false;
    }
  }

  public setGlobalSoundEnabled(enabled: boolean): PrayerReminderSettings {
    const updated = { ...this.settings, soundAlertsEnabled: enabled };
    this.saveSettings(updated);
    return updated;
  }

  public sendBrowserNotification(reminder: PrayerReminder): void {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      Notification.permission !== 'granted'
    ) {
      return;
    }

    try {
      new Notification(`🕊️ Hora de Orar: ${reminder.title}`, {
        body: `"${reminder.verseText}" — Pratique Colossenses 3:17 em Nome de Jesus!`,
        icon: '/src/assets/images/prayer_altar_1793049533355.jpg',
        badge: '/favicon.ico',
        tag: `prayer-reminder-${reminder.id}`,
      });
    } catch {
      // browser notifications may fail in restricted iframes
    }
  }

  public playChimeIfAllowed(reminder: PrayerReminder): void {
    if (this.settings.soundAlertsEnabled && reminder.soundEnabled) {
      soundService.playPrayerReminderChime();
    }
  }

  /**
   * Checks if any enabled reminder matches the current system time (HH:mm).
   * Prevents repeated triggers within the same minute.
   */
  public checkDueReminder(): PrayerReminder | null {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}-${currentTimeStr}`;

    if (this.settings.lastTriggeredKey === dateKey) {
      return null;
    }

    const due = this.settings.reminders.find(
      (r) => r.enabled && r.time === currentTimeStr
    );

    if (due) {
      this.settings.lastTriggeredKey = dateKey;
      this.saveSettings(this.settings);
      this.playChimeIfAllowed(due);
      this.sendBrowserNotification(due);
      return due;
    }

    return null;
  }

  /**
   * Calculates the next upcoming reminder based on current time
   */
  public getNextUpcomingReminder(): { reminder: PrayerReminder; minutesRemaining: number } | null {
    const enabledReminders = this.settings.reminders.filter((r) => r.enabled);
    if (enabledReminders.length === 0) return null;

    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    let closest: PrayerReminder | null = null;
    let minDiff = Infinity;

    for (const rem of enabledReminders) {
      const [h, m] = rem.time.split(':').map(Number);
      const remTotalMinutes = h * 60 + m;

      let diff = remTotalMinutes - currentTotalMinutes;
      if (diff <= 0) {
        diff += 24 * 60; // Next day
      }

      if (diff < minDiff) {
        minDiff = diff;
        closest = rem;
      }
    }

    if (!closest) return null;

    return {
      reminder: closest,
      minutesRemaining: minDiff,
    };
  }
}

export const prayerReminderService = PrayerReminderService.getInstance();
