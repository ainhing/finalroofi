const { ObjectId } = require('mongodb');

function stripMongoId(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest;
}

function mapUser(doc) {
  if (!doc) return doc;
  const { _id, Password, ...rest } = doc;

  // Normalize ID
  rest.id = rest.UserId || rest.userId || String(_id);

  // Normalize Email
  if (rest.Email !== undefined && rest.email === undefined) {
    rest.email = rest.Email;
  } else if (rest.email) {
    rest.email = String(rest.email).toLowerCase();
  }

  // Normalize Role
  if (rest.Role !== undefined && rest.role === undefined) {
    rest.role = rest.Role;
  }

  // Normalize IsActive -> isActive
  const activeStatus = doc.IsActive !== undefined ? doc.IsActive : (doc.isActive !== undefined ? doc.isActive : true);
  rest.isActive = Boolean(activeStatus);

  return rest;
}

function isValidObjectId(id) {
  return /^[a-f\d]{24}$/i.test(String(id));
}

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

module.exports = {
  stripMongoId,
  mapUser,
  isValidObjectId,
  toSlug
};
