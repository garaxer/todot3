## A fibonacci sequence game

## Dev Usage
Run with `npm run dev`
head to localhost:3000 and follow the prompts

## testing

Test using `npm run test`

## Code task notes
1. You have a new requirement to implement for your application: its logic should stay exactly the same but it will need to have a different user interface (e.g. if you wrote a web app, a different UI may be a REPL).
Please describe how you would go about implementing this new UI in your application?
Would you need to restructure your solution in any way?
In the webapp I am reliant on useState and useRef hooks to keep track of various elements of the application each render.
I would need to restrucutre the application and put the logic in a backend api, that can be used by any ui, giving the api the users inputs and displaying the return messages instead of the front end handling the logic. Instead of storing the state in the frontend the backend would use a session or similar in-memory store to keep track of the state in the backend, if we wanted the game state to be persistant we can use a database.
In the webapp, I would block user input while waiting for the response, use fetching indicators and I would use websockets to display the current game state, based on the timer.
I would have mock the api response for unit testing. 
In the new UI, much like the webapp I would give the inputs to the api and display the returned result.


2. You now need to make your application "production ready", and deploy it so that it can be used by customers.
Please describe the steps you'd need to take for this to happen.
Add more robust test cases, perhaps test the hook.
Add testing to the CI
Add a stage phase to review before going live.
Add a domain.
Add new features such as, saving game state into a database retieved with an account or localstorage.


3. What did you think about this coding test - is there anything you'd suggest in order to improve it?
Straight forward enough, based on question one it was hard to interpret if you wanted a full stack application to begin with or talk about how I would make one by answering question one.

#Result: Failed
The team loved it was a deployed and functional application!
Typescript and tailwind usage was good
Some seperation of logic using useFib hook
What left short:
Lack of depth around the written questions
The code as implemented didn’t allow for ease of porting or extensibility
Testing did not run out of the box
Only 1 core component that would have been better as components.


# Created using Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## Technologies
- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)


