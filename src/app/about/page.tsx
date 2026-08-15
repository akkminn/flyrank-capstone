import { PageContainer } from "@/components/page-container";

export default function AboutPage() {
    return (
        <PageContainer>
            <h1 className="text-3xl font-bold tracking-tight">About</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
                About me and how I work.
            </p>
        </PageContainer>
    );
}