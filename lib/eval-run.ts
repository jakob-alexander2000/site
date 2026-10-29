import fixtureFile from "../data/citebot-evals/sample-run.json";
import casesFile from "../data/citebot-evals/handbook.json";
import { casePassed, scoreCase, type EvalCase, type ModelResponse } from "./eval-score";

type FixtureFile = {
  responses: Record<string, ModelResponse>;
};

type CasesFile = {
  cases: EvalCase[];
};

/**
 * Runs the citebot-evals scorer on the committed fixture.
 * Returns one boolean per case, in suite order. The case text stays here
 * and is not rendered.
 */
export function scoreSavedFixture(): boolean[] {
  const cases = (casesFile as CasesFile).cases;
  const responses = (fixtureFile as FixtureFile).responses;
  return cases.map((evalCase) => {
    const response = responses[evalCase.id];
    if (!response) return false;
    return casePassed(scoreCase(evalCase, response));
  });
}
