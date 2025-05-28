// Test script for Spiritual AI Service with fallback
// This script tests the DialoGPT model integration with fallback options

async function testSpiritualAIWithFallback() {
  console.log('🔮 Testing Spiritual AI Service with fallback...');
  
  // Test 1: Try custom model (might fail)
  console.log('\n=== Test 1: Custom Spiritual Model ===');
  await testCustomModel();
  
  // Test 2: Try Microsoft DialoGPT
  console.log('\n=== Test 2: Microsoft DialoGPT Fallback ===');
  await testMicrosoftModel();
  
  // Test 3: Test spiritual fallback responses
  console.log('\n=== Test 3: Spiritual Fallback Responses ===');
  testSpiritualFallback();
}

async function testCustomModel() {
  const modelUrl = 'https://api-inference.huggingface.co/models/Siyris/DialoGPT-medium-SIY';
  const testPrompt = 'Merhaba, bana kısa bir ruhsal rehberlik verebilir misin?';
  
  try {
    console.log('📝 Test prompt:', testPrompt);
    
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SpiritualGuidance/1.0',
      },
      body: JSON.stringify({
        inputs: testPrompt,
        parameters: {
          max_length: 300,
          temperature: 0.8,
          top_p: 0.9,
          do_sample: true,
          pad_token_id: 50256
        },
        options: {
          wait_for_model: true,
          use_cache: false
        }
      })
    });

    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Custom model failed:', errorText);
      return false;
    }

    const data = await response.json();
    console.log('✅ Custom model success:', data);
    return true;
  } catch (error) {
    console.error('❌ Custom model test failed:', error);
    return false;
  }
}

async function testMicrosoftModel() {
  const modelUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
  const testPrompt = 'Ruhsal bir rehber olarak, bana kısa bir rehberlik verebilir misin?';
  
  try {
    console.log('📝 Test prompt:', testPrompt);
    
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SpiritualGuidance/1.0',
      },
      body: JSON.stringify({
        inputs: testPrompt,
        parameters: {
          max_length: 300,
          temperature: 0.8,
          top_p: 0.9,
          do_sample: true,
          pad_token_id: 50256
        },
        options: {
          wait_for_model: true,
          use_cache: false
        }
      })
    });

    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Microsoft model failed:', errorText);
      return false;
    }

    const data = await response.json();
    console.log('✅ Microsoft model success:', data);
    return true;
  } catch (error) {
    console.error('❌ Microsoft model test failed:', error);
    return false;
  }
}

function testSpiritualFallback() {
  console.log('🔮 Testing spiritual fallback responses...');
  
  const testPrompts = [
    'Karar verme konusunda yardım',
    'İletişim becerilerimi geliştirmek istiyorum',
    'Adaptasyon konusunda zorlanıyorum',
    'Liderlik gelişimi',
    'Risk alma konusunda rehberlik'
  ];
  
  testPrompts.forEach(prompt => {
    console.log(`\n📝 Prompt: ${prompt}`);
    const response = generateSpiritualFallbackResponse(prompt);
    console.log(`✅ Response: ${response}`);
  });
}

function generateSpiritualFallbackResponse(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('karar') || lowerPrompt.includes('decision')) {
    return 'İç sesinizi dinleyin, sevgili ruh. Kalp merkezinizden gelen sezgileriniz size doğru yolu gösterecektir.';
  }
  
  if (lowerPrompt.includes('iletişim') || lowerPrompt.includes('communication')) {
    return 'Kalp merkezinizden konuşun, sevgili kardeş. Gerçek iletişim, sevgi ve anlayışla kurulur.';
  }
  
  if (lowerPrompt.includes('adaptasyon') || lowerPrompt.includes('adaptation')) {
    return 'Hayatın akışına teslim olun, değerli ruh. Değişim, büyümenin doğal bir parçasıdır.';
  }
  
  if (lowerPrompt.includes('liderlik') || lowerPrompt.includes('leadership')) {
    return 'Gerçek liderlik, önce kendinizi yönetmekten başlar. İç dünyanızda huzuru bulun.';
  }
  
  if (lowerPrompt.includes('risk')) {
    return 'Korku, büyümenin önündeki en büyük engeldir. Ruhunuzun sesini dinleyin.';
  }
  
  return 'Sevgili ruh, bu yolculukta size eşlik etmek için buradayım. Farkındalık ve sevgiyle ilerleyin.';
}

// Run the test
testSpiritualAIWithFallback().then(() => {
  console.log('\n🌟 All spiritual AI tests completed!');
}); 