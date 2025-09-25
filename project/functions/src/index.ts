import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

// Load Gmail credentials from Firebase config
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.vehifbeblkfcjybu; // Use App Password

if (!gmailEmail || !gmailPassword) {
  throw new Error("Gmail credentials not set in Firebase config.");
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

interface FeedbackEmailData {
  pendingUserId: string;
  to_name: string;
  to_email: string;
  message: string;
  action: "approve" | "reject";
}

// Callable function
export const handleUserApproval = functions.https.onCall(
  async (data: FeedbackEmailData, context) => {
    const { pendingUserId, to_name, to_email, message, action } = data;

    if (!pendingUserId || !to_name || !to_email || !message || !action) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields."
      );
    }

    try {
      // 1️⃣ Send email to user
      const mailOptions = {
        from: `Your Platform <${gmailEmail}>`,
        to: to_email,
        subject: `Your registration has been ${action}`,
        text: `Hello ${to_name},

Your registration has been ${action} by the admin.

Reason/Feedback: ${message}

Thank you!`,
      };
      await transporter.sendMail(mailOptions);

      // 2️⃣ Move user from pendingUsers to users (if approved) or mark as rejected
      const pendingUserRef = admin.firestore().collection("pendingUsers").doc(pendingUserId);
      const pendingUserSnap = await pendingUserRef.get();

      if (!pendingUserSnap.exists) {
        throw new functions.https.HttpsError("not-found", "Pending user not found.");
      }

      const userData = pendingUserSnap.data();

      if (action === "approve") {
        await admin.firestore().collection("users").doc(pendingUserId).set({
          ...userData,
          role: "user", // or assign appropriate role
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else if (action === "reject") {
        // Optionally, you can store rejected users in another collection
        await admin.firestore().collection("rejectedUsers").doc(pendingUserId).set({
          ...userData,
          rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // 3️⃣ Remove from pendingUsers
      await pendingUserRef.delete();

      return { success: true, message: "User processed and email sent successfully." };
    } catch (error: any) {
      console.error("Error processing user:", error);
      throw new functions.https.HttpsError(
        "internal",
        error?.message || "Failed to process user."
      );
    }
  }
);
