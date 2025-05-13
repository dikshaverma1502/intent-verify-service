const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Mock Authorization Endpoint
app.get('/authorize', (req, res) => {
    const tokenPayload = {
        client_id: "https://openid4vp-mock.vercel.app",
        response_type: "vp_token",
        scope: "openid vp_token",
        redirect_uri: "walletapp://callback",
        nonce: "n-0S6_WzA2Mj",
        state: "af0ifjsldkj",
        presentation_definition: {
            id: "cred-req-1",
            input_descriptors: [
                {
                    id: "aadhaar_credential",
                    name: "Aadhaar Credential",
                    purpose: "To verify your identity using Aadhaar",
                    constraints: {
                        fields: [
                            {
                                path: ["$.credentialSubject.id"],
                                filter: {
                                    type: "string",
                                    pattern: "^[0-9]{12}$"
                                }
                            }
                        ]
                    }
                }
            ]
        }
    };

    // Generate JWT (You can remove this if you want a plain payload instead)
    const token = JSON.stringify(tokenPayload);
    res.json({ token });
});

// Mock Token Verification Endpoint (NO JWT Validation)
app.post('/verify', (req, res) => {
    const { vp_token } = req.body;

    try {
        // Just parse the payload as JSON and return it
        const decoded = JSON.parse(vp_token);

        res.status(200).json({
            message: "Token accepted (without validation)!",
            decoded
        });
    } catch (err) {
        res.status(400).json({ message: "Failed to parse the token." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
