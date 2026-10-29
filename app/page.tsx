import { CiteRun } from "@/components/CiteRun";
import { RunningHead } from "@/components/RunningHead";
import { Scorecard } from "@/components/Scorecard";
import { SearchDemo } from "@/components/SearchDemo";

const GITHUB = "https://github.com/jakob-alexander2000";

export default function Home() {
  return (
    <>
      <a className="skip" href="#opening">
        Skip to content
      </a>
      <RunningHead />
      <main className="sheet">
        <nav aria-label="Contents">
          <ol className="contents">
            <li>
              <a href="#opening">
                <span>01</span> Opening
              </a>
            </li>
            <li>
              <a href="#work">
                <span>02</span> Work
              </a>
            </li>
            <li>
              <a href="#citebot">
                <span>03</span> CiteBot
              </a>
            </li>
            <li>
              <a href="#scorecard">
                <span>04</span> Scorecard
              </a>
            </li>
            <li>
              <a href="#desk">
                <span>05</span> Desk
              </a>
            </li>
            <li>
              <a href="#index">
                <span>06</span> Index
              </a>
            </li>
          </ol>
        </nav>

        <section id="opening" className="opening" aria-labelledby="hero-heading">
          <div className="fold">
            <h1 id="hero-heading">Software that cites its sources.</h1>
            <div className="ledes">
              <p className="sentence">
                Jakob Alex is a Berlin-based software builder. He studied
                comparative literature, taught himself to build software, and
                reads every claim against its source.
                <a className="mark" href="#note-who">
                  <span className="sr-only">Note </span>1
                </a>
              </p>
              <p className="sentence">
                He builds AI software that shows its sources and checks itself.
                <a className="mark" href="#note-work">
                  <span className="sr-only">Note </span>2
                </a>
              </p>
              <p className="sentence">
                A fixed test of that check scores 18 of 18.
                <a className="mark" href="#note-proof">
                  <span className="sr-only">Note </span>3
                </a>
              </p>
            </div>
            <div className="fold-notes">
              <aside className="note note-1" id="note-who" role="note">
                <p className="note-kicker">Note</p>
                <p>
                  Comparative literature is the training. The software is
                  self-taught. People who have stayed inside one kind of work
                  stop seeing a missing source. He still sees it. Computer
                  science by distance learning, finishing early next year.
                </p>
              </aside>
              <aside className="note note-2" id="note-work" role="note">
                <p className="note-kicker">CiteBot</p>
                <p>
                  CiteBot answers from one sample handbook, splits the answer
                  into claims, and checks each claim against the passage it
                  came from.
                </p>
                <a href="https://citebot-chi.vercel.app/ask">Live</a>
              </aside>
              <aside className="note note-3" id="note-proof" role="note">
                <p className="note-kicker">citebot-evals</p>
                <p>One command, no network, no key. Score: 18 of 18.</p>
                <a href="https://github.com/jakob-alexander2000/citebot-evals#scorecard-fixture">
                  Scorecard
                </a>
              </aside>
            </div>
            <section id="work" className="selected" aria-labelledby="work-heading">
              <h2 id="work-heading" className="work-heading">
                Selected work
              </h2>
              <ol className="work-list">
                <li>
                  <span className="work-name">CiteBot</span>
                  <span className="work-idea">Claims checked against the page.</span>
                  <a className="try" href="#citebot">
                    Try it
                  </a>
                  <a className="live" href="https://citebot-chi.vercel.app/ask">
                    Live
                  </a>
                </li>
                <li>
                  <span className="work-name">citebot-evals</span>
                  <span className="work-idea">Eighteen questions, scored offline.</span>
                  <a className="try" href="#scorecard">
                    Try it
                  </a>
                  <a className="live" href="https://citebot-chi.vercel.app/evals">
                    Live
                  </a>
                </li>
                <li>
                  <span className="work-name">Desk</span>
                  <span className="work-idea">Ask a folder of notes.</span>
                  <a className="try" href="#desk">
                    Try it
                  </a>
                  <a className="live" href="https://github.com/jakob-alexander2000/desk">
                    Live
                  </a>
                </li>
                <li>
                  <span className="work-name">desk-index</span>
                  <span className="work-idea">Find the note, no model.</span>
                  <a className="try" href="#index">
                    Try it
                  </a>
                  <a className="live" href="https://github.com/jakob-alexander2000/desk-index">
                    Live
                  </a>
                </li>
                <li className="reserved" aria-label="Retrieval Autopsy, left open">
                  <span className="work-name">Retrieval Autopsy</span>
                  <span className="work-idea">Left open.</span>
                </li>
                <li className="reserved" aria-label="Style Distance, left open">
                  <span className="work-name">Style Distance</span>
                  <span className="work-idea">Left open.</span>
                </li>
              </ol>
            </section>
          </div>
        </section>

        <section id="citebot" className="chapter" aria-labelledby="citebot-title">
          <div className="row">
            <p className="kicker">
              <span className="num">03</span>CiteBot
            </p>
            <p className="run-label">Recorded run</p>
          </div>
          <div className="row">
            <div>
              <h2 id="citebot-title">
                An answer is split into claims, and each claim is checked
                against the handbook page it came from.
              </h2>
              <p className="problem">
                <span className="lab">The problem</span>
                A fluent answer can still contain a sentence the handbook never
                said. Anyone who would act on that answer has the problem.
              </p>
            </div>
          </div>
          <CiteRun />
          <div className="row">
            <div className="made">
              <span className="lab">How it was made</span>
              26 Oct 2026, 15:01 UTC, to 28 Oct 2026, 10:11 UTC. 24 commits.
              Commits on 26 Oct are authored by Jakob Alex and include the
              first version, the move to Gemini, and the claim check. From 27
              Oct the commits are co-authored with Cursor, including the loop
              that looks up the handbook at most three times, writes a draft,
              then checks it. The program is Next.js and TypeScript.
              <span className="todo">
                <span className="lab">AI built</span>
                From 27 Oct the commits are co-authored with Cursor, including
                the loop that looks up the handbook at most three times, writes
                a draft, then checks it.
                <span className="lab">Jakob decided</span>
                TODO(Jakob)
              </span>
            </div>
          </div>
        </section>

        <section id="scorecard" className="chapter" aria-labelledby="score-title">
          <div className="row">
            <p className="kicker">
              <span className="num">04</span>citebot-evals
            </p>
            <p className="run-label">Recorded run</p>
          </div>
          <div className="row">
            <div>
              <h2 id="score-title">
                Eighteen fixed handbook questions score that check, offline, in
                one command.
              </h2>
              <p className="problem">
                <span className="lab">The problem</span>
                A check you cannot run again is only a story. The person who
                keeps the checker needs these questions to pass every time.
              </p>
              <Scorecard />
              <div className="links">
                <a href="https://github.com/jakob-alexander2000/citebot-evals#scorecard-fixture">
                  Scorecard
                </a>
                <a href="https://github.com/jakob-alexander2000/citebot-evals">
                  Source
                </a>
              </div>
              <div className="made">
                <span className="lab">How it was made</span>
                26 Oct 2026, 16:24 UTC, to 27 Oct 2026, 14:06 UTC. 3 commits.
                Jakob Alex authored the eighteen-question suite and the
                scorecard. A later documentation commit is co-authored with
                Cursor.
                <span className="todo">
                  <span className="lab">AI built</span>
                  A documentation commit on 27 Oct is co-authored with Cursor.
                  <span className="lab">Jakob decided</span>
                  TODO(Jakob)
                </span>
              </div>
            </div>
            <p className="margin-note">
              The published fixture is 18 of 18. This page replays the fifteen
              cases whose questions can be printed here.
            </p>
          </div>
        </section>

        <section id="desk" className="chapter" aria-labelledby="desk-title">
          <div className="row">
            <p className="kicker">
              <span className="num">05</span>Desk
            </p>
            <p className="run-label">Live demo</p>
          </div>
          <div className="row">
            <div>
              <h2 id="desk-title">
                Ask a folder of notes and get an answer that names the files it
                used.
              </h2>
              <p className="problem">
                <span className="lab">The problem</span>
                Notes on your own computer stay invisible to a chat window.
                Anyone whose answers live in a folder of files has the problem.
              </p>
              <SearchDemo
                kind="desk"
                suggestions={["What is Desk?", "localhost UI", "strangers"]}
                lead="Live demo. This is Desk’s passage ranking, on two sample notes from the project. The program that writes the answer stays in Desk."
              />
              <div className="links">
                <a href="https://github.com/jakob-alexander2000/desk#60-second-run">
                  Run in 60 seconds
                </a>
                <a href="https://github.com/jakob-alexander2000/desk">Source</a>
              </div>
              <div className="made">
                <span className="lab">How it was made</span>
                26 Oct 2026, 21:02 UTC, to 27 Oct 2026, 14:05 UTC. 2 commits.
                Jakob Alex authored the first version: questions over a folder,
                a command line, and a page on this computer. The README sets
                aside packaged desktop apps for this version. A later
                documentation commit is co-authored with Cursor. TypeScript and
                Node. The answer step calls Gemini; the ranking on this page
                does not.
                <span className="todo">
                  <span className="lab">AI built</span>
                  A documentation commit on 27 Oct is co-authored with Cursor.
                  <span className="lab">Jakob decided</span>
                  TODO(Jakob)
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="index" className="chapter" aria-labelledby="index-title">
          <div className="row">
            <p className="kicker">
              <span className="num">06</span>desk-index
            </p>
            <p className="run-label">Live demo</p>
          </div>
          <div className="row">
            <div>
              <h2 id="index-title">
                Find the matching note from the words in it, with no language
                model and no database.
              </h2>
              <p className="problem">
                <span className="lab">The problem</span>
                Sometimes you do not want a written answer. You want the note.
                Anyone searching a folder of notes has the problem. A language
                model is the program that writes an answer. This one only finds
                the note.
              </p>
              <SearchDemo
                kind="index"
                suggestions={["Berlin", "pager", "core hours"]}
                lead="Live demo. The same ranking as the Go search server, on two sample notes from the project."
              />
              <div className="links">
                <a href="https://github.com/jakob-alexander2000/desk-index#demo">
                  Demo
                </a>
                <a href="https://github.com/jakob-alexander2000/desk-index">
                  Source
                </a>
              </div>
              <div className="made">
                <span className="lab">How it was made</span>
                26 Oct 2026, 21:14 UTC. 1 commit, authored by Jakob Alex. It
                describes an in-memory index, only the language’s own
                libraries, and no database. The message does not mention an
                assistant. Written in Go.
                <span className="todo">
                  <span className="lab">AI built</span>
                  The single commit does not name an assistant.
                  <span className="lab">Jakob decided</span>
                  TODO(Jakob)
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="colophon" className="chapter colophon" aria-labelledby="colophon-title">
          <div className="row">
            <p className="kicker">
              <span className="num">—</span>Colophon
            </p>
          </div>
          <div className="row">
            <div>
              <h2 id="colophon-title">Read the margin. That is the work.</h2>
              <p className="problem">
                He studied comparative literature and taught himself to build
                software. A claim on this page keeps its source because he
                still notices what a smooth sentence is leaning on.
              </p>
              <p className="sign">
                <a href={GITHUB}>github.com/jakob-alexander2000</a>
                <span> © 2026 Jakob Alex</span>
              </p>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
