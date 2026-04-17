const Doctor = require("../models/Doctor");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalizeString = (value = "") => value.toString().trim();
const normalizeSlotValue = (value = "") => normalizeString(value).replace(/\s+/g, " ");
const normalizeEmail = (value = "") => normalizeString(value).toLowerCase();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (value = "") => EMAIL_REGEX.test(normalizeString(value));
const isMongoObjectId = (value = "") => /^[a-f\d]{24}$/i.test(normalizeString(value));

const toFiniteNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return Number.NaN;
  }
  return Number(value);
};

const isValidNonNegativeNumber = (value) => Number.isFinite(value) && value >= 0;
const isValidName = (value = "") => {
  const name = normalizeString(value).replace(/\s+/g, " ");
  return name.length >= 2 && name.length <= 80;
};

const normalizeDateKey = (value) => {
  if (!value) return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const rawValue = normalizeString(value);
  if (!rawValue) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    return rawValue;
  }

  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
};

const getDayFromDateKey = (dateKey) => {
  if (!dateKey) return "";
  const parsed = new Date(`${dateKey}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
};

const validateAvailabilityPayload = (availability = []) => {
  if (!Array.isArray(availability)) {
    return { valid: false, message: "availability must be an array" };
  }

  for (const entry of availability) {
    if (!entry || typeof entry !== "object") {
      return { valid: false, message: "Each availability entry must be an object" };
    }

    const dateKey = normalizeDateKey(entry.date);
    const day = normalizeString(entry.day);
    const slots = Array.isArray(entry.slots)
      ? entry.slots.map((slot) => normalizeSlotValue(slot)).filter(Boolean)
      : [];

    if (!dateKey && !day) {
      return { valid: false, message: "Each availability entry must include a date or day" };
    }

    if (slots.length === 0) {
      return { valid: false, message: "Each availability entry must include at least one slot" };
    }
  }

  return { valid: true };
};

const normalizeAvailabilityEntries = (availability = []) => {
  const map = new Map();

  availability.forEach((entry) => {
    const date = normalizeDateKey(entry?.date);
    const day = normalizeString(entry?.day) || getDayFromDateKey(date);
    const slots = Array.isArray(entry?.slots)
      ? entry.slots.map((slot) => normalizeSlotValue(slot)).filter(Boolean)
      : [];

    if ((!date && !day) || slots.length === 0) {
      return;
    }

    const key = date ? `date:${date}` : `day:${day.toLowerCase()}`;
    const existing = map.get(key) || { date: "", day, slots: [] };
    const existingKeys = new Set(existing.slots.map((slot) => slot.toUpperCase()));

    slots.forEach((slot) => {
      const slotKey = slot.toUpperCase();
      if (!existingKeys.has(slotKey)) {
        existingKeys.add(slotKey);
        existing.slots.push(slot);
      }
    });

    existing.date = date || existing.date;
    existing.day = day || existing.day;
    map.set(key, existing);
  });

  return Array.from(map.values()).sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.day.localeCompare(b.day);
  });
};

const buildDoctorIdentityFilter = (user) => {
  const or = [{ userId: user.id }];

  if (user.email) {
    or.push({ email: user.email });
    or.push({ email: { $regex: `^${escapeRegex(user.email)}$`, $options: "i" } });
  }

  return or.length === 1 ? or[0] : { $or: or };
};

const getDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    const filter = {};

    if (specialization) {
      const normalizedSpecialization = normalizeString(specialization);
      if (normalizedSpecialization.length > 60) {
        return res.status(400).json({ message: "specialization must be 60 characters or less" });
      }
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });

    return res.status(200).json(doctors);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching doctors" });
  }
};

const getDoctorById = async (req, res) => {
  try {
    if (!isMongoObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid doctor profile id" });
    }

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    return res.status(200).json(doctor);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching doctor profile" });
  }
};

const createDoctorProfile = async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      specialization,
      experience,
      hospital,
      consultationFee,
      availability
    } = req.body;

    const normalizedUserId = normalizeString(userId);
    const normalizedName = normalizeString(name).replace(/\s+/g, " ");
    const normalizedEmail = normalizeEmail(email);
    const normalizedSpecialization = normalizeString(specialization);

    if (!normalizedUserId || !normalizedName || !normalizedEmail || !normalizedSpecialization) {
      return res
        .status(400)
        .json({ message: "userId, name, email and specialization are required" });
    }

    if (!isMongoObjectId(normalizedUserId)) {
      return res.status(400).json({ message: "userId must be a valid id" });
    }

    if (!isValidName(normalizedName)) {
      return res.status(400).json({ message: "name must be between 2 and 80 characters" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "email must be a valid email address" });
    }

    if (normalizedSpecialization.length < 2 || normalizedSpecialization.length > 60) {
      return res.status(400).json({ message: "specialization must be between 2 and 60 characters" });
    }

    const existingDoctor = await Doctor.findOne({ userId: normalizedUserId });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor profile already exists for this userId" });
    }

    const availabilityValidation = validateAvailabilityPayload(availability || []);
    if (!availabilityValidation.valid) {
      return res.status(400).json({ message: availabilityValidation.message });
    }

    const normalizedAvailability = normalizeAvailabilityEntries(availability || []);

    const normalizedExperience = experience === undefined ? undefined : toFiniteNumber(experience);
    if (experience !== undefined && !isValidNonNegativeNumber(normalizedExperience)) {
      return res.status(400).json({ message: "experience must be a non-negative number" });
    }

    const normalizedConsultationFee = consultationFee === undefined ? undefined : toFiniteNumber(consultationFee);
    if (consultationFee !== undefined && !isValidNonNegativeNumber(normalizedConsultationFee)) {
      return res.status(400).json({ message: "consultationFee must be a non-negative number" });
    }

    const normalizedHospital = hospital === undefined ? undefined : normalizeString(hospital);
    if (normalizedHospital !== undefined && normalizedHospital.length > 120) {
      return res.status(400).json({ message: "hospital must be 120 characters or less" });
    }

    const doctor = await Doctor.create({
      userId: normalizedUserId,
      name: normalizedName,
      email: normalizedEmail,
      specialization: normalizedSpecialization,
      experience: normalizedExperience ?? 0,
      hospital: normalizedHospital ?? "",
      consultationFee: normalizedConsultationFee ?? 0,
      availability: normalizedAvailability
    });

    return res.status(201).json({
      message: "Doctor profile created successfully",
      doctor
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error while creating doctor profile" });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne(buildDoctorIdentityFilter(req.user));

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found for this account" });
    }

    return res.status(200).json(doctor);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching your profile" });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    // Doctor can update only these fields.
    const allowedFields = ["specialization", "experience", "hospital", "consultationFee"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided. Allowed: specialization, experience, hospital, consultationFee"
      });
    }

    if (updates.specialization !== undefined) {
      const normalizedSpecialization = normalizeString(updates.specialization);
      if (normalizedSpecialization.length < 2 || normalizedSpecialization.length > 60) {
        return res.status(400).json({ message: "specialization must be between 2 and 60 characters" });
      }
      updates.specialization = normalizedSpecialization;
    }

    if (updates.experience !== undefined) {
      const normalizedExperience = toFiniteNumber(updates.experience);
      if (!isValidNonNegativeNumber(normalizedExperience)) {
        return res.status(400).json({ message: "experience must be a non-negative number" });
      }
      updates.experience = normalizedExperience;
    }

    if (updates.consultationFee !== undefined) {
      const normalizedFee = toFiniteNumber(updates.consultationFee);
      if (!isValidNonNegativeNumber(normalizedFee)) {
        return res.status(400).json({ message: "consultationFee must be a non-negative number" });
      }
      updates.consultationFee = normalizedFee;
    }

    if (updates.hospital !== undefined) {
      const normalizedHospital = normalizeString(updates.hospital);
      if (normalizedHospital.length > 120) {
        return res.status(400).json({ message: "hospital must be 120 characters or less" });
      }
      updates.hospital = normalizedHospital;
    }

    const doctor = await Doctor.findOneAndUpdate(buildDoctorIdentityFilter(req.user), { $set: updates }, {
      new: true,
      runValidators: true
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found for this account" });
    }

    return res.status(200).json({
      message: "Doctor profile updated successfully",
      doctor
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error while updating your profile" });
  }
};

const updateMyAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({ message: "availability must be an array" });
    }

    const availabilityValidation = validateAvailabilityPayload(availability);
    if (!availabilityValidation.valid) {
      return res.status(400).json({ message: availabilityValidation.message });
    }

    const normalizedAvailability = normalizeAvailabilityEntries(availability);

    const doctor = await Doctor.findOneAndUpdate(buildDoctorIdentityFilter(req.user), { $set: { availability: normalizedAvailability } }, {
      new: true,
      runValidators: true
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found for this account" });
    }

    return res.status(200).json({
      message: "Availability updated successfully",
      doctor
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error while updating availability" });
  }
};

const verifyDoctor = async (req, res) => {
  try {
    const { verified } = req.body;

    if (!isMongoObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid doctor profile id" });
    }

    if (typeof verified !== "boolean") {
      return res.status(400).json({ message: "verified must be true or false" });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: { verified } },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    return res.status(200).json({
      message: "Doctor verification updated successfully",
      doctor
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error while verifying doctor" });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctorProfile,
  getMyProfile,
  updateMyProfile,
  updateMyAvailability,
  verifyDoctor
};
