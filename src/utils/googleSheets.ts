interface User {
  firstName: string;
  lastName: string;
}

interface CompetencyScore {
  name: string;
  score: number;
  color: string;
}

/**
 * Sends quiz results to the Google Sheets database
 * @param user User information (first name, last name)
 * @param answers Object containing question IDs as keys and selected option IDs as values
 * @param competencyScores Array of competency scores
 * @returns Promise that resolves to the response from the Google Apps Script
 */
export const sendResultsToGoogleSheets = async (
  user: User,
  answers: { [key: number]: string },
  competencyScores: CompetencyScore[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5FfkakXp3HADStMegv5JCvftCJaJ1s42xI6wElHcnx9BEZMK92ybNE5jTaO2q75tW/exec";
    
    // Convert data to JSON string
    const data = {
      user,
      answers,
      competencyScores
    };
    
    // Using fetch with no-cors mode to avoid CORS issues
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL + "?data=" + encodeURIComponent(JSON.stringify(data)), {
      method: "GET",
      mode: "no-cors", // This prevents CORS errors
    });
    
    // Also send using the form method as a backup
    setTimeout(() => {
      // Create a hidden iframe to submit the form without page navigation
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Create a form inside the iframe
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = GOOGLE_APPS_SCRIPT_URL;
      
      // Create hidden input for data
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = 'data';
      hiddenField.value = JSON.stringify(data);
      
      form.appendChild(hiddenField);
      
      // Add form to iframe and submit
      iframe.contentDocument?.body.appendChild(form);
      form.submit();
      
      // Remove iframe after 5 seconds
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);
    }, 1000);

    return { success: true };
  } catch (error) {
    console.error("Error sending results to Google Sheets:", error);
    
    // Even if there's an error, try the form method
    try {
      const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5FfkakXp3HADStMegv5JCvftCJaJ1s42xI6wElHcnx9BEZMK92ybNE5jTaO2q75tW/exec";
      
      const data = {
        user,
        answers,
        competencyScores
      };
      
      // Create a hidden iframe to submit the form without page navigation
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Create a form inside the iframe
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = GOOGLE_APPS_SCRIPT_URL;
      
      // Create hidden input for data
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = 'data';
      hiddenField.value = JSON.stringify(data);
      
      form.appendChild(hiddenField);
      
      // Add form to iframe and submit
      iframe.contentDocument?.body.appendChild(form);
      form.submit();
      
      // Remove iframe after 5 seconds
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);
      
      return { success: true };
    } catch (e) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}; 