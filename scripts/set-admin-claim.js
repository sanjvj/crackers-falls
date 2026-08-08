/**
 * Firebase Admin Custom Claims Setter Script for Crackers Falls
 * 
 * Usage:
 *   1. Download Service Account JSON key from Firebase Console -> Project Settings -> Service Accounts
 *   2. Save as serviceAccountKey.json in the project root directory
 *   3. Run: node scripts/set-admin-claim.js <admin-email-or-uid>
 */

const admin = require('firebase-admin');

const targetIdentifier = process.argv[2] || 'ajsolutionsmd@gmail.com';

if (!targetIdentifier) {
  console.error('❌ Usage: node scripts/set-admin-claim.js <user-email-or-uid>');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = require('../serviceAccountKey.json');
} catch (e) {
  console.error('❌ ERROR: serviceAccountKey.json not found in project root directory.');
  console.error('Please download your Service Account Key from Firebase Console -> Project Settings -> Service Accounts and save as serviceAccountKey.json.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim(identifier) {
  try {
    let user;
    if (identifier.includes('@')) {
      user = await admin.auth().getUserByEmail(identifier);
    } else {
      user = await admin.auth().getUser(identifier);
    }

    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
      role: 'super_admin'
    });

    console.log(`✅ SUCCESS: Custom claim set for admin user!`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Claim: { admin: true, role: 'super_admin' }`);
    console.log('\nIMPORTANT: The user must sign out and sign back in to refresh their Firebase Auth ID token claims.');
    process.exit(0);
  } catch (error) {
    console.error(`❌ FAILED to set custom claim for ${identifier}:`, error.message);
    process.exit(1);
  }
}

setAdminClaim(targetIdentifier);
