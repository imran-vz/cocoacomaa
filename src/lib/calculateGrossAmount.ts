export function calculateGrossAmount(netAmount: number, feePercent: number) {
	const grossAmount = netAmount / (1 - feePercent / 100);
	return parseFloat(grossAmount.toFixed(2));
}

export function calculateNetAmount(grossAmount: number, feePercent: number) {
	const netAmount = grossAmount * (1 - feePercent / 100);
	return parseFloat(netAmount.toFixed(2));
}
