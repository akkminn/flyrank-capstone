import { PageContainer } from "@/components/page-container";

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
        <PageContainer>
            <h1 className="text-3xl font-bold tracking-tight">System Health</h1>

            <dl className="mt-6 space-y-4">
                <div>
                    <dt className="text-sm text-slate-400">Status</dt>
                    <dd className="text-lg text-slate-300">{health.status}</dd>
                </div>

                <div>
                    <dt className="text-sm text-slate-400">Service</dt>
                    <dd className="text-lg text-slate-300">{health.service}</dd>
                </div>

                <div>
                    <dt className="text-sm text-slate-400">Checked at</dt>
                    <dd className="text-lg text-slate-300">{health.timestamp}</dd>
                </div>
            </dl>
        </PageContainer>
    );
}