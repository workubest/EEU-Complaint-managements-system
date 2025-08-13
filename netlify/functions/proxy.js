// Netlify Function to proxy requests to Google Apps Script and handle CORS

// Google Apps Script URL - configurable via environment variable
const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || 
  'https://script.google.com/macros/s/AKfycbwRtSTJjIA9_Hx-SpX95dJ2hRg1SSkEGLlyqjWElWJoiGQWtLzt7pwYeyeycah7KpI/exec';

exports.handler = async function(event, context) {
  console.log('🔄 Netlify Function - Proxy Request');
  console.log('📝 Method:', event.httpMethod);
  console.log('🔗 Headers:', event.headers);
  console.log('📊 Query Params:', event.queryStringParameters);
  
  // Handle preflight CORS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  try {
    // Extract action and parameters
    let requestBody = {};
    let action = '';
    
    // Parse request body if present
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
        action = requestBody.action || '';
      } catch (parseError) {
        console.error('❌ Error parsing request body:', parseError);
        requestBody = {};
      }
    }

    // Add query parameters to request body (fallback for GET requests)
    if (event.queryStringParameters) {
      Object.keys(event.queryStringParameters).forEach(key => {
        if (!requestBody[key]) { // Don't override body parameters
          requestBody[key] = event.queryStringParameters[key];
        }
      });
      
      // Set action from query params if not in body
      if (!action && event.queryStringParameters.action) {
        action = event.queryStringParameters.action;
        requestBody.action = action;
      }
    }

    console.log('📤 Forwarding to Google Apps Script:');
    console.log('🎯 Action:', action);
    console.log('📦 Request Body:', JSON.stringify(requestBody, null, 2));

    // Build the request to Google Apps Script
    let scriptUrl = GOOGLE_APPS_SCRIPT_URL;
    let fetchOptions = {
      method: 'POST', // Always use POST for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    };

    // For GET requests or when explicitly requested, use GET method with URL parameters
    if (event.httpMethod === 'GET' && Object.keys(requestBody).length > 0) {
      const params = new URLSearchParams();
      Object.keys(requestBody).forEach(key => {
        if (requestBody[key] !== null && requestBody[key] !== undefined) {
          params.append(key, String(requestBody[key]));
        }
      });
      scriptUrl = `${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`;
      fetchOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      };
    }

    console.log('🌐 Final URL:', scriptUrl);
    console.log('⚙️ Fetch Options:', JSON.stringify(fetchOptions, null, 2));

    // Make request to Google Apps Script using native fetch (Node 18+)
    const response = await fetch(scriptUrl, fetchOptions);
    
    console.log('📥 Google Apps Script Response Status:', response.status);
    console.log('📋 Response Headers:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google Apps Script Error:', errorText);
      throw new Error(`Google Apps Script error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Google Apps Script Response:', JSON.stringify(data, null, 2));

    // Return successful response with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('❌ Proxy Error:', error);
    
    // Return error response with CORS headers
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: 'Proxy error',
        details: error.message,
        message: 'Failed to connect to backend service'
      }),
    };
  }
};