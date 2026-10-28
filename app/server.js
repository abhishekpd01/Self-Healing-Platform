import express from 'express';
import client from 'prom-client';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//Collect default Node.js metrics
const register = new client.Registry();

client.collectDefaultMetrics({
    register
});

// custom application metrics
const httpRequestTotal = new client.Counter({
    name: "http_request_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"],
    registers: [register]
});

const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route"],
    buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
    registers: [register]
})

// Middleware for metrics
app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer();
    res.on("finish", () => {
        const route = req.route?.path || req.path;

        httpRequestTotal.inc({
            method: req.method,
            route,
            status: res.statusCode
        })

        end({
            method: req.method,
            route
        });
    });

    next();
});

// Health endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: "Healthy"
    })
})

// Employee API
app.get('/api/employees', (req, res) => {
    res.json([
        {
            id: 1,
            name: 'Abhishek',
            department: 'Engineering'
        },
        {
            id: 1,
            name: 'Ram',
            department: 'Operations'
        }
    ]);
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
})

app.get('/', (req, res) => {
    res.json({
        message: 'This msg is from the server!'
    })
})

app.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));