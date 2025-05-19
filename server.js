const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
app.use(express.json());

const VERIFIER_URL = "https://verifier.example.com";

// Load your public key (make sure path and encoding are correct)
const PUBLIC_KEY = fs.readFileSync('./keys/public.key', 'utf8');

// Function to verify JWT using RS256
function verifyJwt(token) {
  try {
    return jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });
  } catch (err) {
    typeof(token)
    console.error('JWT Verification Failed:', err.message);
    throw err;
  }
}

app.post('/intent/verify', (req, res) => {
  const { authorization_request } = req.body;
  console.log(typeof(authorization_request))

  if (!authorization_request) {
    return res.status(400).json({ error: 'authorization_request is required' });
  }

  // authorization_request is the JWT string
  const token = authorization_request.authorization_request;
  console.log(token)

  try {
    const payload = verifyJwt(token);

    console.log(payload)

    // Check issuer for extra security
    if (payload.client_id !== VERIFIER_URL) {
      return res.status(403).json({
        verification: 'failed',
        message: 'Unauthorized verifier',
      });
    }

    console.log('✅ JWT Payload:', payload);

    // Map input descriptor IDs to claim names
    const descriptorToFieldMapping = {
      'aadhaar_credential': 'aadhaar_id',
      'name-cred': 'name',
      'gender-cred': 'gender',
      'dob-cred': 'dob',
    };

    // Extract requested descriptors IDs from the JWT payload
    const requestedDescriptors = payload.presentation_definition.input_descriptors.map(d => d.id);

    // Simulated verification data (replace with your own logic)
    const verificationResult = {
      aadhaar_id: '123412341234',
      name: 'John Doe',
      gender: 'Male',
      dob: '1990-05-15',
    };

    // Prepare only requested fields for response
    const requestedFields = requestedDescriptors.reduce((acc, descId) => {
      const field = descriptorToFieldMapping[descId];
      if (field && verificationResult[field]) {
        acc[descId] = verificationResult[field];
      }
      return acc;
    }, {});

    // Send verification success response
    return res.json({
      verification: 'success',
      metadata: {
        issuer: payload.iss,
        audience: payload.aud,
        nonce: payload.nonce,
        state: payload.state,
      },
      requestedFields,
    });

  } catch (err) {
    console.error('Verification failed:', err.message);
    return res.status(500).json({ error: 'Server error during verification' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Intent Verify Service listening on http://localhost:${PORT}`);
});
