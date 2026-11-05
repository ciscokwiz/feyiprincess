import { profile } from "@/data/profile";
import { publicFileExists } from "@/lib/publicAssets";

/**
 * Intro video (COS 106: multimedia). Renders a real <video> with controls,
 * captions and a poster when the file exists in /public/media. Otherwise
 * shows an honest "coming soon" panel instead of a broken player.
 */
export function IntroVideo() {
  const { src, type, fallback, captions, poster, note } = profile.introVideo;
  const hasVideo = publicFileExists(src);
  const hasCaptions = publicFileExists(captions);
  const hasPoster = publicFileExists(poster.src);
  // The poster matches the video's size, so it tells us the shape: phone videos are portrait.
  const portrait = poster.height > poster.width;

  if (!hasVideo) {
    return (
      <div className="intro-video intro-video--empty" role="status">
        <span className="intro-video__play" aria-hidden="true">
          ▶
        </span>
        <p className="intro-video__empty-title">Intro video coming soon</p>
        <p>I&rsquo;m recording a short hello. Check back soon!</p>
      </div>
    );
  }

  return (
    <figure className={`intro-video${portrait ? " intro-video--portrait" : ""}`}>
      <div className="intro-video__frame">
        <video
          controls
          preload="metadata"
          playsInline
          poster={hasPoster ? poster.src : undefined}
          aria-describedby="intro-video-note"
          style={{ aspectRatio: `${poster.width} / ${poster.height}` }}
        >
          <source src={src} type={type} />
          {fallback && publicFileExists(fallback.src) ? <source src={fallback.src} type={fallback.type} /> : null}
          {hasCaptions ? <track kind="captions" src={captions} srcLang="en" label="English" default /> : null}
          <p>
            Your browser can&rsquo;t play this video. You can <a href={src}>download it</a> instead.
          </p>
        </video>
      </div>
      <figcaption id="intro-video-note" className="intro-video__note">
        {note}
      </figcaption>
    </figure>
  );
}
