# PDF Upload Feature Documentation

## Overview
The PDF upload feature allows users to upload their CV/Resume during the form registration process. The PDFs are securely stored in Google Drive and referenced in Google Sheets alongside test results, feedback, and interaction tracking data.

## Features

### Frontend Implementation
- **File Validation**: Only PDF files up to 10MB are accepted
- **Visual Feedback**: Progress indicators and file preview
- **Error Handling**: Clear error messages for invalid files
- **Optional Upload**: Users can skip PDF upload and continue with the test
- **Responsive Design**: Works on both desktop and mobile devices

### Backend Integration
- **Google Drive Storage**: PDFs are stored in a dedicated "Quiz_PDFs" folder
- **Google Sheets Integration**: PDF metadata is tracked in a "PDFs" sheet
- **Automatic Linking**: Test results automatically reference associated PDFs
- **Security**: Files are set to view-only with link sharing

## Implementation Details

### Frontend Components

#### FormScreen.tsx
- Added PDF upload field after company field
- File validation (type and size)
- Base64 encoding for upload
- Progress indicators during upload
- Error handling and user feedback

#### IdentityScreen2.tsx
- Same PDF upload functionality for Game2 flow
- Consistent UI and validation

#### CSS Styling
- Modern drag-and-drop interface
- File preview with remove option
- Progress animations
- Error state styling
- Mobile-responsive design

### Backend (Google Apps Script)

#### New Functions Added:

1. **handlePDFUpload(e)**
   - Processes PDF upload requests
   - Creates Google Drive folder if needed
   - Converts base64 to PDF file
   - Sets file permissions
   - Logs upload to PDFs sheet

2. **findUserPDF(firstName, lastName)**
   - Helper function to find PDFs for specific users
   - Used when linking test results to PDFs
   - Returns file ID and URL for reference

#### Updated Functions:

1. **doGet(e) & doPost(e)**
   - Added routing for 'uploadPDF' action
   - Handles both GET and POST requests

2. **handleTestResults(e)**
   - Now includes PDF references in results
   - Automatically links user PDFs to test results
   - Added Company and PDF columns to Results sheet

### Google Sheets Structure

#### New Sheet: "PDFs"
| Column | Description |
|--------|-------------|
| Timestamp | Upload date and time |
| First Name | User's first name |
| Last Name | User's last name |
| Company | User's company |
| File Name | Original PDF filename |
| File Size (bytes) | File size in bytes |
| File ID | Google Drive file ID |
| File URL | Direct link to PDF |
| Upload Status | Success/Error status |

#### Updated Sheet: "Results"
Added columns:
- Company
- PDF File ID
- PDF URL

## Usage Instructions

### For Users
1. Fill in personal information (Name, Last Name, Company)
2. Optionally select a PDF file (CV/Resume)
3. File is validated and uploaded automatically
4. Continue with the test regardless of upload status

### For Administrators
1. Access Google Drive "Quiz_PDFs" folder to view uploaded files
2. Check "PDFs" sheet for upload logs and metadata
3. "Results" sheet now includes PDF references for each user
4. Use File ID or URL to access specific user PDFs

## Security Considerations

### File Validation
- Only PDF files accepted
- Maximum file size: 10MB
- File type validation on both frontend and backend

### Storage Security
- Files stored in dedicated Google Drive folder
- View-only permissions with link sharing
- No public access without direct link

### Data Privacy
- PDF metadata logged for administrative purposes
- Files can be manually deleted from Google Drive if needed
- User consent required before upload

## Error Handling

### Frontend Errors
- Invalid file type: "Lütfen sadece PDF dosyası seçin."
- File too large: "Dosya boyutu 10MB'dan küçük olmalıdır."
- Upload failure: "PDF yükleme başarısız oldu. Devam etmek istiyor musunuz?"

### Backend Errors
- Missing data: Logged with error status in PDFs sheet
- Drive API errors: Caught and logged
- Processing errors: Detailed error messages in logs

## Performance Optimization

### Frontend
- File validation before upload
- Base64 encoding only when needed
- Progress indicators for user feedback
- Non-blocking upload process

### Backend
- Efficient file processing
- Error logging for debugging
- Minimal API calls
- Batch operations where possible

## Future Enhancements

### Potential Improvements
1. **PDF Analysis**: Extract text and analyze CV content
2. **File Compression**: Reduce file sizes before upload
3. **Multiple Formats**: Support for DOC, DOCX files
4. **Advanced Validation**: Check PDF content validity
5. **Bulk Operations**: Admin tools for managing multiple PDFs

### Integration Opportunities
1. **AI Analysis**: Use Google AI to analyze CV content
2. **Matching System**: Match CV skills with test results
3. **Recommendation Engine**: Provide personalized feedback based on CV
4. **Export Features**: Include PDF analysis in result exports

## Testing

### Manual Testing Checklist
- [ ] Upload valid PDF file
- [ ] Test file size validation (>10MB)
- [ ] Test file type validation (non-PDF)
- [ ] Verify Google Drive storage
- [ ] Check Google Sheets logging
- [ ] Test without PDF upload
- [ ] Verify mobile responsiveness
- [ ] Test error scenarios

### Automated Testing
- Unit tests for file validation
- Integration tests for upload process
- End-to-end tests for complete flow

## Troubleshooting

### Common Issues
1. **Upload Fails**: Check Google Apps Script permissions
2. **File Not Found**: Verify Google Drive folder exists
3. **Large Files**: Ensure file size is under 10MB
4. **Permission Errors**: Check Google Drive API access

### Debug Steps
1. Check browser console for errors
2. Review Google Apps Script logs
3. Verify Google Drive folder permissions
4. Test with smaller PDF files

## API Reference

### Upload Endpoint
```
POST https://script.google.com/macros/s/[SCRIPT_ID]/exec
```

### Parameters
- `action`: "uploadPDF"
- `fileName`: Original filename
- `fileSize`: File size in bytes
- `fileData`: Base64 encoded PDF data
- `firstName`: User's first name
- `lastName`: User's last name
- `company`: User's company
- `timestamp`: Upload timestamp

### Response
- Success: "PDF uploaded successfully"
- Error: "Error processing PDF upload: [error message]"

## Conclusion

The PDF upload feature provides a seamless way for users to submit their CVs alongside test results, creating a comprehensive profile for analysis and feedback. The implementation ensures security, performance, and user experience while maintaining integration with the existing Google Sheets workflow. 