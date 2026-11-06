// Reconstruct the imported schema without connecting to or modifying a database.
function createBaselineSchema(schema) {
  return schema.replace(/^model Payment \{[\s\S]*?^\}/gm, "")
    // Project the new bus relation back to the historical, independent tables.
    .replace(/^model trip \{[\s\S]*?^\}/gm, (trip) => trip
      .replace(/^\s*busId\s+.*$/gm, "")
      .replace(/^\s*bus\s+bus\s+@relation.*$/gm, "")
      .replace(/^\s*@@index\(\[busId\].*$/gm, ""))
    .replace(/^model bus \{[\s\S]*?^\}/gm, (bus) => bus
      .replace(/^(\s*)capacity(\s+Int\b)/gm, "$1seats$2")
      .replace(/^\s*trips\s+trip\[\].*$/gm, ""))
    // Booking expiry was added after the baseline. SeatHold expiry already existed.
    .replace(/^model booking \{[\s\S]*?^\}/gm, (booking) => booking
      .replace(/^\s*expiresAt\s+.*$/gm, "")
      .replace(/^\s*@@index\(\[status,\s*expiresAt\]\).*$/gm, ""))
    .replace(/^(\s*(?:price|totalPrice)\s+)Int\b/gm, "$1Float")
    .replace(/^\s*(pnr|passengerName|passengerPhone|activeSeat|capacity|seatHolds|isActive|confirmedAt)\s+.*$/gm, "")
    .replace(/(model trip \{\s+id[^\n]*\n)/, '$1  code           String     @unique(map: "Trip_code_key")\n')
    .replace(/onDelete: Restrict/g, "onDelete: Cascade")
    .replace(/^\s*trip trip @relation.*$/gm, "")
    .replace(/^\s*@@index\(\[(pnr|status, createdAt|status, confirmedAt|time|expiresAt)\]\).*$/gm, "");
}

module.exports = { createBaselineSchema };
