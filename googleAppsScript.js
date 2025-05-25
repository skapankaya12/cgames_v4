// Google Apps Script code for quiz results collection and interaction tracking
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
    
    // Check if interaction data is passed as a URL parameter
    if (e.parameter && e.parameter.interactionData) {
      // Process interaction tracking data
      const interactionData = JSON.parse(e.parameter.interactionData);
      saveInteractionDataToSheet(interactionData);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, type: 'interaction_tracking' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    // Check if regular quiz data is passed as a URL parameter
    else if (e.parameter && e.parameter.data) {
      // Process the quiz results data and save to spreadsheet
      const data = JSON.parse(e.parameter.data);
      saveDataToSheet(data);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, type: 'quiz_results' }))
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
            <h1>Quiz Results & Interaction Tracking API</h1>
            <div class="info">
              <p>This API handles both quiz results and interaction tracking data.</p>
              <p>For quiz results: Send POST with 'data' field or GET with ?data=yourJsonHere</p>
              <p>For interaction tracking: Send GET with ?interactionData=yourJsonHere</p>
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

// Function to save interaction tracking data to a separate sheet
function saveInteractionDataToSheet(interactionData) {
  console.log("Saving interaction data:", JSON.stringify(interactionData));
  
  // Get the spreadsheet
  const ss = SpreadsheetApp.openById("1cGGxaSWHklq7WmYG8jd8p1aPpzcJBFJDUkK-qnxr4Xo");
  const sheet = ss.getSheetByName("InteractionTracking") || ss.insertSheet("InteractionTracking");
  
  // Check if we need to initialize headers
  if (sheet.getLastRow() === 0) {
    const headers = [
      "Timestamp",
      "Session ID", 
      "Event Type",
      "Question ID",
      "Event Timestamp",
      "Previous Value",
      "New Value",
      "Direction",
      "Response Time (ms)",
      "Raw Event Data"
    ];
    sheet.appendRow(headers);
  }
  
  // Process each event in the batch
  if (interactionData.events && Array.isArray(interactionData.events)) {
    for (const event of interactionData.events) {
      const rowData = [
        new Date(),                           // Current timestamp
        interactionData.sessionId,            // Session ID
        event.type,                          // Event type
        event.questionId,                    // Question ID
        new Date(event.timestamp),           // Event timestamp
        event.data.previousValue || "",      // Previous value
        event.data.newValue || "",           // New value
        event.data.direction || "",          // Navigation direction
        event.data.responseTime || "",       // Response time
        JSON.stringify(event)                // Raw event data
      ];
      
      sheet.appendRow(rowData);
    }
  }
  
  console.log(`Added ${interactionData.events ? interactionData.events.length : 0} interaction events`);
}

// Common function to save quiz results data to the spreadsheet
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