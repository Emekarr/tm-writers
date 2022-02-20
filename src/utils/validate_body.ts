export default (data: any[]) => {
	if (data.includes(null) || data.includes(undefined))
		return 'Please pass in all the required values';
	return;
};
