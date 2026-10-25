import { profile } from "@/data/profile";
import { publicFileExists } from "@/lib/publicAssets";

/**
 * Intro video (COS 106: multimedia). Renders a real <video> with controls,
 * captions and a poster when the file exists in /public/media. Otherwise
 * shows an honest "coming soon" panel instead of a broken player.
 */
export function IntroVideo() {
  const { src, type, captions, poster, note } = profile.introVideo;
  const hasVideo = publicFileExists(src);
  const hasCaptions = publicFileExists(captions);
  const hasPoster = publicFileExists(poster.src);

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
    <figure className="intro-video">
      <div className="intro-video__frame">
        <video controls preload="metadata" playsInline poster={hasPoster ? poster.src : undefined} aria-describedby="intro-video-note">
          <source src={src} type={type} />
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
