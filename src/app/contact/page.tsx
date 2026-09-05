import { PageContainer } from "@/components/page-container";

export default function ContactPage() {
    return (
        <PageContainer>
            <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
                Reach out for internships, collaboration, or anything else — email is
                the fastest way to get to me.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                    href="mailto:maungkokominn@gmail.com"
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/10"
                >
                    maungkokominn@gmail.com
                </a>
                <a
                    href="https://github.com/akkminn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/10"
                >
                    github.com/akkminn
                </a>
            </div>

            <p className="mt-8 max-w-2xl text-sm text-slate-400">
                Or ask the &ldquo;Ask about me&rdquo; chat in the corner of this
                page — it can point you to the right place for most questions.
            </p>
        </PageContainer>
    );
}
