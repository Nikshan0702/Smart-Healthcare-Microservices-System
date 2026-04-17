export const normalizeString = (value = "") => value.toString().trim();

export const normalizeName = (value = "") => normalizeString(value).replace(/\s+/g, " ");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value = "") => EMAIL_REGEX.test(normalizeString(value));

export const isValidPassword = (value = "") => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length >= 6 && trimmed.length <= 72;
};

export const isValidPhone = (value = "") => {
  const phone = normalizeString(value);
  if (!phone) return true;
  if (phone.length < 7 || phone.length > 20) return false;
  return /^[+\d][\d\s()-]*$/.test(phone);
};

export const isValidDateKey = (value = "") => {
  const dateKey = normalizeString(value);
  if (!dateKey) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  const parsed = new Date(`${dateKey}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime());
};

export const isMongoObjectId = (value = "") => /^[a-f\d]{24}$/i.test(normalizeString(value));

