<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="logo-dark.png">
    <img src="logo.png" alt="nonfollowers" width="420">
  </picture>
</p>

<p align="center">
  See who you follow on Instagram that does not follow you back.
</p>

<p align="center">
  <a href="#usage">Usage</a> ·
  <a href="#options">Options</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#limitations">Limitations</a>
</p>

<br>

A small browser script that runs in your browser's developer console while you are logged in to instagram.com. There is nothing to install, and no password or data leaves your browser.

## Features

- Lists every account you follow that does not follow you back
- Separates celebrities into their own tab, based on the verified badge and, optionally, follower count
- Search, profile links, and one-click copy of the list
- Waits between requests and backs off automatically when Instagram rate limits

## Usage

1. Open [instagram.com](https://www.instagram.com) on a desktop browser and log in.
2. Open the developer tools with `F12` (or `Cmd + Option + J` on macOS) and go to the **Console** tab.
3. Copy the full contents of [`nonfollowers.js`](nonfollowers.js), paste it into the console, and press `Enter`.
   Chrome may block pasting the first time. If it does, type `allow pasting` and press `Enter`, then paste again.
4. Choose your options and click **Start**.

## Options

| Option | Default | Description |
| --- | --- | --- |
| Verified accounts | On | Moves verified accounts to the Celebrities tab. |
| Accounts with more than N followers | Off | Also moves accounts above the given follower count. This sends one extra request per account, so the scan takes longer. |

## How it works

Instagram's follower list is capped and often returns only part of your followers, so the script does not rely on it to decide who follows you.

1. Loads the full list of accounts you follow.
2. Loads whatever part of your follower list Instagram returns. Everyone in it is marked as a follower.
3. For each remaining account, asks Instagram directly whether that account follows you.

## Limitations

- Scan time grows with the number of accounts you follow. A few hundred accounts takes a few minutes.
- Instagram may temporarily rate limit your account after heavy use. The script pauses and retries, but if it keeps failing, wait an hour and run it again.
- The script uses Instagram's internal web API, which can change without notice.

## Disclaimer

This project is not affiliated with Instagram or Meta. Use it at your own risk and in line with Instagram's terms of use.
