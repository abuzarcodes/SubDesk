# SubDesk Subscriber Bot

This bot automates the process of creating a new customer account and subscribing to a plan. It's useful for testing the Analytics Dashboard.

## Prerequisites

- [Python 3.x](https://www.python.org/) installed.
- [Firefox](https://www.mozilla.org/firefox/) browser installed.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the bot with a subscription link. You can optionally specify the number of users to add:
   ```bash
   # Add 1 user (default)
   python subscriber_bot.py "YOUR_SUBSCRIPTION_LINK_HERE"

   # Add 5 users
   python subscriber_bot.py "YOUR_SUBSCRIPTION_LINK_HERE" -n 5
   ```

   *You can get the subscription link from the Dashboard page of your business account.*

## How it works
1. Opens the browser to the registration page.
2. Selects the **Customer** role.
3. Generates a random name and email.
4. Redirects to the provided subscription link.
5. Clicks the first available **Subscribe Now** button.
6. Completes the subscription.
