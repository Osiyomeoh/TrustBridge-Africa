// WalletConnect time module shim
export const fromMiliseconds = (ms) => ms;
export const toMiliseconds = (value) => value;
export const fromSeconds = (seconds) => seconds * 1000;
export const toSeconds = (ms) => Math.floor(ms / 1000);
export const fromMinutes = (minutes) => minutes * 60 * 1000;
export const toMinutes = (ms) => Math.floor(ms / (60 * 1000));
export const fromHours = (hours) => hours * 60 * 60 * 1000;
export const toHours = (ms) => Math.floor(ms / (60 * 60 * 1000));
export const fromDays = (days) => days * 24 * 60 * 60 * 1000;
export const toDays = (ms) => Math.floor(ms / (24 * 60 * 60 * 1000));

export default {
  fromMiliseconds,
  toMiliseconds,
  fromSeconds,
  toSeconds,
  fromMinutes,
  toMinutes,
  fromHours,
  toHours,
  fromDays,
  toDays
};
