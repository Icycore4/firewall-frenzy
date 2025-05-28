# Firewall Frenzy

A cybersecurity-themed tower defense game built with React, TypeScript, and Phaser.js.

## Game Overview

Firewall Frenzy is a tower defense game where players defend a vulnerable server from waves of malicious digital threats. The game combines traditional tower defense mechanics with a cyberpunk aesthetic and real-world cybersecurity concepts.

## Features

- Multiple defense structures (Firewalls, Antivirus Scanners, Packet Scrubbers, AI Sentries)
- Various malware types with unique behaviors
- Campaign mode with hand-crafted levels
- Endless mode with procedurally generated waves
- Resource management system using CPU Cycles
- Visual effects and UI inspired by cyberpunk aesthetics

## Tech Stack

- React + TypeScript for UI
- Phaser.js for game engine and canvas rendering
- Zustand for state management
- Webpack for bundling

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
firewall-frenzy/
├── src/
│   ├── game/         # Game engine and core mechanics
│   ├── scenes/       # Phaser scenes
│   ├── assets/       # Game assets
│   ├── components/   # React components
│   └── store/        # Game state management
└── public/           # Static assets
```
