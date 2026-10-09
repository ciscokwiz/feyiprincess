'use client';
import { useState } from 'react';
import Image from 'next/image';
export function Media({ src, label, portrait = false }: { src: string | null; label: string; portrait?: boolean }) {
 const [failed, setFailed] = useState(false);
 return <div className={portrait ? 'media portrait' : 'media'}>{src && !failed ? <Image src={src} alt={label} onError={() => setFailed(true)} fill sizes={portrait ? '(max-width: 768px) 100vw, 40vw' : '(max-width: 768px) 100vw, 60vw'} style={{ objectFit: 'cover' }} /> : <div className="asset-placeholder"><span className="cross">+</span><p>{label}</p><span className="meta">ASSET TO BE ADDED</span></div>}</div>;
}
