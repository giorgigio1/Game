const crypto = require('crypto');
const readline = require('readline');

function generateKey() {
  return crypto.randomBytes(32).toString('hex');
}

function generateHMAC(key, message) {
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(message);
  return hmac.digest('hex');
}

function determineRules(moves) {
  const totalMoves = moves.length;
  return moves.map((_, i) => moves.slice(i + 1).concat(moves.slice(0, i)));
}

function getWinner(playerMove, computerMove, moves, rules) {
  if (playerMove === computerMove) return 'Draw';
  const playerIndex = moves.indexOf(playerMove);
  if (rules[playerIndex].includes(computerMove)) return 'You win!';
  return 'Computer wins';
}

function printHelpTable(moves, rules) {
  console.log(`Results are from the User's point of view.`);
  const headerRow = ['v PC\\User >', ...moves];
  const table = [headerRow, ...moves.map((move, i) => [`${move}`, ...rules[i].map(r => (r === 0 ? 'Draw' : r === 1 ? 'Win' : 'Lose'))])];
  table.forEach(row => console.log(row.join(' | ')));
}

function playGame(moves) {
  const totalMoves = moves.length;
  const key = generateKey();
  const computerMove = moves[Math.floor(Math.random() * totalMoves)];
  const rules = determineRules(moves);

  console.log(`HMAC: ${generateHMAC(key, computerMove)}`);
  console.log('Available moves:');
  moves.forEach((move, i) => console.log(`${i + 1} - ${move}`));
  console.log('0 - exit');
  console.log('? - help');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Enter your move: ', choice => {
    if (choice === '0') {
      console.log(`Computer move: ${computerMove}\nExiting the game.`);
    } else if (choice === '?') {
      printHelpTable(moves, rules);
    } else {
      const choiceIndex = parseInt(choice);
      if (!isNaN(choiceIndex) && choiceIndex >= 1 && choiceIndex <= totalMoves) {
        const playerMove = moves[choiceIndex - 1];
        console.log(`Your move: ${playerMove}\nComputer move: ${computerMove}\n${getWinner(playerMove, computerMove, moves, rules)}\nHMAC key: ${key}`);
      } else {
        console.log('Invalid input. Please enter a valid move or ? for help.');
      }
    }
    rl.close();
  });
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 3 || args.length % 2 === 0 || new Set(args).size !== args.length) {
    console.log('Error: Please provide an odd number of unique moves (>=3) as command line arguments.');
    console.log('Example: node game.js rock paper scissors lizard Spock');
    return;
  }

  playGame(args);
}

main();
