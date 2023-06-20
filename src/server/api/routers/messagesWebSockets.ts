import { z } from "zod";
import BigNumber from "bignumber.js";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { EventEmitter } from "events";
import { observable } from "@trpc/server/observable";
const ee = new EventEmitter();

interface ChatMessage {
  user: string;
  message: string;
  id: number;
}
const startGameMessage =
  "Please input the number of time in seconds between emitting numbers and their frequency";

const messages: ChatMessage[] = [
  { user: "system", message: startGameMessage, id: 1 },
];

let count = 0;

/** Game */
enum GameStage {
  First, // Ask for time
  Second, // Start timer and ask for first number
  Three, // Process commands and inputs
  Four, // Exit game on next key
}
type GameState = {
  [key: string]: number;
};

function isPerfectSquare(n: BigNumber): boolean {
  const sqrt = n.squareRoot();
  const roundedSqrt = sqrt.integerValue();
  return roundedSqrt.multipliedBy(roundedSqrt).isEqualTo(n);
}

function isFibonacciNumber(number: string): boolean {
  const bigNumber = new BigNumber(number);

  // Check if the number is a Fibonacci number
  // A number is a Fibonacci number if and only if
  // (5 * number^2 + 4) or (5 * number^2 - 4) is a perfect square
  const candidate1 = bigNumber.multipliedBy(bigNumber).multipliedBy(5).plus(4);
  const candidate2 = bigNumber.multipliedBy(bigNumber).multipliedBy(5).minus(4);

  return isPerfectSquare(candidate1) || isPerfectSquare(candidate2);
}

const thousanthFibNumber =
  "43466557686937456435688527675040625802564660517371780402481729089536555417949051890403879840079255169295922593080322634775209689623239873322471161642996440906533187938298969649928516003704476137795166849228875";

function isPartOfFirst1000Fibs(num: BigNumber) {
  return num.comparedTo(BigNumber(thousanthFibNumber)) <= 0;
}

let gameStage = GameStage.Second;
let gameState: GameState | null = null;
let timerRef: ReturnType<typeof setInterval> | null = null;
let leftOverTimerRef: ReturnType<typeof setInterval> | null = null;
let gameStatFrequencyInSecs = 0;
let timerStartTime = 0;
let timeLeftOver: undefined | number = 0;
let fibKeys: { [key: string]: boolean } = {};

function addOutput(message: string) {
  console.log(message);
  ee.emit("addMessage", { user: "system", message, id: Date.now() });
  messages.push({ user: "system", message, id: Date.now() });
}

function clearTimers() {
  timerRef && clearInterval(timerRef);
  leftOverTimerRef && clearInterval(leftOverTimerRef);
  timerRef = null;
  leftOverTimerRef = null;
}

function clearState() {
  gameState = null;
  clearTimers();
  gameStatFrequencyInSecs = 0;
  timerStartTime = 0;
  timeLeftOver = 0;
}

function outputGameStats() {
  const game = gameState
    ? Object.entries(gameState)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k}:${v}`)
        .join(", ")
    : "";
  game && addOutput(game);
}

function startTimerForGame(timer: number) {
  timerStartTime = Date.now();
  timerRef = setInterval(() => {
    timerStartTime = Date.now();
    outputGameStats();

    console.log(count);
    count++;
    // don't let it run forever
    if (count > 15) {
      clearTimers();
      addOutput("Timer limit reached, please refresh");
    }
  }, timer * 1000);
}

const addInput = (input: string): void => {
  const inputAsNumber = parseInt(input);
  if (gameStage === GameStage.Second) {
    if (isNaN(inputAsNumber)) {
      return addOutput(startGameMessage);
    }
    if (inputAsNumber > 21 || inputAsNumber < 1) {
      return addOutput(
        "Please enter a time in seconds less than 20 and greater than 0."
      );
    }
    startTimerForGame(inputAsNumber);
    gameStatFrequencyInSecs = inputAsNumber;
    gameStage = GameStage.Three;
    return addOutput("Please enter the first number");
  }
  if (gameStage === GameStage.Four) {
    clearState();
    gameStage = GameStage.First;
    return;
  }
  // gameStage three
  if (isNaN(inputAsNumber)) {
    const timerStarted = !!(timerRef || leftOverTimerRef);
    if (timerStarted && input.toLowerCase() === "halt") {
      clearTimers();
      const timeLeft = timeLeftOver
        ? timeLeftOver - (Date.now() - timerStartTime)
        : gameStatFrequencyInSecs * 1000 - (Date.now() - timerStartTime);
      timeLeftOver = timeLeft;
      return addOutput("timer halted");
    }

    if (!timerStarted && input.toLowerCase() === "resume") {
      timerStartTime = Date.now();
      leftOverTimerRef = setTimeout(() => {
        outputGameStats();
        startTimerForGame(gameStatFrequencyInSecs);
        timeLeftOver = undefined;
      }, timeLeftOver);
      return addOutput("timer resumed");
    }

    if (input.toLowerCase() === "quit") {
      clearState();
      outputGameStats();
      gameStage = GameStage.Four;
      return addOutput("Thanks for playing, press any key to exit");
    }

    return addOutput(
      `Sorry, that is not a valid input, please enter ${
        timerStarted ? "halt" : "resume"
      }, quit or a number`
    );
  }
  if (inputAsNumber < 0) {
    return addOutput("Please enter a number greater than or equal to 0");
  }

  if (!/^\d+$/.test(input)) {
    return addOutput("Please enter a valid number");
  }

  let inputAsBigNumber: BigNumber;
  try {
    inputAsBigNumber = BigNumber(input);
  } catch (error) {
    return addOutput("Please enter a valid integer");
  }
  if (!isPartOfFirst1000Fibs(inputAsBigNumber)) {
    addOutput(
      "That number is greater than the 1000th fibonacci number we will not perform the check but we will add it to the count"
    );
  }

  gameState = {
    ...gameState,
    [input]: 1 + (gameState?.[input] ?? 0),
  };
  const cachedFibKey = fibKeys[input];
  const isFib = cachedFibKey
    ? cachedFibKey
    : isPartOfFirst1000Fibs(inputAsBigNumber) && isFibonacciNumber(input);
  if (!cachedFibKey) {
    fibKeys = { ...fibKeys, [input]: isFib };
  }
  if (isFib) {
    addOutput("FIB");
  }
  addOutput("Please enter the next number");
};

export const messageRouter = createTRPCRouter({
  onAddMessage: protectedProcedure.subscription(() => {
    return observable<ChatMessage>((emit) => {
      const onAdd = (data: ChatMessage) => {
        // emit data to client
        emit.next(data);
      };
      // trigger `onAdd()` when `add` is triggered in our event emitter
      ee.on("addMessage", onAdd);
      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        ee.off("addMessage", onAdd);
      };
    });
  }),
  addMessage: protectedProcedure
    .input(
      z.object({
        user: z.string(),
        message: z.string(),
        id: z.number(),
      })
    )
    .mutation(({ input }) => {
      messages.push(input);
      // messages.push({
      //   user: "system",
      //   message: `Please enter a number ${count}`,
      //   id: count,
      // });
      ee.emit("addMessage", input);
      count++;
      return input;
    }),

  getMessages: protectedProcedure
    .input(z.number().default(10))
    .query(({ input }) => {
      return input > 0 ? messages.slice(-input) : messages;
    }),
});
