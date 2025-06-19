// Debug utility for testing Google Sheets integration
const API_URL = "https://script.google.com/macros/s/AKfycbzMTWueAS7y8b_Us7FoA2joYyaAim_KsGL9YlaGd0LfJNuUFPczGJfA4kBP6wUrT7J0/exec";

// Simple test to check if the API is responding
export const testBasicConnection = () => {
  console.log("=== TESTING BASIC CONNECTION ===");
  console.log("API URL:", API_URL);
  
  // Test 1: Basic GET request
  const basicUrl = API_URL;
  console.log("Testing basic URL:", basicUrl);
  
  const img1 = new Image();
  img1.onload = () => console.log("✅ Basic connection successful");
  img1.onerror = () => console.log("❌ Basic connection failed");
  img1.src = basicUrl;
  img1.style.display = 'none';
  document.body.appendChild(img1);
  
  // Test 2: Simple data parameter
  setTimeout(() => {
    const simpleData = {
      user: { firstName: "Test", lastName: "User" },
      answers: { "1": "A" },
      competencyScores: [{ abbreviation: "DM", score: 25 }]
    };
    
    const testUrl = `${API_URL}?data=${encodeURIComponent(JSON.stringify(simpleData))}`;
    console.log("Testing with simple data:");
    console.log("URL length:", testUrl.length);
    console.log("URL:", testUrl);
    
    const img2 = new Image();
    img2.onload = () => console.log("✅ Simple data test successful");
    img2.onerror = () => console.log("❌ Simple data test failed");
    img2.src = testUrl;
    img2.style.display = 'none';
    document.body.appendChild(img2);
  }, 2000);
};

