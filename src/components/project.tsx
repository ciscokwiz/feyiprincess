import { Arrow } from '@/components/arrow';
import Link from 'next/link';
import type { Project } from '@/lib/content';
import { Media } from './media';
export function ProjectEntry({ project, featured = false }: { project: Project; featured?: boolean }) {
 return <article className={featured ? 'project featured' : 'project'}><Media src={project.image} label={`${project.title} — screenshot placeholder`} /><div className="project-copy"><div className="meta">PROJECT {project.id} / SAMPLE CONCEPT</div><h2>{project.title}</h2><p>{project.description}</p><ul className="stack">{project.stack.map(s => <li key={s}>{s}</li>)}</ul><div className="project-links">{project.live ? <Link className="text-link" href={project.live}>Try the demo <Arrow /></Link> : <span className="muted">Live demo unavailable</span>}{project.source ? <a href={project.source}>View source <Arrow /></a> : <span className="muted">Source unavailable</span>}</div></div></article>;
}
