import { PageContainer } from "@/components/page-container";

export default function HomePage() {
    return (
        <PageContainer>
            <p className="mb-4 text-sm text-slate-400">Developer Portfolio</p>

            <h1 className="text-4xl font-bold tracking-tight">
                Aung Ko Ko Minn
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-300">
                Software developer building maintainable frontend and full-stack
                applications.
            </p>
        </PageContainer>
    );
}