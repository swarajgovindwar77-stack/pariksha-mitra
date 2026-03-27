/**
 * FIREBASE CLOUD FUNCTIONS — Razorpay Webhook Handler
 * ─────────────────────────────────────────────────────────────
 * This function runs on Firebase servers (not the app).
 * When a student pays via Razorpay, Razorpay calls this URL.
 * This function verifies the payment and updates Firestore.
 *
 * SETUP:
 * 1. npm install -g firebase-tools
 * 2. firebase login
 * 3. firebase init functions  (choose JavaScript)
 * 4. Copy this file to functions/index.js
 * 5. npm install in functions/ folder
 * 6. firebase deploy --only functions
 * ─────────────────────────────────────────────────────────────
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();

// ── Your Razorpay Secret (from dashboard.razorpay.com → Settings → API Keys)
// Store in Firebase environment:  firebase functions:config:set razorpay.secret="YOUR_SECRET"
const RAZORPAY_SECRET = functions.config().razorpay?.secret || 'YOUR_RAZORPAY_SECRET';

// ================================================================
// WEBHOOK — Called by Razorpay after every payment
// ================================================================
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // 1. Verify webhook signature
    const razorpaySignature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_SECRET)
      .update(body)
      .digest('hex');

    if (razorpaySignature !== expectedSignature) {
      console.error('Webhook signature mismatch');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log('Razorpay webhook event:', event);

    // 2. Handle payment events
    if (event === 'payment.captured') {
      await handlePaymentCaptured(payload.payment.entity);
    } else if (event === 'subscription.activated') {
      await handleSubscriptionActivated(payload.subscription.entity);
    } else if (event === 'subscription.cancelled') {
      await handleSubscriptionCancelled(payload.subscription.entity);
    } else if (event === 'subscription.charged') {
      await handleSubscriptionCharged(payload.subscription.entity, payload.payment.entity);
    }

    return res.status(200).json({ status: 'ok' });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Handler: One-time payment captured ────────────────────────
async function handlePaymentCaptured(payment) {
  const { id: paymentId, amount, currency, notes } = payment;
  const userId = notes?.userId;
  const plan = notes?.plan || 'pro';

  if (!userId) {
    console.error('No userId in payment notes:', paymentId);
    return;
  }

  console.log(`Payment captured: ₹${amount/100} for user ${userId}, plan: ${plan}`);

  // Calculate expiry date
  const expiry = new Date();
  if (plan === 'pro') expiry.setMonth(expiry.getMonth() + 1);
  if (plan === 'premium') expiry.setFullYear(expiry.getFullYear() + 1);

  // Save payment record
  await db.collection('payments').doc(paymentId).set({
    paymentId, userId, plan, amount, currency,
    status: 'captured',
    capturedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Activate Pro for user
  await db.collection('users').doc(userId).update({
    plan: 'pro',
    planExpiry: expiry.toISOString(),
    lastPaymentId: paymentId,
    upgradedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`✅ Pro activated for user ${userId} until ${expiry.toISOString()}`);
}

// ── Handler: Subscription activated ──────────────────────────
async function handleSubscriptionActivated(subscription) {
  const { id: subId, customer_id, notes } = subscription;
  const userId = notes?.userId;
  if (!userId) return;

  await db.collection('users').doc(userId).update({
    plan: 'pro',
    subscriptionId: subId,
    subscriptionStatus: 'active',
    planExpiry: null, // Subscription auto-renews — no fixed expiry
    upgradedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`✅ Subscription activated for user ${userId}`);
}

// ── Handler: Subscription cancelled ──────────────────────────
async function handleSubscriptionCancelled(subscription) {
  const { id: subId, notes } = subscription;
  const userId = notes?.userId;
  if (!userId) return;

  // Downgrade to free when current period ends
  await db.collection('users').doc(userId).update({
    plan: 'free',
    subscriptionStatus: 'cancelled',
    planExpiry: null,
    subscriptionId: admin.firestore.FieldValue.delete(),
  });

  console.log(`⚠️ Subscription cancelled for user ${userId} — downgraded to free`);
}

// ── Handler: Subscription renewed (charged again) ─────────────
async function handleSubscriptionCharged(subscription, payment) {
  const userId = subscription.notes?.userId;
  if (!userId) return;

  await db.collection('payments').doc(payment.id).set({
    paymentId: payment.id,
    userId,
    plan: 'pro',
    amount: payment.amount,
    type: 'subscription_renewal',
    capturedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`🔄 Subscription renewed for user ${userId}`);
}

// ================================================================
// VERIFY PAYMENT — Called from the app to verify a payment
// ================================================================
exports.verifyPayment = functions.https.onCall(async (data, context) => {
  // Must be authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = data;

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_SECRET)
    .update(body)
    .digest('hex');

  if (razorpay_signature !== expectedSignature) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid payment signature');
  }

  // Activate plan
  const userId = context.auth.uid;
  const expiry = new Date();
  if (plan === 'pro') expiry.setMonth(expiry.getMonth() + 1);
  if (plan === 'premium') expiry.setFullYear(expiry.getFullYear() + 1);

  await db.collection('users').doc(userId).update({
    plan: 'pro',
    planExpiry: expiry.toISOString(),
    lastPaymentId: razorpay_payment_id,
    upgradedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, plan: 'pro', expiry: expiry.toISOString() };
});

// ================================================================
// ADMIN — Add question (only callable by admin emails)
// ================================================================
const ADMIN_EMAILS = ['your-email@gmail.com']; // Replace with your Gmail

exports.addQuestion = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }
  if (!ADMIN_EMAILS.includes(context.auth.token.email)) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }

  const { exam, subject, q, opts, ans, exp, difficulty, tags } = data;
  if (!exam || !subject || !q || !opts || ans === undefined) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  const docRef = await db.collection('questions').doc(exam)
    .collection(subject).add({
      exam, subject, q, opts, ans,
      exp: exp || '',
      difficulty: difficulty || 'medium',
      tags: tags || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  return { success: true, id: docRef.id };
});

// ================================================================
// WEEKLY LEADERBOARD RESET — Runs every Monday at midnight
// ================================================================
exports.resetWeeklyXp = functions.pubsub
  .schedule('every monday 00:00')
  .timeZone('Asia/Kolkata')
  .onRun(async () => {
    console.log('Resetting weekly XP for leaderboard...');
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { weeklyXp: 0 });
    });
    await batch.commit();
    console.log(`✅ Reset weeklyXp for ${snapshot.size} users`);
  });

/*
 * ================================================================
 * RAZORPAY WEBHOOK SETUP
 * ================================================================
 * 1. After deploying functions, copy the webhook URL:
 *    https://REGION-YOUR_PROJECT_ID.cloudfunctions.net/razorpayWebhook
 *
 * 2. Go to: dashboard.razorpay.com → Settings → Webhooks → Add Webhook
 *
 * 3. Paste the URL and select these events:
 *    ✅ payment.captured
 *    ✅ subscription.activated
 *    ✅ subscription.cancelled
 *    ✅ subscription.charged
 *
 * 4. Copy the Webhook Secret and add to Firebase config:
 *    firebase functions:config:set razorpay.secret="YOUR_WEBHOOK_SECRET"
 *    firebase deploy --only functions
 *
 * ================================================================
 * RAZORPAY SUBSCRIPTIONS vs ONE-TIME PAYMENTS
 * ================================================================
 * For ₹99/month recurring billing, use Razorpay Subscriptions:
 * - Create a Plan at: dashboard.razorpay.com → Subscriptions → Plans
 * - Plan ID: plan_XXXXXXXX (copy this)
 * - In the app, use subscriptionId instead of one-time amount
 *
 * In index.html startPayment(), replace options with:
 * {
 *   key: window.RAZORPAY_KEY,
 *   subscription_id: "sub_XXXXXXXX",  // from Razorpay API
 *   name: "ParikshaMitra Pro",
 *   ...
 * }
 * ================================================================
 */
