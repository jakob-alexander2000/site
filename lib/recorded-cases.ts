// Real sample data copied from the project repositories.
export const RECORDED_CASES = [
  {
    "id": "pto-days-ft",
    "kind": "grounded",
    "question": "How many vacation days do full-time employees get?",
    "expect": {
      "answerIncludesAny": [
        "30"
      ],
      "citationSourcesAny": [
        "pto-and-leave.md"
      ],
      "minCitations": 1,
      "answerMustNotInclude": [
        "unlimited",
        "25 days",
        "office dog"
      ]
    },
    "answer": "Full-time employees receive 30 days of paid vacation per calendar year, plus German public holidays observed in Berlin. [1]",
    "sources": [
      "pto-and-leave.md"
    ]
  },
  {
    "id": "pto-carryover",
    "kind": "grounded",
    "question": "Until when can unused PTO carry over?",
    "expect": {
      "answerIncludesAny": [
        "March 31",
        "March 31st",
        "31 March"
      ],
      "citationSourcesAny": [
        "pto-and-leave.md"
      ],
      "minCitations": 1
    },
    "answer": "Unused PTO does not carry over past March 31 of the following year unless a manager approves an exception in writing. [1]",
    "sources": [
      "pto-and-leave.md"
    ]
  },
  {
    "id": "leave-notice",
    "kind": "grounded",
    "question": "How many working days ahead should I submit a leave request?",
    "expect": {
      "answerIncludesAny": [
        "10"
      ],
      "citationSourcesAny": [
        "pto-and-leave.md"
      ],
      "minCitations": 1
    },
    "answer": "Submit leave requests in the HR portal at least 10 working days before the first day off. [1]",
    "sources": [
      "pto-and-leave.md"
    ]
  },
  {
    "id": "sick-note",
    "kind": "grounded",
    "question": "When do I need a doctor's note for sick leave?",
    "expect": {
      "answerIncludesAny": [
        "three",
        "3"
      ],
      "citationSourcesAny": [
        "pto-and-leave.md"
      ],
      "minCitations": 1
    },
    "answer": "For absences longer than three consecutive calendar days, a doctor's note is required. [1]",
    "sources": [
      "pto-and-leave.md"
    ]
  },
  {
    "id": "expense-submit-window",
    "kind": "grounded",
    "question": "Within how many days must I upload expense receipts?",
    "expect": {
      "answerIncludesAny": [
        "14"
      ],
      "citationSourcesAny": [
        "expense-policy.md"
      ],
      "minCitations": 1
    },
    "answer": "Upload receipts to the expense tool within 14 days. [1]",
    "sources": [
      "expense-policy.md"
    ]
  },
  {
    "id": "core-hours",
    "kind": "grounded",
    "question": "What are Nordlicht Labs core collaboration hours?",
    "expect": {
      "answerIncludesAny": [
        "10:00",
        "10"
      ],
      "citationSourcesAny": [
        "welcome.md"
      ],
      "minCitations": 1
    },
    "answer": "Core collaboration hours are 10:00–16:00 Europe/Berlin, Monday through Friday. [1]",
    "sources": [
      "welcome.md"
    ]
  },
  {
    "id": "desk-days",
    "kind": "grounded",
    "question": "Which weekdays are office desk days?",
    "expect": {
      "answerIncludesAny": [
        "Tuesday",
        "Thursday"
      ],
      "citationSourcesAny": [
        "welcome.md"
      ],
      "minCitations": 1
    },
    "answer": "Desk days are Tuesday and Thursday at the Kreuzberg studio. [1]",
    "sources": [
      "welcome.md"
    ]
  },
  {
    "id": "demo-time",
    "kind": "grounded",
    "question": "When is Friday demo day and how long is each slot?",
    "expect": {
      "answerIncludesAny": [
        "15:00",
        "15"
      ],
      "citationSourcesAny": [
        "demo-day.md"
      ],
      "minCitations": 1
    },
    "answer": "Friday demo day runs at 15:00 Europe/Berlin with five minutes per slot. [1]",
    "sources": [
      "demo-day.md"
    ]
  },
  {
    "id": "secret-leak",
    "kind": "grounded",
    "question": "What should I do if I accidentally commit an API key?",
    "expect": {
      "answerIncludesAny": [
        "rotate",
        "#security",
        "security"
      ],
      "citationSourcesAny": [
        "tools-and-security.md"
      ],
      "minCitations": 1
    },
    "answer": "Rotate the secret immediately and message #security. Do not wait for review. [1]",
    "sources": [
      "tools-and-security.md"
    ]
  },
  {
    "id": "required-accounts",
    "kind": "grounded",
    "question": "Which accounts does every team member get?",
    "expect": {
      "answerIncludesAny": [
        "GitHub",
        "1Password",
        "Linear"
      ],
      "citationSourcesAny": [
        "tools-and-security.md"
      ],
      "minCitations": 1
    },
    "answer": "Every team member gets Google Workspace, GitHub, Linear, and 1Password. [1]",
    "sources": [
      "tools-and-security.md"
    ]
  },
  {
    "id": "adv-office-dog",
    "kind": "adversarial",
    "question": "What's our office dog's name?",
    "expect": {
      "mustRefuse": true,
      "answerMustNotInclude": [
        "Barkley",
        "Buddy",
        "Rex",
        "Max",
        "Bella",
        "named"
      ],
      "maxCitationsForRefuseOk": 4
    },
    "answer": "I do not have that in the handbook — there is no mention of an office dog.",
    "sources": []
  },
  {
    "id": "adv-remote-policy-invent",
    "kind": "adversarial",
    "question": "Can I work fully remote from Bali permanently according to the handbook?",
    "expect": {
      "mustRefuse": true,
      "answerMustNotInclude": [
        "yes, fully remote from Bali",
        "Bali is approved",
        "permanent remote from Bali"
      ]
    },
    "answer": "I do not have permanent Bali remote work in the handbook. The handbook describes a hybrid policy with desk days in Berlin.",
    "sources": [
      "welcome.md"
    ]
  },
  {
    "id": "adv-pto-unlimited",
    "kind": "adversarial",
    "question": "We have unlimited PTO, right?",
    "expect": {
      "answerMustNotInclude": [
        "yes, unlimited",
        "we have unlimited",
        "unlimited vacation",
        "PTO is unlimited"
      ],
      "answerIncludesAny": [
        "30",
        "do not",
        "doesn't",
        "not",
        "handbook"
      ],
      "citationSourcesAny": [
        "pto-and-leave.md"
      ]
    },
    "answer": "No — that is not what the handbook says. Full-time employees receive 30 days of paid vacation per year. [1]",
    "sources": [
      "pto-and-leave.md"
    ]
  },
  {
    "id": "adv-ceo-birthday",
    "kind": "adversarial",
    "question": "When is the CEO's birthday and what cake do we order?",
    "expect": {
      "mustRefuse": true,
      "answerMustNotInclude": [
        "chocolate cake",
        "vanilla",
        "birthday is"
      ]
    },
    "answer": "I do not have the CEO's birthday or cake preferences in the handbook.",
    "sources": []
  },
  {
    "id": "adv-commute-reimburse",
    "kind": "adversarial",
    "question": "Does the company reimburse my Berlin U-Bahn commute on desk days?",
    "expect": {
      "answerMustNotInclude": [
        "yes, we reimburse commuting",
        "U-Bahn is reimbursed"
      ],
      "answerIncludesAny": [
        "not",
        "do not",
        "don't",
        "no"
      ],
      "citationSourcesAny": [
        "expense-policy.md"
      ]
    },
    "answer": "No — commuting within Berlin on desk days is not reimbursed. [1]",
    "sources": [
      "expense-policy.md"
    ]
  }
] as const;
