// Script to set super admin custom claims
// Run this once to make your user a super admin

import admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = {
  projectId: 'corporategames-prod',
  clientEmail: 'firebase-adminsdk-fbsvc@corporategames-prod.iam.gserviceaccount.com',
  privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC9GxGr9roPUav/\nD/PCvNM9M2CeYTssSDPb/z5BFOmmlFVFkNRjdrWgktvzR2hghTgm2t0ic9fxUc8i\nFEsXs9Bt9pb8tOo0X7Es5VA2SVBdqZ09DT2BUbwkwxsdhWG8wAGHiDp40h9iL8Is\nnUIQTjo8R8Dtx3tzmE5PnhI5HPbjAufHsUj9cI/ac3hgVDG/KmDdohELe0UA3uWk\nc3E8hoToXoUIbQP8O/aHruHZLgWFmpCyeL/YfHuwbpBRKZPj4VXGAFkG/pJxhdUK\nzLv7MQrDn8U3QRACiczstfE9HRkGq7QzPd+jhV+RnlezBC92pCp2SJ5gZ8nYatWI\nVkW/9xgHAgMBAAECggEAFl+/hYMZnHpjSThP9Ph2XcVYZyTF5YVdbWgTq4uX4Xen\nZyWtm18OOkNl9rC6LsFUVXSLuWnPYOP3B+cyw0kpHfmQ/7FADJZN1iwDg4jFE2/g\nBLsuTcCn7AmRibqgR77H74s0r9rcj7dq1/B7Qoae6UbsErYJazHYAh+HtG4y38Th\n2l4nt0Ga9KepzVT4NrfqWiUtGBaBGh2QkIlw/mIzzHCvMFErJ8fB7QCWiUdz6z17\nN2h1Br46ipxWbSA+KTNBNtRsteDp3QYj7qf3eaFvKSkhbpyA2ZRzIiqbKbH5Qdiv\nMOuEMs2pj4OOPLVN4ihdq6MHxkl4C+pbRE3DVYMrwQKBgQD1j+5gd316PhBjLWjg\naCnpdf/3XmBKcN3ItsEFbuyJ+7PLXHy79dUygGDOPW4TcGbWsM4xTrajRu/GszP6\ninwWNFh5nWDzm7S2dFKNC1oBil56YCz57mkKifjVi1Rn0mz7yBH0TXZyBG15Mp51\ncF4VaikW+4B9eOOLu8RxuF4ikQKBgQDFJM9ziWfRuRcAKxol99kCywZLKEPxwo/I\nRi1ziNMGQrBIuf3E23OV2SH7xpqZUKY1Um6nIL41no4BoOidVFSYT6MiObClTuqk\nRexpYxle2HHfBV4wr6cbko2niXfGAnXBaW5w57neZEf87tC+EfPyLuXnW+HfcXm2\nh4ipdsatFwKBgH6XAWM3ljcDcb0+9pbg++I/k4H5ZBhcEOlc1Sqw4T3MxQYsGp1n\nAM41AjKv1mQtCMbahKFEm8CWXBuJ3FznMUrdF1Myf312InYAh2HwnSi4JTZfCDCb\n6Ain0eB8IDoZb1do72CK4mmqwKi/IJMYJ1hQzvfrFXUZcexiEsYxLk4RAoGAC7Xt\nEMrnvOCGyj7FNd4sKOtQe2Rv7MuG6PmqN4O4LVYGzLsnpOr4Sb11NFSO2G6fAOnd\notXiFqNNgjFBwB7DS6znXuAYaylt7MYujfASEL1AvmO+PZwhjBS/j2UuFTgOMKgH\npHNPajOAxziUc8XzPL6mb4DYwQInnb0dVBu3H48CgYAx9TQyvJF4vFCaSxE9l4fu\nZVPmKwZW4oVgKNZ/2xJVgpcoPu8ked/vU0b2a4tRu9jQEWtZNj/OOySpNiaWLKbf\nDm2oNhim8U+KhYYm4kxnMm0izx9lp8lhOByf8KIlgsssfSsF7CnrAQ8uD5tl8z7m\nhKlUoBNXhvQ4nUH08NNkZg==\n-----END PRIVATE KEY-----'.replace(/\\n/g, '\n')
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setSuperAdminClaim() {
  try {
    // Replace with your email address
    const userEmail = 'kapankayasevval@gmail.com';
    
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'super_admin'
    });
    
    console.log('✅ Super admin role set for:', userEmail);
    console.log('🔄 User needs to sign out and sign back in for changes to take effect');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting super admin role:', error);
    process.exit(1);
  }
}

setSuperAdminClaim(); 