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
        subject: `You have received an assessment from ${data.companyName}`,
        html: `
          <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #edeaea; padding: 2rem 1rem; font-family: Arial, sans-serif;">
            <div style="width: 100%; max-width: 750px; margin: 0 auto;">
              <div style="background: white; border-radius: 20px; padding: 3rem; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); text-align: center;">
                
                <div style="margin-bottom: 2rem;">
                  <h1 style="color: #374151; font-size: 1.25rem; font-weight: 600; margin: 0; line-height: 1.4;">You have received an assessment from <span style="color: #708238;">${data.companyName}</span></h1>
                </div>
                
                <div style="text-align: left; margin-bottom: 2rem;">
                  <p style="color: #374151; margin: 0 0 1rem 0; font-size: 1rem; line-height: 1.5;">Hello,</p>
                  <p style="color: #374151; margin: 0 0 1.5rem 0; font-size: 1rem; line-height: 1.5;"><strong>${data.companyName}</strong> has invited you to complete an assessment.</p>
                  
                  <div style="background: #f9fafb; border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem; border: 2px solid #e5e7eb;">
                    <p style="color: #374151; margin: 0 0 0.5rem 0; font-weight: 600;">Company:</p>
                    <p style="color: #6b7280; margin: 0; font-size: 0.95rem;">${data.companyName}</p>
                    ${data.roleTag ? `
                      <p style="color: #374151; margin: 1rem 0 0.5rem 0; font-weight: 600;">Role:</p>
                      <p style="color: #6b7280; margin: 0; font-size: 0.95rem;">${data.roleTag}</p>
                    ` : ''}
                  </div>
                </div>
                
                <div style="margin: 2rem 0; text-align: left;">
                  <a href="${inviteUrl}" 
                     style="width: 100%; min-width: 220px; padding: 1rem 2rem; background: #708238; color: white; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; text-decoration: none; display: inline-block; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(112, 130, 56, 0.2);">
                    Start Your Assessment Here
                  </a>
                </div>
                
                <div style="background: #edeaea; border-radius: 12px; padding: 1rem; margin-bottom: 2rem; border-left: 4px solid #708238;">
                  <p style="color: #374151; margin: 0 0 0.75rem 0; font-weight: 600; font-size: 0.95rem;">Assessment Details:</p>
                  <ul style="color: #6b7280; margin: 0; padding-left: 1.2rem; font-size: 0.9rem; line-height: 1.6;">
                    <li>Estimated Duration: 20-35 minutes</li>
                    <li>This link expires in 7 days</li>
                    <li>You can access the assessment multiple times, but can only submit once</li>
                  </ul>
                </div>
                
                <div style="text-align: left; margin-bottom: 2rem;">
                  <p style="color: #374151; margin: 0 0 1rem 0; font-size: 0.95rem; line-height: 1.5;">If you have any questions, please don't hesitate to reach out.</p>
                  <p style="color: #374151; margin: 0; font-size: 0.95rem; line-height: 1.5;">Best regards,<br>The ${data.companyName} Team</p>
                </div>
                
                <div style="border-top: 2px solid #e5e7eb; padding-top: 1.5rem; text-align: center;">
                  <p style="color: #9ca3af; margin: 0 0 0.5rem 0; font-size: 0.8rem;">
                    This assessment is powered by OlivinHR. 
                    <a href="https://olivinhr.com" style="color: #708238; text-decoration: none;" target="_blank" rel="noopener noreferrer">Click here to learn more about OlivinHR</a>
                  </p>
                  <p style="color: #9ca3af; margin: 0; font-size: 0.8rem;">
                    If you face any issues please contact <a href="mailto:info@olivinhr.com" style="color: #708238; text-decoration: none;">info@olivinhr.com</a>
                  </p>
                </div>
                
              </div>
            </div>
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