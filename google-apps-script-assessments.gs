/**
 * Google Apps Script for CGames V4 Assessment Data Collection
 * Handles raw assessment answers from Team, Engagement, Manager, and Space Mission assessments
 * Updated: January 2025
 */

// Configuration
const SPREADSHEET_ID = "19M8GBTq7HYpgNefgz5hxqKJdWV8g-y_MbUi5vzgm_t4"; // Your OlivinHR-Cevaplar spreadsheet

function doGet(e) {
  try {
    console.log("Received GET request");
    
    if (!e || !e.parameter) {
      return createErrorResponse("No parameters provided");
    }

    console.log("Parameters:", JSON.stringify(e.parameter));
    
    // Handle assessment data submission
    if (e.parameter.action === 'submitAssessment' && e.parameter.data) {
      return handleAssessmentSubmission(e.parameter.data);
    }
    
    // Return API info
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "CGames V4 Assessment Data API",
        timestamp: new Date().toISOString(),
        endpoints: [
          "GET ?action=submitAssessment&data={jsonData} - Submit assessment data"
        ]
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error("Error in doGet:", error);
    return createErrorResponse("Server error: " + error.toString());
  }
}

function doPost(e) {
  try {
    console.log("Received POST request");
    console.log("POST data:", e);
    
    let data;
    
    // Parse POST data - handle different formats
    if (e.postData && e.postData.contents) {
      console.log("Found postData.contents:", e.postData.contents);
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        console.error("Error parsing postData.contents:", parseError);
        return createErrorResponse("Invalid JSON in POST data: " + parseError.toString());
      }
    } else if (e.parameter && e.parameter.data) {
      console.log("Found parameter.data:", e.parameter.data);
      try {
        data = JSON.parse(e.parameter.data);
      } catch (parseError) {
        console.error("Error parsing parameter.data:", parseError);
        return createErrorResponse("Invalid JSON in parameter data: " + parseError.toString());
      }
    } else {
      console.log("No valid data found. Available keys:", Object.keys(e || {}));
      if (e.parameter) {
        console.log("Parameter keys:", Object.keys(e.parameter));
      }
      if (e.postData) {
        console.log("PostData keys:", Object.keys(e.postData));
      }
      return createErrorResponse("No data provided in POST request");
    }
    
    return handleAssessmentSubmission(data);
    
  } catch (error) {
    console.error("Error in doPost:", error);
    return createErrorResponse("Server error: " + error.toString());
  }
}

function handleAssessmentSubmission(dataString) {
  try {
    console.log("Processing assessment submission");
    
    const data = typeof dataString === 'string' ? JSON.parse(dataString) : dataString;
    
    // Validate required fields
    if (!data.assessmentType || !data.candidateEmail || !data.answers) {
      return createErrorResponse("Missing required fields: assessmentType, candidateEmail, answers");
    }
    
    console.log("Assessment data:", {
      assessmentType: data.assessmentType,
      candidateEmail: data.candidateEmail,
      answersCount: Object.keys(data.answers).length,
      hasScores: !!data.scores
    });
    
    // Save to appropriate sheet based on assessment type
    const result = saveAssessmentData(data);
    
    if (result.success) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: "Assessment data saved successfully",
          assessmentType: data.assessmentType,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return createErrorResponse(result.error);
    }
    
  } catch (error) {
    console.error("Error processing assessment:", error);
    return createErrorResponse("Processing error: " + error.toString());
  }
}

function saveAssessmentData(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Determine sheet name based on assessment type
    let sheetName;
    switch (data.assessmentType) {
      case 'takim-degerlendirme':
        sheetName = 'Team_Assessment';
        break;
      case 'calisan-bagliligi':
        sheetName = 'Engagement_Assessment';
        break;
      case 'yonetici-degerlendirme':
        sheetName = 'Manager_Assessment';
        break;
      case 'space-mission':
      default:
        sheetName = 'Space_Mission';
        break;
    }
    
    // Get or create the sheet
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      initializeSheetHeaders(sheet, data.assessmentType);
    }
    
    // Prepare row data
    const rowData = prepareRowData(data);
    
    // Append data to sheet
    sheet.appendRow(rowData);
    
    console.log(`Assessment data saved to ${sheetName} sheet`);
    
    return { success: true };
    
  } catch (error) {
    console.error("Error saving assessment data:", error);
    return { success: false, error: error.toString() };
  }
}

