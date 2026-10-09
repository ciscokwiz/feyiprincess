export interface Profile { name: string; introduction: string; direction: string; education: string; interests: string[]; skills: string[]; portrait: string | null; audio: string | null }
export interface Project { id: string; title: string; description: string; stack: string[]; image: string | null; live: string | null; source: string | null }
export interface PlannerTask { id: string; title: string; completed: boolean }
export interface ContactFormValues { name: string; email: string; phone: string; message: string }
export interface ScheduleItem { focus: string; outcome: string; status: string }
export const profile: Profile = {
 name: 'Uchechukwu Precious Onuoma', introduction: 'A portfolio of work, ideas, and the small steps that move them forward.',
 direction: 'Add your career direction here — the problems you want to work on and the teams you want to join.',
 education: 'Add your course, institution, and graduation year.',
 interests: ['Add an interest you return to', 'Add something you are currently exploring'],
 skills: ['TypeScript', 'React', 'Accessible interfaces', 'CSS & responsive design'], portrait: null, audio: null,
};
export const projects: Project[] = [
 { id: '01', title: 'A day, in order', description: 'Sample concept: a focused task planner that keeps the next action visible. Try the working planner included in this portfolio.', stack: ['TypeScript', 'React', 'localStorage'], image: null, live: '/planner', source: null },
 { id: '02', title: 'The reading shelf', description: 'Sample concept: a searchable reading collection with notes and reading status. Replace this entry with your own work.', stack: ['Next.js', 'Content modeling', 'CSS Grid'], image: null, live: null, source: null },
 { id: '03', title: 'Campus field guide', description: 'Sample concept: a clear directory of student resources, organized around everyday questions. Replace this entry with your own work.', stack: ['React', 'TypeScript', 'Accessibility'], image: null, live: null, source: null },
];
export const schedule: ScheduleItem[] = [
 { focus: 'Foundations', outcome: 'Review semantic HTML and accessible forms', status: 'Suggested' },
 { focus: 'Build', outcome: 'Replace a sample with a real project', status: 'Suggested' },
 { focus: 'Reflect', outcome: 'Write a short project case study', status: 'Suggested' },
];
