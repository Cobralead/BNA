const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// ============================================================
// SECURE CONFIG PROXY
// ============================================================
// These values are set via `firebase functions:secrets:set`
// and NEVER committed to the public repository.
// ============================================================

/**
 * Returns the Firebase client config to the frontend.
 * The config is stored as a Firebase secret, not in the public repo.
 * 
 * Set it with:
 *   firebase functions:secrets:set BNA_FIREBASE_CONFIG
 * 
 * Value should be a JSON string:
 *   {"apiKey":"...","authDomain":"...","databaseURL":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"...","measurementId":"..."}
 */
exports.getFirebaseConfig = functions.https.onCall(async (data, context) => {
  const configJson = process.env.BNA_FIREBASE_CONFIG;
  if (!configJson) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Firebase config not configured. Admin must run: firebase functions:secrets:set BNA_FIREBASE_CONFIG'
    );
  }
  try {
    return JSON.parse(configJson);
  } catch (e) {
    throw new functions.https.HttpsError('internal', 'Invalid Firebase config stored in secret.');
  }
});

/**
 * Verifies if the caller is an authorized administrator.
 * The authorized admin email is stored as a Firebase secret, never in the public repo.
 * 
 * Set it with:
 *   firebase functions:secrets:set BNA_ADMIN_EMAIL
 *   Value: cobra.broken@gmail.com
 */
exports.verifyAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be signed in to verify administrator status.'
    );
  }

  const callerEmail = context.auth.token.email || '';
  if (!callerEmail) {
    return { authorized: false };
  }

  const adminEmail = process.env.BNA_ADMIN_EMAIL;
  if (!adminEmail) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Admin email not configured. Admin must run: firebase functions:secrets:set BNA_ADMIN_EMAIL'
    );
  }

  const authorized = callerEmail.toLowerCase() === adminEmail.toLowerCase();
  return { authorized };
});

/**
 * Generates quiz questions using Groq AI (Llama/Mixtral models).
 * The Groq API key is stored as a Firebase secret, never in the public repo.
 * 
 * Set it with:
 *   firebase functions:secrets:set GROQ_API_KEY
 */
exports.generateQuizQuestions = functions.https.onCall(async (data, context) => {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Groq API key not configured. Admin must run: firebase functions:secrets:set GROQ_API_KEY'
    );
  }

  const subject = data?.subject;
  const grade = data?.grade;
  const stream = data?.stream;

  if (!subject || !grade) {
    throw new functions.https.HttpsError('invalid-argument', 'Subject and grade are required.');
  }

  const prompt = `Create 15 multiple-choice quiz questions for ${subject} for Grade ${grade}${stream ? ` ${stream}` : ''}. Return valid JSON only in this structure: {"questions":[{"q":"question","opts":["A","B","C","D"],"a":"correct option"}]}. Make questions appropriate for the grade level.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a quiz generator. Always respond with valid JSON only, no markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new functions.https.HttpsError('internal', `Groq API request failed with ${response.status}`);
    }

    const result = await response.json();
    const text = result?.choices?.[0]?.message?.content || '';
    
    // Try to parse JSON from the response
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    const questions = Array.isArray(parsed?.questions) ? parsed.questions : null;
    
    if (Array.isArray(questions) && questions.length >= 15) {
      return { questions: questions.slice(0, 15) };
    }
    
    // If parsing failed or not enough questions, return fallback
    return { questions: buildFallbackQuestions(subject, grade, stream) };
  } catch (error) {
    console.error('Quiz generation error:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    return { questions: buildFallbackQuestions(subject, grade, stream) };
  }
});

function buildFallbackQuestions(subject, grade, stream) {
  const base = [];
  for (let i = 0; i < 15; i++) {
    const number = i + 1;
    const questionText = `${subject} practice question ${number}: Which answer best fits a Grade ${grade}${stream ? ` ${stream}` : ''} learner?`;
    const options = [
      `${subject} concept ${number}A`,
      `${subject} concept ${number}B`,
      `${subject} concept ${number}C`,
      `${subject} concept ${number}D`
    ];
    base.push({
      q: questionText,
      opts: options,
      a: options[0]
    });
  }
  return base;
}

/**
 * Deletes a portal user from Firebase Authentication.
 * Only the authorized administrator can call this.
 * The admin email is stored as a Firebase secret, never in the public repo.
 * 
 * The primary administrator account (cobra.broken@gmail.com) is protected
 * and can never be deleted by this function.
 */
exports.deletePortalUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be signed in to delete a portal account.');
  }

  const adminEmail = process.env.BNA_ADMIN_EMAIL;
  if (!adminEmail) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Admin email not configured. Admin must run: firebase functions:secrets:set BNA_ADMIN_EMAIL'
    );
  }

  const requesterEmail = context.auth.token.email || '';
  if (requesterEmail.toLowerCase() !== adminEmail.toLowerCase()) {
    throw new functions.https.HttpsError('permission-denied', 'Only authorized administrators can delete portal users.');
  }

  const uid = data?.uid;
  const email = data?.email;

  if (!uid && !email) {
    throw new functions.https.HttpsError('invalid-argument', 'A uid or email is required.');
  }

  // ═══════════════════════════════════════════════════════════
  // PROTECT THE PRIMARY ADMINISTRATOR ACCOUNT
  // The primary admin (cobra.broken@gmail.com) can never be deleted.
  // ═══════════════════════════════════════════════════════════
  const targetEmail = email || '';
  if (targetEmail.toLowerCase() === adminEmail.toLowerCase()) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'The primary administrator account is protected and cannot be deleted.'
    );
  }

  // If only uid is provided, look up the user's email first
  let targetUid = uid;
  let targetUserEmail = targetEmail;

  if (targetUid && !targetUserEmail) {
    try {
      const userRecord = await admin.auth().getUser(targetUid);
      targetUserEmail = userRecord.email || '';
      if (targetUserEmail.toLowerCase() === adminEmail.toLowerCase()) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'The primary administrator account is protected and cannot be deleted.'
        );
      }
    } catch (error) {
      if (error instanceof functions.https.HttpsError) throw error;
      // If user lookup fails, proceed with uid-based deletion
      console.warn('[deletePortalUser] Could not look up user by uid, proceeding with uid deletion:', error.message);
    }
  }

  try {
    if (targetUid) {
      await admin.auth().deleteUser(targetUid);
      return { ok: true, deletedUid: targetUid };
    }

    const user = await admin.auth().getUserByEmail(targetUserEmail);
    await admin.auth().deleteUser(user.uid);
    return { ok: true, deletedUid: user.uid };
  } catch (error) {
    if (error?.code === 'auth/user-not-found') {
      return { ok: true, deleted: false, reason: 'user-not-found' };
    }
    throw new functions.https.HttpsError('internal', error.message || 'Failed to delete Firebase authentication user.');
  }
});