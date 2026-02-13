"use client";

import { signIn } from "next-auth/react";

export default function TestOAuthPage() {
  return (
    <div style={{ padding: "50px" }}>
      <h1>OAuth Test Page</h1>

      <button
        onClick={() => {
          console.log("Clicking Google OAuth");
          signIn("google", {
            callbackUrl: "/portal",
            redirect: true
          });
        }}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          marginTop: "20px"
        }}
      >
        Test Google OAuth
      </button>

      <button
        onClick={() => {
          console.log("Clicking Microsoft OAuth");
          signIn("azure-ad", {
            callbackUrl: "/portal",
            redirect: true
          });
        }}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          marginTop: "20px",
          marginLeft: "10px"
        }}
      >
        Test Microsoft OAuth
      </button>

      <div style={{ marginTop: "30px", fontSize: "14px", color: "#666" }}>
        <p>NEXTAUTH_URL should be: https://www.probatedesk.com</p>
        <p>If OAuth works, you'll be redirected to Google/Microsoft</p>
        <p>If it fails, check the browser console for errors</p>
      </div>
    </div>
  );
}
