// [ STRATOS MAILER ] ---------------------------------------------------------
// Sends invite emails over SMTP when configured:
//   SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASS, MAIL_FROM
// Works with Gmail (app password), Brevo, Resend, Mailgun, etc.
// Without SMTP settings, emails are not sent and callers show a copyable link.
// -----------------------------------------------------------------------------
import nodemailer from 'nodemailer'

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env

export const emailEnabled = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS)

const transport = emailEnabled
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    })
  : null

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export async function sendInviteEmail({ to, inviterName, workspaceName, role, link }) {
  if (!transport) return false
  const subject = `${inviterName} invited you to "${workspaceName}" on Stratos`
  const text = `${inviterName} invited you to join the workspace "${workspaceName}" on Stratos as ${role === 'viewer' ? 'a viewer' : 'an editor'}.

Join here: ${link}

The link works for ${to} and expires in 7 days.`
  const html = `
  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#F8FAFC;padding:32px 16px">
    <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:28px">
      <div style="width:44px;height:44px;border-radius:12px;background:#F59E0B;color:#fff;font-weight:900;font-size:22px;line-height:44px;text-align:center">S</div>
      <h1 style="font-size:20px;color:#0F172A;margin:20px 0 8px">Join “${escapeHtml(workspaceName)}”</h1>
      <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 20px">
        <b>${escapeHtml(inviterName)}</b> invited you to collaborate on Stratos as ${role === 'viewer' ? 'a viewer' : 'an editor'}.
      </p>
      <a href="${escapeHtml(link)}" style="display:inline-block;background:#F59E0B;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:12px">Join workspace</a>
      <p style="font-size:12px;line-height:1.6;color:#94A3B8;margin:24px 0 0">
        This invite is for ${escapeHtml(to)} and expires in 7 days. If you weren't expecting it, you can ignore this email.
      </p>
    </div>
  </div>`
  try {
    await transport.sendMail({ from: MAIL_FROM || SMTP_USER, to, subject, text, html })
    return true
  } catch (err) {
    console.error('Invite email failed:', err.message)
    return false
  }
}