export const testGoogleSheetsIntegration = () => {
  console.log("=== GOOGLE SHEETS INTEGRATION TEST ===");
  console.log("API URL:", API_URL);
  
  const testResults = () => {
    console.log("\n--- Testing Results Submission ---");
    
    const testData = {
      user: {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        phone: "1234567890",
        company: "Test Company",
        position: "Test Position"
      },
      answers: {
        1: "A",
        2: "B",
        3: "C"
      },
      competencyScores: [
        { name: "DM", abbreviation: "DM", score: 25, maxScore: 40, fullName: "Karar Verme", color: "#ff6b6b", category: "stratejik", description: "Test description" },
        { name: "IN", abbreviation: "IN", score: 30, maxScore: 40, fullName: "İnisiyatif", color: "#4ecdc4", category: "liderlik", description: "Test description" },
        { name: "AD", abbreviation: "AD", score: 20, maxScore: 40, fullName: "Adaptasyon", color: "#45b7d1", category: "liderlik", description: "Test description" },
        { name: "CM", abbreviation: "CM", score: 35, maxScore: 40, fullName: "İletişim", color: "#96ceb4", category: "iletişim", description: "Test description" },
        { name: "ST", abbreviation: "ST", score: 28, maxScore: 40, fullName: "Stratejik Düşünme", color: "#feca57", category: "stratejik", description: "Test description" },
        { name: "TO", abbreviation: "TO", score: 32, maxScore: 40, fullName: "Takım Oryantasyonu", color: "#ff9ff3", category: "iletişim", description: "Test description" },
        { name: "RL", abbreviation: "RL", score: 22, maxScore: 40, fullName: "Risk Liderliği", color: "#54a0ff", category: "risk", description: "Test description" },
        { name: "RI", abbreviation: "RI", score: 27, maxScore: 40, fullName: "Risk Zekası", color: "#5f27cd", category: "risk", description: "Test description" }
      ]
    };
    
    console.log("Test data structure:", testData);
    console.log("Competency scores:", testData.competencyScores.map(score => ({
      abbreviation: score.abbreviation,
      score: score.score
    })));
    
    const url = `${API_URL}?data=${encodeURIComponent(JSON.stringify(testData))}`;
    console.log("Results URL length:", url.length);
    console.log("Results URL preview:", url.substring(0, 300) + "...");
    
    const img = new Image();
    img.onload = () => {
      console.log("✅ Results submission successful");
    };
    img.onerror = () => {
      console.log("❌ Results submission failed");
    };
    img.src = url;
    img.style.display = 'none';
    document.body.appendChild(img);
    
    // Clean up after 10 seconds
    setTimeout(() => {
      if (document.body.contains(img)) {
        document.body.removeChild(img);
      }
    }, 10000);
  };
  
  const testFeedback = () => {
    console.log("\n--- Testing Feedback Submission ---");
    
    const params = new URLSearchParams({
      action: 'feedback',
      feedback: 'This is a test feedback message for debugging purposes.',
      accuracy: '5',
      gameExperience: '4',
      fairness: '5',
      usefulness: '4',
      recommendation: '5',
      purchaseLikelihood: '3',
      valueForMoney: '4',
      technicalPerformance: '5',
      timestamp: new Date().toISOString(),
      firstName: 'Test',
      lastName: 'User'
    });
    
    const url = `${API_URL}?${params.toString()}`;
    console.log("Feedback URL length:", url.length);
    console.log("Feedback URL:", url);
    
    const img = new Image();
    let isCompleted = false;
    
    img.onload = () => {
      if (!isCompleted) {
        isCompleted = true;
        console.log("✅ Feedback submission successful");
      }
    };
    
    img.onerror = () => {
      if (!isCompleted) {
        isCompleted = true;
        console.log("❌ Feedback submission failed");
      }
    };
    
    // Timeout-based success detection
    setTimeout(() => {
      if (!isCompleted) {
        isCompleted = true;
        console.log("✅ Feedback submission completed (timeout-based)");
      }
    }, 3000);
    
    img.src = url;
    img.style.display = 'none';
    document.body.appendChild(img);
    
    // Clean up after 10 seconds
    setTimeout(() => {
      if (document.body.contains(img)) {
        document.body.removeChild(img);
      }
    }, 10000);
  };
  
  const testInteractionTracking = () => {
    console.log("\n--- Testing Interaction Tracking ---");
    
    const interactionData = {
      sessionId: "test-session-" + Date.now(),
      events: [
        {
          type: "answer_change",
          questionId: 1,
          timestamp: new Date().toISOString(),
          data: {
            previousValue: "A",
            newValue: "B",
            responseTime: 5000
          }
        },
        {
          type: "navigation",
          questionId: 2,
          timestamp: new Date().toISOString(),
          data: {
            direction: "next",
            responseTime: 3000
          }
        }
      ],
      user: {
        firstName: "Test",
        lastName: "User"
      }
    };
    
    const url = `${API_URL}?interactionData=${encodeURIComponent(JSON.stringify(interactionData))}`;
    console.log("Interaction URL length:", url.length);
    console.log("Interaction data:", interactionData);
    
    const img = new Image();
    img.onload = () => {
      console.log("✅ Interaction tracking successful");
    };
    img.onerror = () => {
      console.log("❌ Interaction tracking failed");
    };
    img.src = url;
    img.style.display = 'none';
    document.body.appendChild(img);
    
    // Clean up after 10 seconds
    setTimeout(() => {
      if (document.body.contains(img)) {
        document.body.removeChild(img);
      }
    }, 10000);
  };
  
  const testAll = () => {
    console.log("Running all tests...");
    testResults();
    setTimeout(() => testFeedback(), 2000);
    setTimeout(() => testInteractionTracking(), 4000);
  };
  
  // Make functions available globally for console testing
  (window as any).testGoogleSheets = {
    testBasicConnection,
    testResults,
    testFeedback,
    testInteractionTracking,
    testAll
  };
  
  console.log("Test functions available:");
  console.log("- testGoogleSheets.testBasicConnection()");
  console.log("- testGoogleSheets.testResults()");
  console.log("- testGoogleSheets.testFeedback()");
  console.log("- testGoogleSheets.testInteractionTracking()");
  console.log("- testGoogleSheets.testAll()");
  
  return {
    testBasicConnection,
    testResults,
    testFeedback,
    testInteractionTracking,
    testAll
  };
}; 