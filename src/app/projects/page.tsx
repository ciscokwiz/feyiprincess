import type { Metadata } from 'next';
import { projects } from '@/lib/content';
import { ProjectEntry } from '@/components/project';
export const metadata: Metadata = { title: 'Projects' };
export default function Projects() { return <><section className="page-heading"><span className="meta">THE WORK / 03</span><h1>Built to be useful.</h1><p>Three sample concepts, ready to be replaced by real work. No invented clients or accomplishments.</p></section><ProjectEntry project={projects[0]} featured /><div className="project-gallery">{projects.slice(1).map(project => <ProjectEntry key={project.id} project={project} />)}</div></>; }
