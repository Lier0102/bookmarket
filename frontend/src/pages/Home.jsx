import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import Button from "../components/Button";
import HeroBadge from "../components/HeroBadge";
import Loader from "../components/Loader";
import BookCard from "../components/BookCard";
import { listBooks } from "../api/books";
import { getErrorMessage } from "../utils/errors";
import "./Home.css";

export default function Home() {
  const heroMediaRef = useRef(null);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Subtle scroll parallax on the hero media, respecting prefers-reduced-motion.
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return undefined;

    let ticking = false;

    const applyParallax = () => {
      ticking = false;
      const node = heroMediaRef.current;
      if (!node) return;
      const offset = window.scrollY;
      // Keep the movement very subtle and cap it so it never drifts far.
      const translateY = Math.min(offset * 0.15, 80);
      node.style.transform = `translate3d(0, ${translateY}px, 0) scale(1.08)`;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(applyParallax);
      }
    };

    applyParallax();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchFeatured() {
      setLoading(true);
      setError("");
      try {
        const page = await listBooks({
          page: 0,
          size: 8,
          sortField: "name",
          sortDir: "desc",
        });
        if (!cancelled) setBooks(page?.content ?? []);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFeatured();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__media" ref={heroMediaRef}>
          <video
            className="hero__video"
            src="/book_video1.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="hero__scrim" />
        </div>

        <div className="hero__content container">
          <HeroBadge icon={Sparkles}>고-급진 책 더 들어옴ㅋ</HeroBadge>
          <h1 className="hero__title">
            페이지 너머의
            <br />
            이야기를 만나다
          </h1>
          <p className="hero__subtitle">Onlybooks가 될거다 이런 얘기예요</p>
          <div className="hero__actions">
            <Button
              variant="primary"
              size="lg"
              to="/books"
              icon={ArrowRight}
              iconPosition="right"
            >
              도서 둘러보기
            </Button>
            <Button variant="secondary" size="lg" to="/board">
              커뮤니티 보기
            </Button>
          </div>
        </div>
      </section>

      <section className="section featured">
        <div className="container">
          <div className="featured__header">
            <h2>이달의 추천 도서</h2>
            <p>편집팀이 엄선한, 지금 가장 주목할 만한 책들.</p>
          </div>

          {loading && <Loader label="추천 도서를 불러오는 중..." fullHeight />}

          {!loading && error && (
            <p className="featured__error">
              추천 도서를 불러오지 못했습니다. ({error})
            </p>
          )}

          {!loading && !error && books.length === 0 && (
            <p className="featured__empty">아직 등록된 도서가 없습니다.</p>
          )}

          {!loading && !error && books.length > 0 && (
            <div className="featured__grid">
              {books.map((book) => (
                <BookCard key={book.bookId} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* <section className="section statement">
        <div className="content statement__inner">
          <BookOpen className="statement__icon" size={28} strokeWidth={1.25} />
          <p className="statement__quote">
            "좋은 책을 읽는 것은 과거 몇 세기의 가장 훌륭한 사람들과 이야기를
            나누는 것과 같다."
          </p>
          <p className="statement__attribution">BookMarket 편집팀</p>
        </div>
      </section>*/}

      <section className="cta">
        <div className="container cta__inner glass">
          <div>
            <h2>Ah, 읽을 수 있을 때 읽으세요.</h2>
            <p>
              책은 당신의 연인이 아니예요. <br></br>언제든지 떠날 수 있다 그런
              얘기예요
            </p>
          </div>
          <Button
            variant="accent"
            size="lg"
            to="/books"
            icon={ArrowRight}
            iconPosition="right"
          >
            전체 도서 보기
          </Button>
        </div>
      </section>
    </div>
  );
}
