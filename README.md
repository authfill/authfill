![AuthFill Banner Image](https://github.com/authfill/authfill/blob/main/banner.jpg?raw=true)

# AuthFill

AuthFill is your one-click solution for verifying email addresses across the web. Say goodbye to searching your inbox for verification codes or links.

> [!WARNING]  
> We are currently in an open beta. You may encounter bugs.

## Features

### ✅ One-Click Email Verification

Whether you need to verify your email or reset your password for the hundredth time, AuthFill makes it painless. Just click the AuthFill icon and you’re verified!

### 📧 Works with Any Email Provider

Whether you're team Gmail, Outlook, or using an old-school custom domain, AuthFill has your back.\*

### 🔒 Secure by Design

Your credentials and emails are never stored anywhere except your own device.\*\*

### 💻 Open Source

AuthFill is fully open-source, so anyone can peek under the hood, suggest improvements, or just admire the code.

## Development

### Prerequisites

- [git](https://git-scm.com/downloads)
- [NodeJS](https://nodejs.org/en/download) v22.14.0
- [pnpm](https://pnpm.io/installation) v8.15.6

### Setup

1. Clone the repository

```sh
git clone git@github.com:authfill/authfill.git
cd authfill
```

1. Add your enviroment variables

```sh
cp .env.example .env
```

2. Install the dependencies

```sh
pnpm install
```

3. Start the development server

```sh
pnpm run dev
```

4. Load the unpacked extension

**Chrome (or chromium based browsers):**

1. Open `chrome://extensions/`
2. Enable the "Developer mode" in the top right
3. Press "Load unpacked" in the top left
4. Navigate to the AuthFill source code and select the `apps/extension/dist` folder

**Firefox:**

1. Add `BROWSER=firefox` to your `.env` file.
2. Restart the server by running `pnpm run dev` again
3. Enter `about:debugging` in the Firefox search bar
4. Navigate to the "This Firefox" tab
5. Press "Load Temporary Add-on"
6. Navigate to the `apps/extension/dist` folder and select the `manifest.json` file inside apps/browser/build

---

\*AuthFill supports any email provider with IMAP access and plain-text password authentication. This includes Gmail, Outlook, and most custom domain email services.

\*\*Due to a technical limitation of browser extensions, AuthFill has to temporarily proxy data through our servers to establish the IMAP connection and fetch your emails. However, your credentials and emails are never permanently stored and remain strictly confined to the processing step. Everything else stays local on your device. You can read more in our Privacy Policy at https://authfill.com/privacy
