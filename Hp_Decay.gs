/**
 * THE DECAY ENGINE (HOURLY FIXED DROP)
 * 1. Reads names from 'Volunteers' sheet.
 * 2. Subtracts 10 HP from Cols C & E (Numbers).
 * 3. Updates Cols B & D (Visual Bars) based on new numbers.
 */
function runHPDecay() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // CONFIGURATION
  const DECAY_AMOUNT = 10; // Fixed -10 HP drop per run
  const COLOR_PHYSICAL = "#DD7E6B"; // Light Red Berry 2
  const COLOR_MENTAL = "#6D9EEB";   // Light Cornflower Blue 2
  const COLOR_TEXT = "#000000";     // Black for numbers

  // 1. GET VOLUNTEER LIST
  const volSheet = ss.getSheetByName("Volunteers");
  if (!volSheet) {
    console.error("CRITICAL: 'Volunteers' sheet not found.");
    return;
  }

  // Read Column A from row 2 down
  const lastVolRow = volSheet.getLastRow();
  if (lastVolRow < 2) return; 
  
  const volunteerNames = volSheet.getRange(2, 1, lastVolRow - 1, 1)
                                 .getValues()
                                 .flat()
                                 .filter(String); // Remove empty rows

  // 2. PROCESS EACH VOLUNTEER SHEET
  volunteerNames.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      console.warn(`Skipping: Sheet '${sheetName}' not found.`);
      return;
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return; // Empty sheet

    // We need Columns B, C, D, E
    // Start Row 2, Start Col 2 (B), process all rows, 4 columns wide
    const numRows = lastRow - 1;
    const range = sheet.getRange(2, 2, numRows, 4);
    
    // Get current values
    let values = range.getValues();
    // Create array to store colors (same size as values)
    let fontColors = [];

    let hasChanges = false;

    // Loop through every elderly person in this sheet
    for (let i = 0; i < values.length; i++) {
      // Data Mapping relative to range (B, C, D, E):
      // [0] = Col B (Phys Bar)
      // [1] = Col C (Phys %)
      // [2] = Col D (Men Bar)
      // [3] = Col E (Men %)

      let physPct = values[i][1];
      let menPct = values[i][3];

      // --- PHYSICAL DECAY (-10) ---
      if (typeof physPct === 'number') {
        // Math: Subtract 10 and clamp at 0 (cannot go negative)
        let newPhys = Math.max(0, physPct - DECAY_AMOUNT);
        
        // Update Array
        values[i][1] = newPhys;             // New Number
        values[i][0] = drawBar(newPhys);    // New Bar Visual
        hasChanges = true;
      }

      // --- MENTAL DECAY (-10) ---
      if (typeof menPct === 'number') {
        // Math: Subtract 10 and clamp at 0
        let newMen = Math.max(0, menPct - DECAY_AMOUNT);

        // Update Array
        values[i][3] = newMen;              // New Number
        values[i][2] = drawBar(newMen);     // New Bar Visual
        hasChanges = true;
      }

      // Define Colors for this row: [PhysBar, PhysNum, MenBar, MenNum]
      fontColors.push([COLOR_PHYSICAL, COLOR_TEXT, COLOR_MENTAL, COLOR_TEXT]);
    }

    // 3. WRITE BACK TO SHEET
    if (hasChanges) {
      range.setValues(values);       // Update Data
      range.setFontColors(fontColors); // Update Colors
      console.log(`Success: Dropped -${DECAY_AMOUNT} HP for ${sheetName}`);
    }
  });
}

/**
 * HELPER: Draws the 10-block bar
 * Input: 60 -> Output: "██████░░░░"
 */
function drawBar(percentage) {
  // Normalize just in case inputs are weird
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;

  // Calculate blocks (10 blocks total)
  // 60% / 10 = 6 blocks
  const filledCount = Math.round(percentage / 10);
  const emptyCount = 10 - filledCount;

  return "█".repeat(filledCount) + "░".repeat(emptyCount);
}