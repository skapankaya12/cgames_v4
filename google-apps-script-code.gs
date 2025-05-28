// Google Apps Script code for quiz results collection and feedback tracking
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
    
    // Check if action parameter exists to determine the type of request
    const action = e.parameter.action;
    
    if (action === 'feedback') {
      // Handle feedback submission
      return handleFeedbackSubmission(e);
    } else if (action === 'uploadPDF') {
      // Handle PDF upload
      return handlePDFUpload(e);
    } else if (e.parameter.interactionData) {
      // Handle interaction tracking data
      return handleInteractionTracking(e);
    } else if (e.parameter.data) {
      // Handle regular test results submission
      return handleTestResults(e);
    } else {
      // Return info page
      return ContentService.createTextOutput('Quiz API is running. Send data via parameters.').setMimeType(ContentService.MimeType.TEXT);
    }
    
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService.createTextOutput('Error: ' + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

function doPost(e) {
  try {
    console.log("Received POST request");
    
    // Handle POST requests (form submissions)
    if (e.parameter && e.parameter.action === 'uploadPDF') {
      return handlePDFUpload(e);
    } else if (e.parameter && e.parameter.data) {
      return handleTestResults(e);
    } else if (e.parameter && e.parameter.action === 'feedback') {
      return handleFeedbackSubmission(e);
    } else {
      return ContentService.createTextOutput('No valid data received in POST').setMimeType(ContentService.MimeType.TEXT);
    }
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput('Error: ' + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

function handleFeedbackSubmission(e) {
  try {
    console.log("Processing feedback submission");
    console.log("All parameters:", JSON.stringify(e.parameter || {}));
    
    // Get individual parameters for comprehensive feedback
    const action = e.parameter.action;
    const feedback = e.parameter.feedback;
    const accuracy = e.parameter.accuracy;
    const gameExperience = e.parameter.gameExperience;
    const fairness = e.parameter.fairness;
    const usefulness = e.parameter.usefulness;
    const recommendation = e.parameter.recommendation;
    const purchaseLikelihood = e.parameter.purchaseLikelihood;
    const valueForMoney = e.parameter.valueForMoney;
    const technicalPerformance = e.parameter.technicalPerformance;
    const timestamp = e.parameter.timestamp;
    const firstName = e.parameter.firstName;
    const lastName = e.parameter.lastName;
    
    console.log("Extracted parameters:", {
      action: action,
      feedback: feedback,
      accuracy: accuracy,
      gameExperience: gameExperience,
      fairness: fairness,
      usefulness: usefulness,
      recommendation: recommendation,
      purchaseLikelihood: purchaseLikelihood,
      valueForMoney: valueForMoney,
      technicalPerformance: technicalPerformance,
      timestamp: timestamp,
      firstName: firstName,
      lastName: lastName
    });
    
    if (!firstName || !lastName) {
      console.log("Missing required user information");
      return ContentService.createTextOutput('Missing required user information').setMimeType(ContentService.MimeType.TEXT);
    }
    
    // Get or create the feedbacks sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let feedbackSheet = spreadsheet.getSheetByName('Feedbacks');
    
    if (!feedbackSheet) {
      // Create the feedbacks sheet if it doesn't exist
      feedbackSheet = spreadsheet.insertSheet('Feedbacks');
      
      // Add comprehensive headers
      const headers = [
        'Timestamp', 'Name', 'Accuracy', 'Game Experience', 'Fairness', 
        'Usefulness', 'Recommendation', 'Purchase Likelihood', 'Value for Money', 
        'Technical Performance', 'Additional Comments'
      ];
      feedbackSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format headers
      const headerRange = feedbackSheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
    }
    
    // Prepare the data row
    const submissionTime = timestamp ? new Date(timestamp) : new Date();
    const formattedDate = Utilities.formatDate(submissionTime, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    const fullName = `${firstName} ${lastName}`;
    
    const rowData = [
      formattedDate,
      fullName,
      parseInt(accuracy) || 0,
      parseInt(gameExperience) || 0,
      parseInt(fairness) || 0,
      parseInt(usefulness) || 0,
      parseInt(recommendation) || 0,
      parseInt(purchaseLikelihood) || 0,
      parseInt(valueForMoney) || 0,
      parseInt(technicalPerformance) || 0,
      feedback || ''
    ];
    
    console.log("Adding comprehensive feedback row data:", rowData);
    
    // Add the data to the sheet
    feedbackSheet.appendRow(rowData);
    
    console.log("Comprehensive feedback data added successfully");
    return ContentService.createTextOutput('Feedback submitted successfully').setMimeType(ContentService.MimeType.TEXT);
    
  } catch (error) {
    console.error('Error processing feedback:', error);
    return ContentService.createTextOutput('Error processing feedback: ' + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

function handleInteractionTracking(e) {
  try {
    console.log("Processing interaction tracking data");
    
    const interactionDataString = e.parameter.interactionData;
    if (!interactionDataString) {
      console.log("No interaction data provided");
      return ContentService.createTextOutput('No interaction data').setMimeType(ContentService.MimeType.TEXT);
    }
    
    const interactionData = JSON.parse(interactionDataString);
    console.log("Parsed interaction data:", JSON.stringify(interactionData));
    
    // Get or create InteractionTracking sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let interactionSheet = spreadsheet.getSheetByName('InteractionTracking');
    
    if (!interactionSheet) {
      interactionSheet = spreadsheet.insertSheet('InteractionTracking');
      
      // Add headers for interaction tracking
      const headers = [
        'Timestamp', 'Session ID', 'Event Type', 'Question ID', 'Event Timestamp',
        'Previous Value', 'New Value', 'Direction', 'Response Time (ms)', 'Raw Event Data'
      ];
      interactionSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format headers
      const headerRange = interactionSheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#34a853');
      headerRange.setFontColor('white');
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
        
        interactionSheet.appendRow(rowData);
      }
      
      console.log(`Added ${interactionData.events.length} interaction events`);
    }
    
    return ContentService.createTextOutput('Interaction data saved successfully').setMimeType(ContentService.MimeType.TEXT);
    
  } catch (error) {
    console.error('Error processing interaction tracking:', error);
    return ContentService.createTextOutput('Error processing interaction tracking: ' + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

function handleTestResults(e) {
  try {
    console.log("Processing test results submission");
    
    // Handle regular test results data
    const dataString = e.parameter.data;
    if (!dataString) {
      console.log("No test results data provided");
      return ContentService.createTextOutput('No data').setMimeType(ContentService.MimeType.TEXT);
    }
    
    const data = JSON.parse(dataString);
    console.log("Parsed test results data");
    console.log("Data structure:", JSON.stringify(data, null, 2));
    
    // Get or create Results sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let resultsSheet = spreadsheet.getSheetByName('Results');
    
    if (!resultsSheet) {
      resultsSheet = spreadsheet.insertSheet('Results');
      
      // Add headers including PDF reference
      const headers = [
        'Timestamp', 'First Name', 'Last Name', 'Company', 'Answers', 'Scores', 'Total', 'PDF File ID', 'PDF URL'
      ];
      resultsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format headers
      const headerRange = resultsSheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#ea4335');
      headerRange.setFontColor('white');
    }
    
    // Prepare competency scores with detailed logging
    const competencyScores = {};
    console.log("Processing competency scores...");
    console.log("Raw competencyScores data:", data.competencyScores);
    
    if (data.competencyScores && Array.isArray(data.competencyScores)) {
      console.log("Found competencyScores array with", data.competencyScores.length, "items");
      data.competencyScores.forEach((comp, index) => {
        console.log(`Processing competency ${index}:`, comp);
        console.log(`Abbreviation: ${comp.abbreviation}, Score: ${comp.score}`);
        competencyScores[comp.abbreviation] = comp.score;
      });
    } else {
      console.log("No competencyScores array found or it's not an array");
    }
    
    console.log("Final competency scores object:", competencyScores);
    
    // Create formatted scores string (DM:25, IN:30, AD:20, etc.)
    const scoresArray = [];
    const competencyOrder = ['DM', 'IN', 'AD', 'CM', 'ST', 'TO', 'RL', 'RI'];
    let totalScore = 0;
    
    competencyOrder.forEach(abbrev => {
      const score = competencyScores[abbrev] || 0;
      scoresArray.push(`${abbrev}:${score}`);
      totalScore += score;
    });
    
    const scoresString = scoresArray.join(', ');
    
    // Find associated PDF for this user
    const pdfInfo = findUserPDF(data.user.firstName, data.user.lastName);
    
    // Prepare the data row with PDF information
    const timestamp = new Date();
    const formattedTimestamp = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    
    const rowData = [
      formattedTimestamp,
      data.user.firstName || '',
      data.user.lastName || '',
      data.user.company || '',
      JSON.stringify(data.answers),
      scoresString,
      totalScore,
      pdfInfo.fileId || '',
      pdfInfo.fileUrl || ''
    ];
    
    console.log("Adding test results row data:", rowData);
    console.log("Scores string:", scoresString);
    console.log("Total score:", totalScore);
    console.log("PDF info:", pdfInfo);
    
    // Add the data to the sheet
    resultsSheet.appendRow(rowData);
    
    console.log("Test results data added successfully");
    return ContentService.createTextOutput('Test results submitted successfully').setMimeType(ContentService.MimeType.TEXT);
    
  } catch (error) {
    console.error('Error processing test results:', error);
    return ContentService.createTextOutput('Error processing test results: ' + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Helper function to find PDF for a specific user
 */
function findUserPDF(firstName, lastName) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const pdfSheet = spreadsheet.getSheetByName('PDFs');
    
    if (!pdfSheet) {
      console.log("No PDFs sheet found");
      return { fileId: '', fileUrl: '' };
    }
    
    // Get all data from PDFs sheet
    const data = pdfSheet.getDataRange().getValues();
    
    // Skip header row and search for matching user
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const pdfFirstName = row[1]; // First Name column
      const pdfLastName = row[2];  // Last Name column
      const fileId = row[6];       // File ID column
      const fileUrl = row[7];      // File URL column
      const status = row[8];       // Upload Status column
      
      // Check if names match and upload was successful
      if (pdfFirstName === firstName && 
          pdfLastName === lastName && 
          status === 'Success') {
        console.log(`Found PDF for ${firstName} ${lastName}: ${fileId}`);
        return { fileId: fileId, fileUrl: fileUrl };
      }
    }
    
    console.log(`No PDF found for ${firstName} ${lastName}`);
    return { fileId: '', fileUrl: '' };
    
  } catch (error) {
    console.error('Error finding user PDF:', error);
    return { fileId: '', fileUrl: '' };
  }
}

function handlePDFUpload(e) {
  try {
    console.log("Processing PDF upload");
    console.log("All parameters:", JSON.stringify(e.parameter || {}));
    
    // Extract PDF upload parameters
    const action = e.parameter.action;
    const fileName = e.parameter.fileName;
    const fileSize = e.parameter.fileSize;
    const fileData = e.parameter.fileData;
    const firstName = e.parameter.firstName;
    const lastName = e.parameter.lastName;
    const company = e.parameter.company;
    const timestamp = e.parameter.timestamp;
    
    console.log("Extracted PDF parameters:", {
      action: action,
      fileName: fileName,
      fileSize: fileSize,
      firstName: firstName,
      lastName: lastName,
      company: company,
      timestamp: timestamp,
      hasFileData: !!fileData
    });
    
    if (!firstName || !lastName || !fileName || !fileData) {
      console.log("Missing required PDF upload information");
      return ContentService.createTextOutput('Missing required PDF upload information').setMimeType(ContentService.MimeType.TEXT);
    }
    
    // Create or get the PDFs folder in Google Drive
    let pdfFolder;
    const folders = DriveApp.getFoldersByName('Quiz_PDFs');
    if (folders.hasNext()) {
      pdfFolder = folders.next();
    } else {
      pdfFolder = DriveApp.createFolder('Quiz_PDFs');
    }
    
    // Convert base64 to blob and create file
    const blob = Utilities.newBlob(Utilities.base64Decode(fileData), 'application/pdf', fileName);
    const file = pdfFolder.createFile(blob);
    
    // Make file accessible (optional - be careful with permissions)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const fileUrl = file.getUrl();
    const fileId = file.getId();
    
    console.log("PDF file created:", {
      fileId: fileId,
      fileUrl: fileUrl,
      fileName: fileName
    });
    
    // Get or create the PDFs sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let pdfSheet = spreadsheet.getSheetByName('PDFs');
    
    if (!pdfSheet) {
      // Create the PDFs sheet if it doesn't exist
      pdfSheet = spreadsheet.insertSheet('PDFs');
      
      // Add headers
      const headers = [
        'Timestamp', 'First Name', 'Last Name', 'Company', 'File Name', 
        'File Size (bytes)', 'File ID', 'File URL', 'Upload Status'
      ];
      pdfSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format headers
      const headerRange = pdfSheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#34a853');
      headerRange.setFontColor('white');
    }
    
    // Prepare the data row
    const submissionTime = timestamp ? new Date(timestamp) : new Date();
    const formattedDate = Utilities.formatDate(submissionTime, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    
    const rowData = [
      formattedDate,
      firstName,
      lastName,
      company || '',
      fileName,
      parseInt(fileSize) || 0,
      fileId,
      fileUrl,
      'Success'
    ];
    
    console.log("Adding PDF row data:", rowData);
    
    // Add the data to the sheet
    pdfSheet.appendRow(rowData);
    
    console.log("PDF upload data added successfully");
    return ContentService.createTextOutput('PDF uploaded successfully').setMimeType(ContentService.MimeType.TEXT);
    
  } catch (error) {
    console.error('Error processing PDF upload:', error);
    
    // Still try to log the failed attempt
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      let pdfSheet = spreadsheet.getSheetByName('PDFs');
      
      if (pdfSheet) {
        const submissionTime = e.parameter.timestamp ? new Date(e.parameter.timestamp) : new Date();
        const formattedDate = Utilities.formatDate(submissionTime, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
        
        const errorRowData = [
          formattedDate,
          e.parameter.firstName || '',
          e.parameter.lastName || '',
          e.parameter.company || '',
          e.parameter.fileName || '',
          parseInt(e.parameter.fileSize) || 0,
          'ERROR',
          'ERROR',
          'Failed: ' + error.toString()
        ];
        
        pdfSheet.appendRow(errorRowData);
      }
    } catch (logError) {
      console.error('Error logging failed PDF upload:', logError);
    }
    
    return ContentService.createTextOutput('Error processing PDF upload: ' + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
} 