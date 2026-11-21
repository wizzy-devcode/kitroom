# Kit Room store

Storefront, staff admin (`/admin`), saved customer orders. Node + Express + SQLite.

## Deploy on Railway
1. Push this folder to a GitHub repo.
2. Railway: **New Project > Deploy from GitHub repo**.
3. Open the service > **Volumes > Add Volume**, mount path `/data`. (Without it, your products, photos and orders are lost on every redeploy.)
4. **Variables**: `DATA_DIR=/data`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, optional `WHATSAPP_NUMBER` (country code, digits only).
5. **Settings > Networking > Generate Domain**. Open `/admin` and sign in.

The owner account is created on first start from ADMIN_USERNAME / ADMIN_PASSWORD. If you leave the password out, a random one is printed once in the deploy logs. Add staff accounts in Admin > Staff.

## Run locally
```
npm install
ADMIN_PASSWORD=test1234 npm start
```
Open http://localhost:3000 and http://localhost:3000/admin.

## Notes
- Keep one replica (SQLite lives on the volume).
- Back up by downloading `/data/store.db` and `/data/uploads`.
- Orders are saved when a customer places them, then the customer confirms on WhatsApp. Stock drops when staff mark an order Confirmed or Delivered.

## Paystack payments

Customers can pay by card, bank transfer or USSD on Paystack's secure page. Your site never sees card details.

1. Create an account at paystack.com. Open **Settings > API Keys & Webhooks**.
2. In Railway: your service > **Variables**. Add `PAYSTACK_SECRET_KEY` (starts with `sk_test_` while testing, `sk_live_` when you are ready for real money) and `SITE_URL` (your site address, for example `https://your-app.up.railway.app`). Never share the secret key or put it in the code.
3. On Paystack, set the **Webhook URL** to `https://YOUR-SITE/api/paystack/webhook` (the admin **Payments** tab shows the exact address). Set the callback URL to `https://YOUR-SITE/pay/return` if you like.
4. Redeploy. Place a test order and pay with a Paystack test card from their documentation.

How it works
- Customers give an email at checkout. After placing an order they see **Pay now with Paystack**, or they can confirm on WhatsApp and pay later.
- An order only becomes **Paid** after the server asks Paystack directly and checks the status, currency (NGN) and exact amount. The page the customer returns to is never trusted on its own, and the webhook covers customers who close the page early.
- A paid order is confirmed automatically and its items come out of stock.
- Orders with a delivery fee still to be confirmed cannot be paid online yet. Set the fee on the order, then use **Get payment link** and send the link on WhatsApp.
- If you are paid by cash, transfer or POS, use **Mark as paid** on the order.
- If the amount paid does not match the order, it is flagged for review instead of being marked paid.
- Without the key set, nothing changes: orders are confirmed on WhatsApp as before.

## Customization approval

Customized items need your approval before the customer can order them.
- The customer ticks Customize on an item and fills in the printing details (what each product type asks for is set in the admin under Clubs, seasons, types > Product types).
- In the cart they press **Send customization request**. Their cart is kept and shows **Waiting for approval**.
- In the admin, the **Customizations** tab shows the request. Check the details, add an optional note, and press **Approve** or **Decline**. You can also call or message the customer from there.
- The customer's cart updates by itself (and when they reopen it): approved requests unlock **Place order**, declined ones show your note and let them send a new request or remove the item.
- An approval can be used for one order. The printing details and customization fee on the order come from what you approved, not from the customer's browser. If the customer changes the customized items after sending, they need a new request.

## Store design

The shop has three designs. Every feature works the same in each one.

- **Matchday** (default): navy and chalk white, stadium-style headlines, referee-card stock labels.
- **Gallery**: quiet and premium, white space and big product photos.
- **Terrace**: bold streetwear, green and yellow, push-down buttons.

Preview a design by adding `?look=gallery`, `?look=terrace` or `?look=matchday` to the shop address.
Make one live in Admin → Site text → Store design, then click Save changes.
Customers can switch between light and dark mode with the moon/sun button in the header.

Design files: `public/index.html`, `public/store.css` (Matchday and shared layout), `public/looks.css` (Gallery and Terrace).
The admin (`/admin`) uses `public/admin.html`, `public/admin.js` and `public/admin.css`, in the same Matchday look as the shop. It opens on an Overview of new orders, prints to approve, new messages and items to restock.
