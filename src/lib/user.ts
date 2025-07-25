import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'wireloop_deviceId';
const PLAYER_NAME_KEY = 'wireloop_playerName';

/**
 * Gets a persistent, unique device ID from localStorage.
 * If one doesn't exist, it creates and stores a new one.
 * @returns {string} The device ID.
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Gets the stored player name from localStorage.
 * @returns {string | null} The player name or null if not set.
 */
export function getPlayerName(): string | null {
  return localStorage.getItem(PLAYER_NAME_KEY);
}

/**
 * Stores the player name in localStorage.
 * @param {string} name The player name to store.
 */
export function setPlayerName(name: string): void {
  localStorage.setItem(PLAYER_NAME_KEY, name);
} 