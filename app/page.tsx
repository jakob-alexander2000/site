import { CiteRun } from "@/components/CiteRun";
import { OpeningProof } from "@/components/OpeningProof";
import { RunningHead } from "@/components/RunningHead";
import { Scorecard } from "@/components/Scorecard";
import { SearchDemo } from "@/components/SearchDemo";
import { decisionFor, type DecisionId } from "@/lib/copy";

const GITHUB = "https://github.com/jakob-alexander2000";

function Decision({ id }: { id: DecisionId }) {
  const text = decisionFor(id);
  if (!text) return null;
  return (
    <span className="decision">
      <span className="lab">Jakob decided</span>
      {text}
    </span>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip tap" href="#opening">
        Skip to content
      </a>
      <RunningHead />
      <main className="sheet">
        <nav aria-label="Contents">
          <ol className="contents">
            <li>
              <a className="tap" href="#opening">
                <span>01</span> Opening
              </a>
            </li>
            <li>
              <a className="tap" href="#work">
                <span>02</span> Work
              </a>
            </li>
            <li>
              <a className="tap" href="#citebot">
                <span>03</span> CiteBot
              </a>
            </li>
            <li>
              <a className="tap" href="#scorecard">
                <span>04</span> Scorecard
              </a>
            </li>
            <li>
              <a className="tap" href="#desk">
                <span>05</span> Desk
              </a>
            </li>
            <li>
              <a className="tap" href="#index">
                <span>06</span> Index
              </a>
            </li>
          </ol>
        </nav>

        <section id="opening" className="opening" aria-labelledby="hero-heading">
          <div className="fold">
            <h1 id="hero-heading">Software that cites its sources.</h1>
            <p className="fold-line">
              Berlin. Comparative literature, and software he taught himself.
            </p>
            <div className="ledes">
              <p className="sentence">
                Jakob Alex is a Berlin-based software builder. He studied
                comparative literature, taught himself to build software, and
                reads every claim against its source.
                <a className="mark tap" href="#note-who">
                  <span className="sr-only">Note </span>1
                </a>
              </p>
              <p className="sentence">
                Tools that answer from sources you can check: question answering
                with a visible check, a fixed test set for it, answers from a
                local folder, and Markdown search without a model.
                <a className="mark tap" href="#note-work">
                  <span className="sr-only">Note </span>2
                </a>
              </p>
              <p className="sentence">
                A fixed test set scores 18 of 18 example answers.
                <a className="mark tap" href="#note-proof">
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
                  CiteBot answers from its own sample handbook, not from files a
                  visitor brings. It splits the answer into claims and checks
                  each claim against the passage it came from.
                </p>
                <a className="tap" href="https://citebot-chi.vercel.app/ask">
                  Live
                </a>
              </aside>
              <aside className="note note-3" id="note-proof" role="note">
                <p className="note-kicker">citebot-evals</p>
                <p>One command, no network, no key. Score: 18 of 18 example answers.</p>
                <a className="tap" href="https://github.com/jakob-alexander2000/citebot-evals">
                  Source
                </a>
              </aside>
            </div>
            <OpeningProof />
            <section id="work" className="selected" aria-labelledby="work-heading">
              <h2 id="work-heading" className="work-heading">
                Selected work
              </h2>
              <ol className="work-list">
                <li>
                  <span className="work-copy">
                    <span className="work-name">CiteBot</span>
                    <span className="work-idea">Claims checked against the page.</span>
                  </span>
                  <a className="try tap" id="first-try" href="#citebot">
                    Try it
                  </a>
                  <a className="quiet tap" href="https://citebot-chi.vercel.app/ask">
                    Live
                  </a>
                </li>
                <li>
                  <span className="work-copy">
                    <span className="work-name">citebot-evals</span>
                    <span className="work-idea">A fixed test set of example answers.</span>
                  </span>
                  <a className="try tap" href="#scorecard">
                    Try it
                  </a>
                  <a className="quiet tap" href="https://github.com/jakob-alexander2000/citebot-evals">
                    Source
                  </a>
                </li>
                <li>
                  <span className="work-copy">
                    <span className="work-name">Desk</span>
                    <span className="work-idea">Ask a folder of notes.</span>
                  </span>
                  <a className="try tap" href="#desk">
                    Try it
                  </a>
                  <a className="quiet tap" href="https://github.com/jakob-alexander2000/desk">
                    Source
                  </a>
                </li>
                <li>
                  <span className="work-copy">
                    <span className="work-name">desk-index</span>
                    <span className="work-idea">Go search, no model.</span>
                  </span>
                  <a className="try tap" href="#index">
                    Try it
                  </a>
                  <a className="quiet tap" href="https://github.com/jakob-alexander2000/desk-index">
                    Source
                  </a>
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
                said. Anyone who acts on that answer books the wrong leave or
                pays the wrong amount.
              </p>
            </div>
          </div>
          <CiteRun />
          <div className="row">
            <div className="made">
              <span className="lab">How it was made</span>
              26 Oct 2026, 16:01 Berlin time, to 28 Oct 2026, 11:11 Berlin time.
              24 commits. Commits on 26 Oct are authored by Jakob Alex and
              include the first version, the move to Gemini, and the claim
              check. From 27 Oct the commits are co-authored with Cursor,
              including the part that looks up the handbook at most three
              times, writes a draft, then checks it. The program is Next.js and
              TypeScript.
              <span className="made-extra">
                <span className="lab">AI built</span>
                From 27 Oct the commits are co-authored with Cursor, including
                the part that looks up the handbook at most three times, writes
                a draft, then checks it.
                <Decision id="citebot" />
              </span>
            </div>
          </div>
        </section>

        <section id="scorecard" className="chapter" aria-labelledby="score-title">
          <div className="row">
            <p className="kicker">
              <span className="num">04</span>citebot-evals
            </p>
            <p className="run-label">Examples</p>
          </div>
          <div className="row">
            <div>
              <h2 id="score-title">
                Hand-written example answers on a fixed test set are scored in
                one command.
              </h2>
              <p className="problem">
                <span className="lab">The problem</span>
                Without fixed questions, a change to CiteBot can't be checked
                the same way twice.
              </p>
              <Scorecard />
              <div className="links">
                <a className="tap" href="https://github.com/jakob-alexander2000/citebot-evals">
                  Source
                </a>
              </div>
              <div className="made">
                <span className="lab">How it was made</span>
                26 Oct 2026, 17:24 Berlin time, to 27 Oct 2026, 15:06 Berlin
                time. 3 commits. Jakob Alex authored the eighteen-question
                set and the scorecard. A later documentation commit is
                co-authored with Cursor.
                <span className="made-extra">
                  <span className="lab">AI built</span>
                  A documentation commit on 27 Oct is co-authored with Cursor.
                  <Decision id="evals" />
                </span>
              </div>
            </div>
            <p className="margin-note">
              The full set is 18 of 18 example answers. This page replays the
              fifteen examples whose questions can be printed here.
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
                Ask a folder of notes. When a passage matches, the answer names
                that file.
              </h2>
              <p className="problem">
                <span className="lab">The problem</span>
                Notes on your own computer stay invisible to a chat window.
                Anyone whose answers live in a folder of files spends the
                search by hand, or trusts a reply that never opened the file.
              </p>
              <SearchDemo
                kind="desk"
                suggestions={["What are core hours?", "offsite", "parking"]}
                lead="Live demo. This passage ranking is Desk’s own search, from src/retrieve.ts. Desk does not use desk-index. A file is named only when a passage matches. Desk’s page answers a question. It does not write a report."
              />
              <div className="links">
                <a className="tap" href="https://github.com/jakob-alexander2000/desk">
                  Source
                </a>
              </div>
              <div className="made">
                <span className="lab">How it was made</span>
                26 Oct 2026, 22:02 Berlin time, to 27 Oct 2026, 15:05 Berlin
                time. 2 commits. Jakob Alex authored the first version:
                questions over a folder, a command line, and a page on this
                computer. The README sets aside packaged desktop apps for this
                version. A later documentation commit is co-authored with
                Cursor. TypeScript and Node. The answer step calls Gemini; the
                ranking on this page does not.
                <span className="made-extra">
                  <span className="lab">AI built</span>
                  A documentation commit on 27 Oct is co-authored with Cursor.
                  <Decision id="desk" />
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
                A small Go search service for Markdown notes that finds the
                note from the words in it, with no model.
              </h2>
              <p className="problem">
                <span className="lab">The problem</span>
                Sometimes you do not want a written answer. You want the note.
                Anyone searching a folder of notes opens the wrong file, or
                waits on a model they did not ask for. A model is the program
                that writes an answer. This one only finds the note.
              </p>
              <SearchDemo
                kind="index"
                suggestions={["What are core hours?", "expense", "parking"]}
                lead="Live demo. This is desk-index’s own search, on three sample notes about core hours, an expense policy, and a team offsite. It searches the notes without a model. It does not sit under Desk, and it does not power Desk."
              />
              <div className="links">
                <a className="tap" href="https://github.com/jakob-alexander2000/desk-index">
                  Source
                </a>
              </div>
              <div className="made">
                <span className="lab">How it was made</span>
                26 Oct 2026, 22:14 Berlin time. 1 commit, authored by Jakob
                Alex. It describes an in-memory index, only the language’s own
                libraries, and no database. The message does not mention an
                assistant. Written in Go.
                <span className="made-extra">
                  <span className="lab">AI built</span>
                  The single commit does not name an assistant.
                  <Decision id="index" />
                </span>
              </div>
            </div>
          </div>
        </section>

        <footer className="chapter close">
          <p>
            He studied comparative literature and taught himself to build
            software. A claim on this page keeps its source because he still
            notices what a smooth sentence is leaning on.
          </p>
          <p className="sign">
            <a className="tap" href={GITHUB}>
              github.com/jakob-alexander2000
            </a>
            <span> © 2026 Jakob Alex</span>
          </p>
        </footer>
      </main>
    </>
  );
}
