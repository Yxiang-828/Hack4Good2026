/**
 * MASTER DASHBOARD GENERATOR (GRADED STATUS)
 * Features: 
 * - Multi-tier Emoji Status (🏆, ✅, 🆗, ⚠️, ⛔, 📞)
 * - Fixed Grey Backgrounds
 * - Auto-Updates Timestamp
 */
function updateDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName("DASHBOARD");
  const dbSheet = ss.getSheetByName("Database");
  const volListSheet = ss.getSheetByName("Volunteers");
  
  if (!dashSheet || !dbSheet || !volListSheet) return;

  // --- 1. MEMORIZE DATABASE ---
  const dbData = dbSheet.getDataRange().getValues();
  let phonebook = {};
  
  for (let i = 1; i < dbData.length; i++) {
    let name = String(dbData[i][0]).trim().toLowerCase();
    if (name === "") continue;
    phonebook[name] = {
      contact: dbData[i][1],
      medical: dbData[i][2],
      diet:    dbData[i][3],
      relative: dbData[i][4]
    };
  }

  // --- 2. SETUP HEADERS ---
  let dashboardData = [
    ["Name", "Physical HP", "Mental HP", "Contact", "Medical needs", "Diet", "Relative", "Last Updated", "Status"]
  ];
  
  let sectionHeaderRows = []; 
  let emptySeparatorRows = []; 

  // --- 3. HARVEST DATA ---
  const volNames = volListSheet.getDataRange().getValues().flat();
  
  for (let v = 0; v < volNames.length; v++) {
    let volName = String(volNames[v]).trim();
    if (volName === "" || volName.toLowerCase() === "name") continue;
    
    let volSheet = ss.getSheetByName(volName);
    if (!volSheet) continue;

    // A. Section Header
    dashboardData.push([`VOLUNTEER ${volName.toUpperCase()}`, "", "", "", "", "", "", "", ""]);
    sectionHeaderRows.push(dashboardData.length); 

    // B. Get Elderly Data
    let lastRow = volSheet.getLastRow();
    if (lastRow < 2) continue;
    
    let range = volSheet.getRange(2, 1, lastRow - 1, 7).getValues(); 

    for (let r = 0; r < range.length; r++) {
      let eName = String(range[r][0]).trim();
      let physBar = range[r][1]; 
      let physNum = range[r][2]; // Value
      let menBar  = range[r][3]; 
      let menNum  = range[r][4]; // Value
      let rawDate = range[r][6]; 
      
      if (eName === "") continue;

      let details = phonebook[eName.toLowerCase()] || {
        contact: "-", medical: "-", diet: "-", relative: "-"
      };

      // Format Date
      let dateStr = "-";
      if (rawDate instanceof Date) {
        dateStr = Utilities.formatDate(rawDate, "GMT+8", "dd MMM HH:mm");
      }

      // --- ALERT LOGIC (TIERED SYSTEM) ---
      // 1. Get the lowest score (Weakest Link)
      // Ensure numbers are valid, default to 0 if missing
      let p = (typeof physNum === 'number') ? physNum : 0;
      let m = (typeof menNum === 'number') ? menNum : 0;
      let lowestScore = Math.min(p, m);
      
      let statusEmoji = "❓"; 

      if (lowestScore === 100) {
        statusEmoji = "🏆"; // Thriving
      } else if (lowestScore > 80) {
        statusEmoji = "✅"; // Secure
      } else if (lowestScore >= 50) {
        statusEmoji = "🆗"; // Average (Gap coverage)
      } else if (lowestScore >= 20) {
        statusEmoji = "⚠️"; // Drifting (< 50)
      } else if (lowestScore > 0) {
        statusEmoji = "⛔"; // Critical (< 20)
      } else {
        statusEmoji = "📞"; // Failure (0)
      }

      dashboardData.push([
        eName,
        physBar,
        menBar,
        details.contact,
        details.medical,
        details.diet,
        details.relative,
        dateStr,
        statusEmoji // Column I
      ]);
    }
    
    // Add Spacer Row
    dashboardData.push(["", "", "", "", "", "", "", "", ""]);
    emptySeparatorRows.push(dashboardData.length); 
  }

  // --- 4. WRITE & STYLE ---
  dashSheet.clear(); 
  
  if (dashboardData.length > 0) {
    const totalRows = dashboardData.length;
    const totalCols = 9; 
    const range = dashSheet.getRange(1, 1, totalRows, totalCols);
    
    // A. Paste Data
    range.setValues(dashboardData);
    
    // B. Global Font Style
    range.setFontFamily("Google Sans Text");
    range.setFontSize(17);
    range.setVerticalAlignment("middle");
    range.setWrap(true); 

    // C. Column Widths
    dashSheet.setColumnWidth(1, 200); 
    dashSheet.setColumnWidth(2, 250); 
    dashSheet.setColumnWidth(3, 250); 
    dashSheet.setColumnWidth(4, 130); 
    dashSheet.setColumnWidth(5, 200); 
    dashSheet.setColumnWidth(6, 130); 
    dashSheet.setColumnWidth(7, 130); 
    dashSheet.setColumnWidth(8, 150); 
    dashSheet.setColumnWidth(9, 100); 

    // D. Apply Colors
    if (totalRows > 1) {
       // Physical -> Red, Mental -> Blue
       dashSheet.getRange(2, 2, totalRows - 1, 1).setFontColor("#DD7E6B");
       dashSheet.getRange(2, 3, totalRows - 1, 1).setFontColor("#6D9EEB");
       
       // Info Cols -> Grey Background
       dashSheet.getRange(2, 4, totalRows - 1, 5).setBackground("#EFEFEF");
       
       // Logs -> Italic
       dashSheet.getRange(2, 8, totalRows - 1, 1).setFontStyle("italic");
       
       // Status -> Center & Larger
       let statusRange = dashSheet.getRange(2, 9, totalRows - 1, 1);
       statusRange.setHorizontalAlignment("center");
       statusRange.setFontSize(20); // Make emojis pop
    }

    // E. FIX: REMOVE GREY FROM SEPARATOR ROWS
    emptySeparatorRows.forEach(rowIndex => {
      dashSheet.getRange(rowIndex, 1, 1, totalCols).setBackground(null);
    });

    // F. Header Row
    let headerRange = dashSheet.getRange(1, 1, 1, totalCols);
    headerRange.setBackground("#EAD1DC"); 
    headerRange.setFontWeight("bold");
    headerRange.setBorder(true, true, true, true, true, true);

    // G. Section Headers (Black)
    sectionHeaderRows.forEach(rowIdx => {
      let sectionRange = dashSheet.getRange(rowIdx, 1, 1, totalCols);
      sectionRange.setBackground("#000000");
      sectionRange.setFontColor("#FFFFFF");
      sectionRange.setFontWeight("bold");
      sectionRange.setFontStyle("normal");
    });
    
    // --- H. DISCLAIMER (WIDER & UPDATED TEXT) ---
    let nowSGT = Utilities.formatDate(new Date(), "GMT+8", "dd MMM yyyy HH:mm:ss");
    
    // Merge J through M
    let disclaimerRange = dashSheet.getRange("J1:M1"); 
    disclaimerRange.merge();
    
    disclaimerRange.setValue(`Synced: ${nowSGT}\nAuto pulled via Appscript | Updates every minute | Read-only`);
    disclaimerRange.setFontFamily("Google Sans Text");
    disclaimerRange.setFontSize(11);      
    disclaimerRange.setFontStyle("italic");
    disclaimerRange.setFontColor("#808080"); 
    disclaimerRange.setVerticalAlignment("top");
    disclaimerRange.setWrap(false);
  }
}