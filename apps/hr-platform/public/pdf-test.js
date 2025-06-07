// PDF.js Functionality Test
// Open browser console and run: testPDFWorker()

window.testPDFWorker = async function() {
  console.group('🧪 Testing PDF.js Worker Configuration');
  
  try {
    // Check if PDF.js is loaded
    if (typeof pdfjsLib === 'undefined') {
      console.error('❌ PDF.js library not loaded');
      return;
    }
    
    console.log('✅ PDF.js library loaded');
    console.log('📋 Version:', pdfjsLib.version);
    console.log('🔧 Build:', pdfjsLib.build);
    console.log('👷 Worker Source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    
    // Test worker accessibility
    try {
      const response = await fetch(pdfjsLib.GlobalWorkerOptions.workerSrc);
      if (response.ok) {
        console.log('✅ Worker file is accessible');
      } else {
        console.error('❌ Worker file not accessible:', response.status);
      }
    } catch (fetchError) {
      console.error('❌ Cannot fetch worker file:', fetchError);
    }
    
    console.log('🎉 PDF.js configuration looks good! Try uploading a CV now.');
    
  } catch (error) {
    console.error('❌ PDF.js test failed:', error);
  }
  
  console.groupEnd();
};

console.log('🧪 PDF test function loaded. Run testPDFWorker() to test configuration.'); 