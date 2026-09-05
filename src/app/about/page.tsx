import { PageContainer } from "@/components/page-container";

export default function AboutPage() {
    return (
        <PageContainer>
            <h1 className="text-3xl font-bold tracking-tight">About</h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-300">
                I'm a software developer based in Bangkok, studying B.Sc. Information
                and Communication Technology at Rangsit University (CGPA 3.98/4.00).
                I'm currently a Front-end AI Engineering Intern at FlyRank, building
                AI-integrated web interfaces — this site is that internship's
                capstone, built end to end with AI-assisted development workflows.
            </p>

            <div className="mt-10 space-y-6">
                <section>
                    <h2 className="text-lg font-semibold text-white">How I work</h2>
                    <p className="mt-2 max-w-2xl text-slate-300">
                        Most of my time goes into a production system for a Myanmar
                        Buddhist meditation organization — a Vue 3 + Spring Boot
                        internal management platform I've contributed over 800 commits
                        to since February 2025, across both the frontend and backend.
                        Alongside that, I build smaller AI-powered tools on my own:
                        a study platform that turns notes into quizzes, and a daily
                        restaurant-menu bot for students near campus.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-white">
                        Research &amp; leadership
                    </h2>
                    <p className="mt-2 max-w-2xl text-slate-300">
                        I co-authored a research paper on how generative-AI tools
                        relate to real job-search outcomes for ICT students — the
                        headline finding was that it's not how often people use AI
                        that predicts outcomes, but what they use it for. I also led
                        a 19-person committee organizing a 64-attendee AI symposium at
                        Rangsit University, and previously spent 34 weeks volunteering
                        as a mathematics teacher.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-white">Beyond code</h2>
                    <p className="mt-2 max-w-2xl text-slate-300">
                        Burmese is my native language, I'm fluent in English, and I'm
                        currently learning Mandarin. Outside of work, I enjoy chess,
                        UI/UX design, and teaching technical material to people who
                        aren't specialists in it.
                    </p>
                </section>
            </div>
        </PageContainer>
    );
}
