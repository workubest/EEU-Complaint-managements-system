// Netlify Function to proxy requests to Google Apps Script and handle CORS

// Google Apps Script URL - configurable via environment variable
const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || 
  'https://script.google.com/macros/s/AKfycbwRtSTJjIA9_Hx-SpX95dJ2hRg1SSkEGLlyqjWElWJoiGQWtLzt7pwYeyeycah7KpI/exec';

exports.handler = async function(event, context) {
  console.log('🔄 Netlify Function - Proxy Request');
  console.log('📝 Method:', event.httpMethod);
  console.log('🔗 Headers:', JSON.stringify(event.headers, null, 2));
  console.log('📊 Query Params:', JSON.stringify(event.queryStringParameters, null, 2));
  console.log('🌐 Google Apps Script URL:', GOOGLE_APPS_SCRIPT_URL);
  
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
        console.log('📦 Parsed request body:', JSON.stringify(requestBody, null, 2));
      } catch (parseError) {
        console.error('❌ Error parsing request body:', parseError);
        console.log('📝 Raw body:', event.body);
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

    // If still no action, try to extract from path
    if (!action && event.path) {
      const pathParts = event.path.split('/');
      const actionFromPath = pathParts[pathParts.length - 1];
      if (actionFromPath && actionFromPath !== 'proxy') {
        action = actionFromPath;
        requestBody.action = action;
      }
    }

    console.log('📤 Forwarding to Google Apps Script:');
    console.log('🎯 Action:', action);
    console.log('📦 Final Request Body:', JSON.stringify(requestBody, null, 2));

    // Validate that we have an action
    if (!action) {
      console.error('❌ No action specified in request');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          error: 'No action specified',
          message: 'Request must include an action parameter'
        }),
      };
    }

    // Build the request to Google Apps Script
    let scriptUrl = GOOGLE_APPS_SCRIPT_URL;
    let fetchOptions = {
      method: 'POST', // Always use POST for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    };

    // For simple GET requests, we can also try URL parameters
    if (event.httpMethod === 'GET' && Object.keys(requestBody).length > 0) {
      const params = new URLSearchParams();
      Object.keys(requestBody).forEach(key => {
        if (requestBody[key] !== null && requestBody[key] !== undefined) {
          params.append(key, String(requestBody[key]));
        }
      });
      
      // Try both POST and GET approaches for better compatibility
      console.log('🔄 Trying GET request first...');
      const getUrl = `${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`;
      console.log('🌐 GET URL:', getUrl);
      
      try {
        const getResponse = await fetch(getUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (getResponse.ok) {
          const getData = await getResponse.json();
          console.log('✅ GET request successful:', JSON.stringify(getData, null, 2));
          
          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(getData),
          };
        } else {
          console.log('⚠️ GET request failed, falling back to POST');
        }
      } catch (getError) {
        console.log('⚠️ GET request error, falling back to POST:', getError.message);
      }
    }

    console.log('🌐 Final URL:', scriptUrl);
    console.log('⚙️ Fetch Options:', JSON.stringify(fetchOptions, null, 2));

    // Make request to Google Apps Script using native fetch (Node 18+)
    const response = await fetch(scriptUrl, fetchOptions);
    
    console.log('📥 Google Apps Script Response Status:', response.status);
    console.log('📋 Response Headers:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google Apps Script Error Response:', errorText);
      throw new Error(`Google Apps Script error: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('📝 Raw Response Text:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ Parsed Google Apps Script Response:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      console.log('📝 Response text that failed to parse:', responseText);
      throw new Error(`Invalid JSON response from Google Apps Script: ${responseText}`);
    }

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
    console.error('❌ Error Stack:', error.stack);
    
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
        message: 'Failed to connect to backend service. Please check Google Apps Script deployment.',
        timestamp: new Date().toISOString()
      }),
    };
  }
};