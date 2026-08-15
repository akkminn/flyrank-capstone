type HealthResponse = {
    status: string;
    service: string;
    timestamp: string;
};

async function getHealth(): Promise<HealthResponse> {
    return {
        status: "healthy",
        service: "portfolio",
        timestamp: new Date().toISOString(),
    };
}

export default async function HealthPage() {
    const health = await getHealth();

    return (
        <main>
            <h1>System Health</h1>

            <dl>
                <dt>Status</dt>
                <dd>{health.status}</dd>

                <dt>Service</dt>
                <dd>{health.service}</dd>

                <dt>Checked at</dt>
                <dd>{health.timestamp}</dd>
            </dl>
        </main>
    );
}