# Sample Project

This is a short paragraph.

This is a long paragraph that should trigger the linter’s paragraph length rule. It is intentionally verbose and goes on and on to exceed any reasonable threshold you’ve probably set, especially if you’re testing for line lengths like 120 characters.

## Setup

Install dependencies:

```bash
npm install
npm run dev
```

Make sure you’re running `Node.js` version `18.14.0`.

## Usage

You can run the project using this command:

```bash
node index.js --env=development
```

Use flags like `--debug` or `--silent` when necessary.

Example: `PORT=3000 node index.js`

## Configuration

Update values in `config.json`.

```json
{
  "port": 3000,
  "env": "production",
  "debug": true
}
```

You can also set the environment variable like this: `NODE_ENV=production`

## Features

- Lightweight CLI
- Uses `chalk` for terminal output
- Automatically reloads with `nodemon`
- Supports multiple environments
- Logs stored in `logs/app.log`

## Contributing

To contribute:

1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Open a pull request

## Extremely Long Heading That Is Definitely Meant to Exceed the Character Limit You’re Testing With

## Tasks

- [x] Install dependencies
- [x] Setup project
- [ ] Write tests for all modules in the system with long task descriptions to test how well list items are checked against length rules
- [ ] Integrate CI/CD with GitHub Actions

## License

MIT
