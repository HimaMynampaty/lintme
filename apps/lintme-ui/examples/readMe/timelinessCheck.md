# MyTool Documentation

Welcome to the official documentation for **MyTool** — a CLI-based data migration tool used for cloud-native apps.

## Version

Current release: **v1.2.0**  
> Released in March 2022

> For details, see: [https://github.com/myorg/mytool](https://github.com/myorg/mytool)

## Installation

Make sure the following tools are installed before using MyTool:

- **Node.js v14.17.0**
- **Docker 19.03**
- **kubectl 1.19**
- Python 3.7 or higher

Install using npm:

```bash
npm install -g mytool
```

## Getting Started

Initialize the tool:

```bash
mytool init
```

Use configuration from your environment:

```bash
mytool migrate --env=prod
```

## Notes

This documentation was last reviewed in January 2023.  
We recommend keeping dependencies up to date for best performance.

## License

MIT © 2023 MyOrg
