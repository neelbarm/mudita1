import styles from "./hero.module.css";

/**
 * Schedule hero, per the approved spec: the schedule IS the hero,
 * today is lit, the accent appears only as punctuation. Tokens only;
 * CSS-driven motion with a reduced-motion rendering.
 */

const WEEK = [
  { day: "Mon", date: 13, classes: [{ t: "7:00", n: "Sunrise Flow", i: "Maya", left: 2 }, { t: "18:00", n: "Reformer II", i: "Jules", left: 4 }] },
  { day: "Tue", date: 14, classes: [{ t: "9:00", n: "Foundations", i: "Priya", left: 6 }, { t: "17:30", n: "Sculpt", i: "Maya", left: 1 }] },
  { day: "Wed", date: 15, today: true, classes: [{ t: "7:00", n: "Sunrise Flow", i: "Maya", left: 3 }, { t: "12:15", n: "Lunch Express", i: "Sam", left: 5 }, { t: "18:00", n: "Reformer II", i: "Jules", left: 0 }] },
  { day: "Thu", date: 16, classes: [{ t: "9:00", n: "Foundations", i: "Priya", left: 7 }, { t: "18:30", n: "Deep Stretch", i: "Sam", left: 4 }] },
  { day: "Fri", date: 17, classes: [{ t: "7:00", n: "Sunrise Flow", i: "Maya", left: 5 }, { t: "17:00", n: "Reformer I", i: "Jules", left: 2 }] },
  { day: "Sat", date: 18, classes: [{ t: "9:00", n: "Weekend Reset", i: "Maya", left: 8 }, { t: "11:00", n: "Sculpt", i: "Priya", left: 3 }] },
  { day: "Sun", date: 19, classes: [{ t: "10:00", n: "Slow Sunday", i: "Sam", left: 6 }] },
];

export default function Home() {
  return (
    <section className={styles.hero} aria-label="This week's schedule at Harbor Pilates">
      <header className="container-page">
        <p className={styles.label}>Harbor Pilates · Austin</p>
        <h1 className={`display ${styles.title}`}>
          <span className={styles.mask}><span className={styles.line}>This week</span></span>
          <span className={styles.mask}><span className={styles.line} style={{ animationDelay: "0.12s" }}>at the studio.</span></span>
        </h1>
        <p className={styles.standfirst}>
          Book in ten seconds. The waitlist takes care of itself.
        </p>
      </header>

      <div className={styles.stripWrap}>
        <ol className={styles.strip}>
          {WEEK.map((d, di) => (
            <li
              key={d.day}
              className={`${styles.dayCol} ${d.today ? styles.today : ""}`}
              style={{ animationDelay: `${0.2 + di * 0.06}s` }}
              aria-current={d.today ? "date" : undefined}
            >
              <div className={styles.dayHead}>
                <span className={styles.dayName}>{d.day}</span>
                <span className={`display ${styles.dayDate}`}>{d.date}</span>
                {d.today ? <span className={styles.todayRule} aria-hidden="true" /> : null}
              </div>
              <ul className={styles.classList}>
                {d.classes.map((c) => (
                  <li key={c.t} className={styles.card}>
                    <div className={styles.cardTop}>
                      <span className={styles.time}>{c.t}</span>
                      <span className={styles.spots}>
                        {c.left === 0 ? "waitlist" : `${c.left} left`}
                      </span>
                    </div>
                    <p className={styles.className}>{c.n}</p>
                    <p className={styles.instructor}>with {c.i}</p>
                    {d.today && c.left > 0 && c.t === "18:00" ? (
                      <a href="#book" className={styles.book}>Book</a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
