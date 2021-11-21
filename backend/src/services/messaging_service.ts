import sgMail, { MailDataRequired } from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

class MessagingService {
	sendEmail(email: string, message: string): Promise<{ success: boolean }> {
		return new Promise((resolve, reject) => {
			try {
				const msg: MailDataRequired = {
					to: email,
					from: process.env.TDM_EMAIL as string,
					subject: 'TDM WRITERS account verification.',
					text: `DO NOT SHARE THIS MESSAGE WITH ANYONE\nYour OTP is ${message}`,
				};

				try {
					sgMail
						.send(msg)
						.then(() => {
							console.log(`MESSAGE SUCCESSFULLY SENT TO ${email}`);
							resolve({ success: true });
						})
						.catch((err: any) => {
							console.log(
								`AN ERROR OCCURED WHILE SENDING A MESSAGE TO ${email}`,
							);
							console.log(
								`ERROR_MESSAGE: ${err.message} \nERROR_NAME: ${err.name}`,
							);
							console.log(err);
							reject({ success: false });
						});
				} catch (err) {
					reject({ success: false });
				}
			} catch (err) {
				reject({ success: false });
			}
		});
	}
}

export default new MessagingService();
