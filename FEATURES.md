
This App is composed of a a core feature called `model card`
A `model card` is `react component` that can be rendedered, its parameter can be edited and takes `input` text, image, audio combines it with the `model card` parameters and used a LLM to generate `output`

`model card` can be connected to other `model cards` or `output component` 

`model card` takes it input from `input component`

`input component` is capable of accepting text, file, audio
`output component` is capable of rendering text, markdown, with additional buttons to enable copying, exporting as text, markdown, pdf

The App also needs necessary helpers to edit/update secrets like api keys, environment variables, and provide user authentication

The App needs local storage to keep logs, llm conversation history, and other items as necessary

Ask additional questions if you feels you need answers

Tech stack
- Web Framework : REACT ROUTER V7
- Styling : Tailwind CSS and daisy UI
- icons : Lucide
- package manager : pnpm
- nodejs
- use RxJS if there is an opportunity but not necessary
