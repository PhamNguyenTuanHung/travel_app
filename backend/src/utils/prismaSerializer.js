function serializePrisma(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(serializePrisma);
  if (typeof obj === 'object') {
    // Check if it's a Decimal object (from Prisma/decimal.js)
    if (obj.constructor && (obj.constructor.name === 'Decimal' || obj.constructor.name === 'd')) {
      return Number(obj.toString());
    }
    // Check if it's a Date object
    if (obj instanceof Date) {
      return obj;
    }
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = serializePrisma(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

module.exports = {
  serializePrisma,
};
