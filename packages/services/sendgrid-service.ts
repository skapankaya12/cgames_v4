/**
 * SendGrid service for sending invitation emails
 */
export class SendGridService {
  /**
   * Send an invitation email using SendGrid
   */
  static async sendInvitationEmail(data: {
    candidateEmail: string;
    token: string;
    projectId?: string;
    roleTag?: string;
    companyName: string;
  }) {
    console.log('📧 [SendGridService] Sending invitation email to:', data.candidateEmail);
    
    try {
      // Dynamic import to avoid client-side issues
      const sgMail = (await import('@sendgrid/mail')).default;
      
      const apiKey = process.env.SENDGRID_API_KEY;
      if (!apiKey) {
        throw new Error('SENDGRID_API_KEY environment variable is not set');
      }
      
      sgMail.setApiKey(apiKey);
      
      const gameBaseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://cgames-game-platform.vercel.app'
        : 'http://localhost:5174';
      
      const inviteUrl = `${gameBaseUrl}?token=${data.token}`;
      
      const msg = {
        to: data.candidateEmail,
        from: 'noreply@olivinhr.com', // Replace with your verified sender
        subject: `${data.companyName} Assessment Invitation`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You're Invited to Complete an Assessment</h2>
            <p>Hello,</p>
            <p>${data.companyName} has invited you to complete a leadership assessment.</p>
            <p><strong>Role:</strong> ${data.roleTag}</p>
            <div style="margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Start Assessment
              </a>
            </div>
            <p>This link is unique to you and can only be used once.</p>
            <p>Best regards,<br>The ${data.companyName} Team</p>
          </div>
        `,
      };
      
      await sgMail.send(msg);
      console.log('✅ [SendGridService] Email sent successfully to:', data.candidateEmail);
      
    } catch (error) {
      console.error('🚨 [SendGridService] Error sending email:', error);
      throw error;
    }
  }
} 