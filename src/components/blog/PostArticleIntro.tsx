import { Link } from '@tanstack/react-router'
import { formatPostDate, shouldShowUpdated } from '@/lib/post-dates'
import './article.css'

type PostDate = Date | string | number

// Title, standfirst, facts strip and cover of the public article. The Studio
// preview renders the same component, so both show what readers get.
export function PostArticleIntro({
  title,
  excerpt,
  publishedAt,
  updatedAt,
  readingTime,
  viewCount,
  tags,
  coverImage,
}: {
  title: string
  excerpt: string | null
  publishedAt: PostDate | null
  updatedAt: PostDate
  readingTime: number
  viewCount: number | null
  tags: { name: string; slug: string }[]
  coverImage: string | null
}) {
  return (
    <>
      <header className="post-article__head">
        <h1>{title}</h1>
        {excerpt && <p className="post-article__stand">{excerpt}</p>}
      </header>

      <div className="post-article__facts">
        <dl>
          {publishedAt && (
            <div>
              <dt>Published</dt>
              <dd>
                <time dateTime={new Date(publishedAt).toISOString()}>
                  {formatPostDate(publishedAt)}
                </time>
              </dd>
            </div>
          )}
          {shouldShowUpdated(publishedAt, updatedAt) && (
            <div>
              <dt>Updated</dt>
              <dd>
                <time dateTime={new Date(updatedAt).toISOString()}>
                  {formatPostDate(updatedAt)}
                </time>
              </dd>
            </div>
          )}
          <div>
            <dt>Reading</dt>
            <dd>{readingTime} min</dd>
          </div>
          {viewCount !== null && (
            <div>
              <dt>Views</dt>
              <dd className="tabular-nums">{viewCount.toLocaleString()}</dd>
            </div>
          )}
        </dl>
        {tags.length > 0 && (
          <ul className="post-article__tags" aria-label="Tags">
            {tags.map((tag) => (
              <li key={tag.slug}>
                <Link to="/blog/tag/$tag" params={{ tag: tag.slug }}>
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {coverImage && (
        <img
          src={coverImage}
          alt=""
          width={1200}
          height={630}
          loading="eager"
          fetchPriority="high"
          className="post-article__cover"
        />
      )}
    </>
  )
}
