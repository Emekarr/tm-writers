import Emitter from '../emitter';

import events from './notif_events';

export default () =>
	Object.values(events).forEach(async (event) => {
		await Emitter.listen(event.EVENT, event.ACTION);
	});
