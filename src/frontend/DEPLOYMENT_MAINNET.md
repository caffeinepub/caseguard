# CaseGuard Mainnet Deployment Guide

This guide covers deploying the CaseGuard frontend to the Internet Computer mainnet.

## Prerequisites

- `dfx` CLI installed and configured
- Mainnet wallet with sufficient cycles
- Backend canister already deployed to mainnet

## Environment Configuration

### Internet Identity URL

The frontend uses Internet Identity for authentication. By default, it connects to the production Internet Identity service at `https://identity.ic0.app`.

**Option 1: Use Default (Recommended)**
- Do not set `VITE_II_URL` or `II_URL`
- The app will automatically use `https://identity.ic0.app`

**Option 2: Custom Internet Identity**
- Create a `.env.production` file (see `.env.production.example`)
- Set `VITE_II_URL=https://your-custom-ii-url.com`

### Example Production Environment

