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
    selectedGame?: string;
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
        ? process.env.VITE_GAME_PLATFORM_URL || 'https://hub.olivinhr.com'
        : 'http://localhost:5174';
      
      const inviteUrl = `${gameBaseUrl}?token=${data.token}&game=${encodeURIComponent(data.selectedGame || 'Leadership Scenario Game')}`;
      
      const msg = {
        to: data.candidateEmail,
        from: 'noreply@olivinhr.com', // Replace with your verified sender
        subject: `${data.companyName} Assessment Invitation`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #6B8E23;">You received an assessment by "${data.companyName}"</h2>
            <p>Hello,</p>
            <p><strong>${data.companyName}</strong> has invited you to complete a leadership assessment.</p>
            
            <p><strong>Company:</strong> ${data.companyName}</p>
            ${data.roleTag ? `<p><strong>Role:</strong> ${data.roleTag}</p>` : ''}
            
            <div style="margin: 30px 0; text-align: left;">
              <a href="${inviteUrl}" 
                 style="background-color: #6B8E23; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Start Your Assessment Here
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              <strong>Assessment Details:</strong><br>
              • Estimated Duration: 20-35 minutes<br>
              • This link expires in 7 days<br>
              • You can access the assessment multiple times, but can only submit once
            </p>
            
            <p>If you have any questions, please don't hesitate to reach out.</p>
            <p>Best regards,<br>The ${data.companyName} Team</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999;">
              This assessment is powered by OlivinHR. 
              <a href="https://olivinhr.com" style="color: #6B8E23;" target="_blank" rel="noopener noreferrer">Click here to learn more about OlivinHR</a>
            </p>
            <p style="font-size: 12px; color: #999;">
              If you face any issues please contact <a href="mailto:info@olivinhr.com" style="color: #6B8E23;">info@olivinhr.com</a>
            </p>
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