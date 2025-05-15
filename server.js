const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const VERIFIER_URL = "https://verifier.example.com";

app.post('/intent/verify', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: "Token is required" });
    }

    try {
        // Decode the JWT token
        const decoded = jwt.decode(token, { complete: true });
        if (!decoded) {
            return res.status(400).json({ error: "Invalid token" });
        }

        const payload = decoded.payload;

        // Verify the issuer
        if (payload.iss !== VERIFIER_URL) {
            return res.status(403).json({ 
                verification: "failed", 
                message: "Unauthorized verifier" 
            });
        }

        console.log("✅ Verification Success");

        // Extract the requested fields from the presentation definition
        const requestedFields = payload.presentation_definition.input_descriptors.map(descriptor => descriptor.id);

        // Simulated metadata and field data (replace with actual data fetching logic)
        const verificationResult = {
            name: "John Doe",
            gender: "Male",
            dob: "1990-05-15"
        };

        // Return metadata and requested fields
        const response = {
            verification: "success",
            metadata: {
                issuer: payload.iss,
                audience: payload.aud,
                nonce: payload.nonce,
                state: payload.state
            },
            requestedFields: requestedFields.reduce((acc, field) => {
                if (verificationResult[field]) {
                    acc[field] = verificationResult[field];
                }
                return acc;
            }, {})
        };

        res.status(200).json(response);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Server error during verification" });
    }
});

app.get("/ping",(req,res)=>{
    res.header("Content-Type", "application/x-pem-file");
    res.send("pong")
    
})

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Intent Verify Service is running on http://localhost:${PORT}`);
});
