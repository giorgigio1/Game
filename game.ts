const crypto = require("crypto");
const readline = require("readline");
const { printTable } = require("console-table-printer");

const choices = process.argv.slice(2) as string[];

if (
  choices.length < 3 ||
  choices.length % 2 === 0 ||
  new Set(choices).size !== choices.length
) {
  console.log(
    "Error: Please provide an odd number of unique moves (>=3) as command line arguments."
  );
  console.log("Example: node game.js rock paper scissors lizard Spock");
  process.exit(1);
}

const numChoices = choices.length;
const rules = {};
choices.forEach((choice, index) => {
  rules[choice] = index;
});

const outcomes = new Array(numChoices)
  .fill(null)
  .map(() => new Array(numChoices).fill(""));

for (let i = 0; i < numChoices; i++) {
  for (let j = 0; j < numChoices; j++) {
    if (i === j) {
      outcomes[i][j] = "Draw";
      continue;
    }
    const options = [...choices.slice(i + 1), ...choices.slice(0, i)];
    const optionIndex = options.indexOf(choices[j]);
    if (optionIndex < (numChoices - 1) / 2) {
      outcomes[i][j] = "Win";
      outcomes[j][i] = "Lose";
    }
  }
}

function playRound(choice1: string, choice2: string) {
  return outcomes[rules[choice1]][rules[choice2]];
}

function generateKey() {
  return crypto.randomBytes(32).toString("hex");
}

function generateHMAC(key, message) {
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(message);
  return hmac.digest("hex");
}

function printHelpTable(moves, rules) {
  console.log(`Results are from the User's point of view.`);
  const table = [];

  for (const choice1 of choices) {
    const rounds = choices.reduce((acc, choice) => {
      acc[choice] = playRound(choice1, choice);
      return acc;
    }, {});
    table.push({ "v PC\\User >": choice1, ...rounds });
  }

  printTable(table);
}

function playGame() {
  const key = generateKey();
  const computerMove = choices[Math.floor(Math.random() * numChoices)];

  console.log(`HMAC: ${generateHMAC(key, computerMove)}`);
  console.log("Available moves:");
  choices.forEach((move, i) => console.log(`${i + 1} - ${move}`));
  console.log("0 - exit");
  console.log("? - help");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter your move: ", (choice) => {
    if (choice === "0") {
      console.log(`Computer move: ${computerMove}\nExiting the game.`);
    } else if (choice === "?") {
      printHelpTable(choices, rules);
    } else {
      const choiceIndex = parseInt(choice);
      if (
        !isNaN(choiceIndex) &&
        choiceIndex >= 1 &&
        choiceIndex <= numChoices
      ) {
        const playerMove = choices[choiceIndex - 1];
        console.log(
          `Your move: ${playerMove}\nComputer move: ${computerMove}\n${playRound(
            computerMove,
            playerMove
          )}\nHMAC key: ${key}`
        );
      } else {
        console.log("Invalid input. Please enter a valid move or ? for help.");
      }
    }
    rl.close();
  });
}

playGame();
