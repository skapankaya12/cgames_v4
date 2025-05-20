// Google Apps Script code for quiz results collection
function doGet(e) {
  try {
    // Log incoming request to debug
    console.log("Received GET request");
    
    // Check if e is defined and has parameters
    if (!e) {
      console.log("Event object is undefined");
      e = {};
    }
    
    if (!e.parameter) {
      console.log("No parameters in request");
      e.parameter = {};
    }
    
    console.log("Parameters:", JSON.stringify(e.parameter || {}));
    
    // Check if data is passed as a URL parameter
    if (e.parameter && e.parameter.data) {
      // Process the data and save to spreadsheet
      const data = JSON.parse(e.parameter.data);
      saveDataToSheet(data);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      // No data, return info page
      return HtmlService.createHtmlOutput(`
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
              h1 { color: #4285f4; }
              .info { background: #f8f9fa; padding: 15px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
            </style>
          </head>
          <body>
            <h1>Quiz Results API</h1>
            <div class="info">
              <p>This is a POST/GET API for collecting quiz results.</p>
              <p>To submit data, send a POST request with a 'data' field containing your JSON data.</p>
              <p>You can also use GET with ?data=yourJsonHere</p>
              <p>Current time: ${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `);
    }
  } catch (error) {
    console.error("Error in doGet:", error);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    // Log incoming request to debug
    console.log("Received POST request");
    
    // Ensure e is defined
    if (!e) {
      console.log("Event object is undefined");
      e = {};
    }
    
    // Ensure e.parameter is defined
    if (!e.parameter) {
      console.log("No parameters in request");
      e.parameter = {};
    }
    
    // Ensure e.postData is defined
    if (!e.postData) {
      console.log("No postData in request");
      e.postData = {};
    }
    
    if (e.postData) {
      console.log("Post data content type:", e.postData.type || "none");
      console.log("Post data length:", e.postData.contents ? e.postData.contents.length : 0);
    }
    
    // Parse the incoming data
    let data;
    
    // Handle data from form submission
    if (e.parameter && e.parameter.data) {
      console.log("Found data in parameter");
      data = JSON.parse(e.parameter.data);
    } 
    // Handle direct JSON POST
    else if (e.postData && e.postData.contents) {
      console.log("Found data in postData.contents");
      data = JSON.parse(e.postData.contents);
    } 
    // Handle form-encoded post
    else if (e.parameter) {
      console.log("Trying to extract data from general parameters");
      // Try to find data in any parameter
      const keys = Object.keys(e.parameter);
      for (const key of keys) {
        try {
          const parsed = JSON.parse(e.parameter[key]);
          if (parsed && parsed.user && parsed.answers) {
            data = parsed;
            console.log("Found valid data in parameter:", key);
            break;
          }
        } catch (parseError) {
          // Not valid JSON, continue to next parameter
        }
      }
    }
    
    if (!data) {
      console.log("No valid data found in the request");
      throw new Error("No data received or could not parse data");
    }
    
    // Validate the data has required fields
    if (!data.user || !data.answers) {
      console.log("Data missing required fields:", JSON.stringify(data));
      throw new Error("Data is missing required fields (user, answers)");
    }
    
    // Save the data to the spreadsheet
    console.log("Saving data to sheet");
    saveDataToSheet(data);
    console.log("Data saved successfully");
    
    // Return HTML response for form submissions
    return HtmlService.createHtmlOutput(
      `<html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: green; font-size: 24px; margin-bottom: 20px; }
            button { padding: 10px 20px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="success">✅ Quiz results submitted successfully!</div>
          <p>Your results have been recorded in the spreadsheet.</p>
          <p>First Name: ${data.user.firstName || "Unknown"}</p>
          <p>Last Name: ${data.user.lastName || "Unknown"}</p>
          <p>Timestamp: ${new Date().toLocaleString()}</p>
          <button onclick="window.close()">Close Window</button>
        </body>
      </html>`
    );
      
  } catch (error) {
    console.error("Error in doPost:", error);
    return HtmlService.createHtmlOutput(
      `<html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: red; font-size: 24px; margin-bottom: 20px; }
            pre { background: #f5f5f5; padding: 10px; text-align: left; overflow: auto; }
            button { padding: 10px 20px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="error">❌ Error submitting quiz results</div>
          <pre>${error.toString()}</pre>
          <button onclick="window.close()">Close Window</button>
        </body>
      </html>`
    );
  }
}

// Common function to save data to the spreadsheet
function saveDataToSheet(data) {
  // Get the spreadsheet
  const ss = SpreadsheetApp.openById("1cGGxaSWHklq7WmYG8jd8p1aPpzcJBFJDUkK-qnxr4Xo");
  const sheet = ss.getSheetByName("Results") || ss.insertSheet("Results");
  
  // Check if we need to initialize headers
  if (sheet.getLastRow() === 0) {
    // Create headers based on the structure of your data
    const headers = [
      "Timestamp", 
      "First Name", 
      "Last Name"
    ];
    
    // Add question IDs to headers
    const questionIds = Object.keys(data.answers).sort((a, b) => parseInt(a) - parseInt(b));
    for (const qId of questionIds) {
      headers.push(`Question ${qId}`);
    }
    
    // Add competency scores to headers
    if (data.competencyScores) {
      for (const comp of data.competencyScores) {
        headers.push(`${comp.name} Score`);
      }
    }
    
    sheet.appendRow(headers);
  }
  
  // Prepare the row data
  const rowData = [
    new Date(),            // Timestamp
    data.user.firstName,   // First name
    data.user.lastName     // Last name
  ];
  
  // Add answers in order
  const questionIds = Object.keys(data.answers).sort((a, b) => parseInt(a) - parseInt(b));
  for (const qId of questionIds) {
    rowData.push(data.answers[qId]);
  }
  
  // Add competency scores
  if (data.competencyScores) {
    for (const comp of data.competencyScores) {
      rowData.push(comp.score);
    }
  }
  
  // Append the data to the sheet
  sheet.appendRow(rowData);
  
  // Log to help debugging
  console.log(`Row appended: ${rowData.join(", ")}`);
} 