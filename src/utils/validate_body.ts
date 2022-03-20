export default (data: any[]) => {
	if (data.includes(null) || data.includes(undefined) || data.length === 0)
		return 'Please pass in all the required values';
	return;
};
