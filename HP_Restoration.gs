/**
 * THE RESTORATION ENGINE V2.1 (FINAL)
 * Trigger: On Form Submit
 * Source: 'Form responses 2' -> 'CONFIG' -> Individual Volunteer Sheets
 */
function onFormSubmit_Restoration(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // --- 1. CONFIG LOADER (The Rule Book) ---
  // Reads the 'CONFIG' sheet to get base stats dynamically.
  const configSheet = ss.getSheetByName("CONFIG");
  
  // Reading from Row 2, Column 2 (B) to the last row, 4 columns wide (B, C, D, E)
  // Structure: [ID, BasePhys(+), BaseMen(+), FlatCost(-)]
  const configData = configSheet.getRange(2, 2, configSheet.getLastRow() - 1, 4).getValues(); 

  let rules = {};
  configData.forEach(row => {
    let id = row[0]; // The Action ID (e.g., 1, 2, 3...)
    rules[id] = {
      basePhys: Number(row[1]), // Col C: Physical Gain
      baseMen:  Number(row[2]), // Col D: Mental Gain
      flatCost: Number(row[3])  // Col E: Mental Cost (Positive Integer, e.g., 10)
    };
  });

  // --- 2. GET DATA FROM FORM SUBMISSION ---
  let rowValues;
  if (!e) {
    // FALLBACK: For manual testing in the editor
    const formSheet = ss.getSheetByName("Form responses 2"); 
    const lastRow = formSheet.getLastRow();
    // Grabbing Col B(2) to H(8)
    rowValues = formSheet.getRange(lastRow, 2, 1, 7).getValues()[0];
  } else {
    // AUTOMATIC: Runs when form is submitted
    // Mapping e.values based on standard form array
    rowValues = [
      e.values[1], // Vol Name
      e.values[2], // Elder Name
      e.values[3], // Action String
      e.values[4], // Desc (unused)
      e.values[5], // Time
      e.values[6], // Proof (unused)
      e.values[7]  // Rating
    ];
  }

  // --- 3. PARSE VARIABLES ---
  const volName = String(rowValues[0]).trim(); 
  const elderName = String(rowValues[1]).trim();             
  const actionString = String(rowValues[2]);                 
  const rawTime = rowValues[4];                              
  const rating = Number(rowValues[6]);                       

  // Extract ID from string "2. High-Touch" -> returns integer 2
  const actionID = parseInt(actionString.charAt(0)); 

  // --- 4. CALCULATE MULTIPLIER ---
  // Convert Time to Hours
  let timeInHours = 0;
  if (typeof rawTime === 'string' && rawTime.includes(':')) {
    const parts = rawTime.split(':');
    timeInHours = Number(parts[0]) + (Number(parts[1]) / 60);
  } else if (typeof rawTime === 'number') {
    timeInHours = rawTime * 24; 
  }
  
  // Cap time at 6 hours for multiplier calculation
  const cappedTime = Math.min(timeInHours, 6);

  // Formula: (1 + Time/10) * (0.5 + Rating/5)
  const timeMult = 1 + (cappedTime / 10);
  const ratingMult = 0.5 + (rating / 5);
  const totalMultiplier = timeMult * ratingMult;

  console.log(`Processing: ${volName} -> ${elderName} | Action: ${actionID} | Mult: ${totalMultiplier.toFixed(2)}`);

  // --- 5. CALCULATE POINTS (SEGREGATED LOGIC) ---
  const rule = rules[actionID]; 
  
  if (!rule) {
    console.error(`Action ID ${actionID} not found in CONFIG sheet.`);
    return;
  }

  // A. GAINS (Scaled by Multiplier)
  const physGain = rule.basePhys * totalMultiplier;
  const menGain  = rule.baseMen  * totalMultiplier;

  // B. COSTS (Flat Penalty)
  // We take the value directly (e.g., 10)
  const menFlatCost = rule.flatCost; 

  // --- 6. LOCATE TARGET SHEET & ROW ---
  let targetSheet = ss.getSheetByName(volName); 
  
  // Fallback: Case-Insensitive Search
  if (!targetSheet) {
    const sheets = ss.getSheets();
    for (let sheet of sheets) {
      if (sheet.getName().toUpperCase() === volName.toUpperCase()) {
        targetSheet = sheet;
        break;
      }
    }
  }
  
  if (!targetSheet) { console.error(`Sheet '${volName}' not found.`); return; }

  const lastRow = targetSheet.getLastRow();
  const nameList = targetSheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  
  let targetRowIndex = -1;
  for (let i = 0; i < nameList.length; i++) {
    if (nameList[i].toString().toLowerCase() === elderName.toLowerCase()) {
      targetRowIndex = i + 2; // +2 offset for Header
      break;
    }
  }

  if (targetRowIndex === -1) { console.error(`Elder '${elderName}' not found in sheet '${volName}'.`); return; }

  // --- 7. READ & UPDATE STATS ---
  // Read Cols C (Phys Val), D (Visual Men - skip), E (Mental Val)
  const dataRange = targetSheet.getRange(targetRowIndex, 3, 1, 3); 
  const currentData = dataRange.getValues()[0]; 
  
  let curPhys = Number(currentData[0]); // Col C
  let curMen  = Number(currentData[2]); // Col E

  // APPLY MATH
  curPhys = curPhys + physGain;
  
  // SUBTRACTION LOGIC: Gain is added, Cost is subtracted
  curMen  = curMen + menGain - menFlatCost; 

  // CLAMP (Ensure 0-100 Range)
  curPhys = Math.max(0, Math.min(100, Math.round(curPhys)));
  curMen  = Math.max(0, Math.min(100, Math.round(curMen)));

  // UPDATE VISUALS
  const barPhys = drawBar(curPhys);
  const barMen  = drawBar(curMen);

  // WRITE BACK TO SHEET (Cols B, C, D, E)
  targetSheet.getRange(targetRowIndex, 2, 1, 4).setValues([
    [barPhys, curPhys, barMen, curMen]
  ]);

  // OPTIONAL: Reset Text Colors
  targetSheet.getRange(targetRowIndex, 2, 1, 4).setFontColors([
    ["#DD7E6B", "#000000", "#6D9EEB", "#000000"]
  ]);

  console.log(`Success! Updated ${elderName}. New Stats: P=${curPhys}, M=${curMen}`);
}

/**
 * HELPER: Draw Visual Bar
 * Returns a text-based progress bar (e.g. "█████░░░░░")
 */
function drawBar(percentage) {
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;
  const filledCount = Math.round(percentage / 10);
  return "█".repeat(filledCount) + "░".repeat(10 - filledCount);
}