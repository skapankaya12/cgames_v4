# Google Sheets Integration Setup Guide

## Overview

This integration sends raw assessment answers from all assessments (Team, Engagement, Manager, Space Mission) to Google Sheets while maintaining the existing HR Dashboard functionality.

## Architecture

```
Assessment Completion → API Endpoint → {
  1. Save to Firebase (existing - HR Dashboard)
  2. Send to Google Sheets (new - raw data collection)
}
```

## Setup Steps

### 1. Create Google Apps Script

1. **Go to Google Apps Script**: https://script.google.com
2. **Create New Project**: Click "New Project"
3. **Replace Code**: Copy the code from `google-apps-script-assessments.gs`
4. **Configure Spreadsheet ID**:
   ```javascript
   const SPREADSHEET_ID = "YOUR_ACTUAL_SPREADSHEET_ID_HERE";
   ```
5. **Save and Deploy**:
   - Click Save
   - Click Deploy → New Deployment
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Copy the Web App URL

### 2. Create Google Spreadsheet

1. **Create New Spreadsheet**: https://sheets.google.com
2. **Copy Spreadsheet ID** from URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
3. **Update Apps Script**: Replace `YOUR_SPREADSHEET_ID_HERE` with actual ID

### 3. Configure Environment Variables

Add to your Vercel API environment variables:

```bash
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbzEInShsYOZq1J-dvab06TqO-6RQhUlEuiuSZcuLHSWBWquWuRH8-KYKLGu3A9zVFR1IQ/exec
```

### 4. Test the Integration

Run the test function in Google Apps Script:
```javascript
function testScript() {
  // This function tests the integration
}
```

## Data Structure

### Sheets Created Automatically

1. **Team_Assessment** - Team evaluation data
2. **Engagement_Assessment** - Employee engagement data  
3. **Manager_Assessment** - Manager evaluation data
4. **Space_Mission** - Leadership scenario data

### Column Structure

Each sheet contains:
- **Basic Info**: Timestamp, Candidate Email, Project ID, Assessment Type
- **Raw Answers**: Q1_Answer, Q2_Answer, Q3_Answer, etc.
- **Scores**: Competency/dimension scores
- **Metadata**: Completion time, candidate info, raw data JSON

## Features

### ✅ What's Included

- **All Assessment Types**: Team, Engagement, Manager, Space Mission
- **Raw Answer Collection**: Every question response captured
- **Score Integration**: Calculated scores included
- **Automatic Sheet Creation**: Sheets created with proper headers
- **Non-blocking Operation**: Google Sheets failure won't break assessments
- **Comprehensive Logging**: Detailed logs for debugging

### 🔧 Configuration Options

- **Enable/Disable**: Set `GOOGLE_APPS_SCRIPT_URL` to enable
- **Custom Spreadsheet**: Use any Google Spreadsheet
- **Flexible Deployment**: Deploy to any Google Apps Script account

## Data Flow Example

### Team Assessment Submission
```json
{
  "assessmentType": "takim-degerlendirme",
  "candidateEmail": "candidate@example.com",
  "answers": {
    "1": "5", "2": "4", "3": "3", ...
  },
  "scores": {
    "team_communication": 85,
    "shared_goals_vision": 78,
    ...
  }
}
```

### Google Sheets Row
| Timestamp | Email | Project | Type | Q1 | Q2 | Q3 | ... | Team_Comm | Shared_Goals | ... |
|-----------|-------|---------|------|----|----|----|----|-----------|--------------|-----|
| 2025-01-15 | candidate@example.com | proj-123 | takim-degerlendirme | 5 | 4 | 3 | ... | 85 | 78 | ... |

## Troubleshooting

### Common Issues

1. **Google Sheets Not Receiving Data**
   - Check `GOOGLE_APPS_SCRIPT_URL` environment variable
   - Verify Google Apps Script deployment is active
   - Check Vercel logs for Google Sheets errors

2. **Permission Errors**
   - Ensure Google Apps Script has spreadsheet access
   - Check if spreadsheet ID is correct
   - Verify script execution permissions

3. **Data Format Issues**
   - Check API logs for data formatting errors
   - Verify assessment type matches expected values
   - Ensure answers object has correct structure

### Debug Steps

1. **Check Vercel Logs**:
   ```bash
   vercel logs --follow
   ```

2. **Test Google Apps Script**:
   - Run `testScript()` function in Apps Script editor
   - Check execution logs

3. **Verify Environment Variables**:
   ```bash
   vercel env ls
   ```

## Security Considerations

- **Data Privacy**: Raw assessment data is sent to Google Sheets
- **Access Control**: Configure Google Sheets sharing appropriately  
- **Environment Variables**: Keep Google Apps Script URL secure
- **Non-Critical Operation**: Failures don't impact main assessment flow

## Maintenance

### Regular Tasks

1. **Monitor Logs**: Check for Google Sheets integration errors
2. **Data Cleanup**: Archive old assessment data if needed
3. **Access Review**: Periodically review Google Sheets access permissions
4. **Script Updates**: Update Google Apps Script when adding new assessments

### Adding New Assessment Types

1. **Update Google Apps Script**: Add new case in `initializeSheetHeaders()`
2. **Update Service**: Add assessment type to `getAssessmentDisplayName()`
3. **Test Integration**: Verify new assessment data flows correctly

## Benefits

- **Complete Data Collection**: All assessment responses captured
- **Easy Analysis**: Data in familiar Google Sheets format
- **Backup System**: Additional data storage beyond Firebase
- **No HR Dashboard Impact**: Existing functionality unchanged
- **Scalable**: Easy to add new assessment types
- **Non-blocking**: Main assessment flow not affected by Google Sheets issues

---

**Last Updated**: January 2025
**Status**: Ready for Implementation ✅
