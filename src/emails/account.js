const sgMail = require('@sendgrid/mail'); // Email Support

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to      : email,
        from    : 'swastikmedical74@gmail.com',
        subject : 'Regarding Task Manager APP',
        text    : `Welcome to the APP, ${name}. Let us know your thoughts about the app. We proudly serve our Customers. Thank You !` 
    });
};

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to      : email,
        from    : 'swastikmedical74@gmail.com',
        subject : 'Regarding Task Manager APP',
        text    : `Good Bye, ${name}. Let us know your thoughts about the app. We proudly serve our Customers. We hope to see you soon. Thank You !` 
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}