const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 2375; // Default Docker API port

app.use(express.json());

// Example endpoint to handle Docker container creation
app.post('/docker/containers/create', async (req, res) => {
    try {
        const { Image, Cmd, Env, ExposedPorts, HostConfig } = req.body;

        const response = await axios.post('http://localhost/containers/create', {
            Image,
            Cmd,
            Env,
            ExposedPorts,
            HostConfig
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            baseURL: 'http://docker/containers',
        });

        res.status(201).json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create container', error: error.message });
    }
});

// Example endpoint to get container state
app.get('/docker/containers/:id/json', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`http://localhost/containers/${id}/json`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch container state', error: error.message });
    }
});

// Start the Docker API server
app.listen(PORT, () => {
    console.log(`Docker API daemon running on http://localhost:${PORT}`);
});
