/* eslint-disable no-console */
import sgMail, { MailDataRequired } from '@sendgrid/mail';

import Messenger from './interface/messenger';

class EmailMessenger implements Messenger {
	async send(email: string, text: string, subject: string): Promise<boolean> {
		let success!: boolean;
		try {
			const msg: MailDataRequired = {
				to: email,
				from: process.env.TDM_EMAIL as string,
				subject,
				text,
			};
			sgMail
				.send(msg)
				.then(() => {
					console.log(`MESSAGE SUCCESSFULLY SENT TO ${email}`);
					success = true;
				})
				.catch((err: any) => {
					console.log(`AN ERROR OCCURED WHILE SENDING A MESSAGE TO ${email}`);
					console.log(
						`ERROR_MESSAGE: ${err.message} \nERROR_NAME: ${err.name}`,
					);
					console.log(err);
					success = false;
				});
		} catch (err) {
			success = false;
		}
		return success;
	}
}

export default new EmailMessenger();