function initializeSheetHeaders(sheet, assessmentType) {
  let headers = [
    'Timestamp',
    'Candidate Email', 
    'Project ID',
    'Assessment Type',
    'Assessment Name',
    'Token',
    'Completion Time',
    'Total Questions',
    'Completed Questions'
  ];
  
  // Add assessment-specific headers
  if (assessmentType === 'space-mission') {
    // Add question columns for Space Mission (16 questions)
    for (let i = 1; i <= 16; i++) {
      headers.push(`Q${i}_Answer`);
    }
    // Add competency scores
    const competencies = ['DM', 'IN', 'AD', 'CM', 'ST', 'TO', 'RL', 'RI'];
    competencies.forEach(comp => {
      headers.push(`${comp}_Score`);
    });
  } else if (['takim-degerlendirme', 'yonetici-degerlendirme'].includes(assessmentType)) {
    // Add question columns for Team/Manager Assessment (30 questions)
    for (let i = 1; i <= 30; i++) {
      headers.push(`Q${i}_Answer`);
    }
    // Add dimension scores
    const dimensions = ['team_communication', 'shared_goals_vision', 'support_collaboration', 'trust_transparency', 'team_motivation'];
    dimensions.forEach(dim => {
      headers.push(`${dim}_Score`);
    });
  } else if (assessmentType === 'calisan-bagliligi') {
    // Add question columns for Engagement Assessment (varies by implementation)
    for (let i = 1; i <= 50; i++) { // Assuming max 50 questions
      headers.push(`Q${i}_Answer`);
    }
    // Add engagement dimension scores
    headers.push('Overall_Engagement_Score');
  }
  
  // Add metadata columns
  headers.push('Raw_Score', 'Score_Percentage', 'Candidate_Info', 'Raw_Data');
  
  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setWrap(true);
  
  // Freeze header row
  sheet.setFrozenRows(1);
}

function prepareRowData(data) {
  const timestamp = new Date();
  
  let rowData = [
    timestamp,
    data.candidateEmail,
    data.projectId || '',
    data.assessmentType,
    data.assessmentName || '',
    data.token || '',
    data.completionTime || '',
    data.totalQuestions || 0,
    data.completedQuestions || 0
  ];
  
  // Add answers based on assessment type
  if (data.assessmentType === 'space-mission') {
    // Add 16 question answers
    for (let i = 1; i <= 16; i++) {
      rowData.push(data.answers[i.toString()] || '');
    }
    // Add competency scores
    const competencies = ['DM', 'IN', 'AD', 'CM', 'ST', 'TO', 'RL', 'RI'];
    competencies.forEach(comp => {
      rowData.push(data.scores && data.scores[comp] ? data.scores[comp] : '');
    });
  } else if (['takim-degerlendirme', 'yonetici-degerlendirme'].includes(data.assessmentType)) {
    // Add 30 question answers
    for (let i = 1; i <= 30; i++) {
      rowData.push(data.answers[i.toString()] || '');
    }
    // Add dimension scores
    const dimensions = ['team_communication', 'shared_goals_vision', 'support_collaboration', 'trust_transparency', 'team_motivation'];
    dimensions.forEach(dim => {
      rowData.push(data.scores && data.scores[dim] ? data.scores[dim] : '');
    });
  } else if (data.assessmentType === 'calisan-bagliligi') {
    // Add engagement question answers (up to 50)
    for (let i = 1; i <= 50; i++) {
      rowData.push(data.answers[i.toString()] || '');
    }
    // Add overall engagement score
    rowData.push(data.scores && data.scores.overall ? data.scores.overall : '');
  }
  
  // Add metadata
  rowData.push(
    data.rawScore || '',
    data.scorePercentage || '',
    JSON.stringify(data.candidateInfo || {}),
    JSON.stringify({
      answers: data.answers,
      scores: data.scores,
      metadata: data.metadata || {}
    })
  );
  
  return rowData;
}

function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Test function to verify script setup
function testScript() {
  console.log("Testing CGames V4 Assessment Data Script");
  
  const testData = {
    assessmentType: 'takim-degerlendirme',
    candidateEmail: 'test@example.com',
    answers: { '1': 'A', '2': 'B', '3': 'C' },
    scores: { 'team_communication': 85 },
    projectId: 'test-project',
    token: 'test-token'
  };
  
  const result = saveAssessmentData(testData);
  console.log("Test result:", result);
  
  return result;
}
