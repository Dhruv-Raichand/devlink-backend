export const verificationEmail = (name: string, url: string) => `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#0a0a0f;color:#e8e6f0;padding:40px 20px;margin:0">
  <div style="max-width:480px;margin:0 auto;background:#13121c;border:1px solid #1e1d28;border-radius:12px;padding:32px">
    <h2 style="color:#fff;margin:0 0 8px">Verify your email</h2>
    <p style="color:#9b8ec4;margin:0 0 24px">Hey ${name}, click below to activate your DevLink account.</p>
    <a href="${url}"
       style="display:inline-block;background:#6d28d9;color:#fff;text-decoration:none;
              padding:12px 24px;border-radius:8px;font-weight:500">
      Verify email
    </a>
    <p style="color:#4a4760;font-size:12px;margin:24px 0 0">
      Link expires in 24 hours. If you didn't sign up, ignore this.
    </p>
  </div>
</body>
</html>
`;

export const passwordResetEmail = (name: string, url: string) => `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#0a0a0f;color:#e8e6f0;padding:40px 20px;margin:0">
  <div style="max-width:480px;margin:0 auto;background:#13121c;border:1px solid #1e1d28;border-radius:12px;padding:32px">
    <h2 style="color:#fff;margin:0 0 8px">Reset your password</h2>
    <p style="color:#9b8ec4;margin:0 0 24px">Hey ${name}, click below to reset your DevLink password.</p>
    <a href="${url}"
       style="display:inline-block;background:#6d28d9;color:#fff;text-decoration:none;
              padding:12px 24px;border-radius:8px;font-weight:500">
      Reset password
    </a>
    <p style="color:#4a4760;font-size:12px;margin:24px 0 0">
      Link expires in 1 hour. If you didn't request this, ignore it.
    </p>
  </div>
</body>
</html>
`;

export const digestEmail = (name: string, count: number) => `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#0a0a0f;color:#e8e6f0;padding:40px 20px;margin:0">
  <div style="max-width:480px;margin:0 auto;background:#13121c;border:1px solid #1e1d28;border-radius:12px;padding:32px">
    <h2 style="color:#fff;margin:0 0 8px">You have new connection requests</h2>
    <p style="color:#9b8ec4;margin:0 0 24px">
      Hey ${name}, you received <strong style="color:#fff">${count} connection request${count > 1 ? 's' : ''}</strong> yesterday on DevLink.
    </p>
    <a href="${process.env.FRONTEND_URL}/app/requests"
       style="display:inline-block;background:#6d28d9;color:#fff;text-decoration:none;
              padding:12px 24px;border-radius:8px;font-weight:500">
      View requests
    </a>
    <p style="color:#4a4760;font-size:12px;margin:24px 0 0">
      You're receiving this because you have pending connection requests on DevLink.
    </p>
  </div>
</body>
</html>
`;
