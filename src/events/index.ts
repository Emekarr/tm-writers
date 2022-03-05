export default () => {
	import('./notifications/notif_listener').then((kpi) => {
		kpi.default();
	});
};
