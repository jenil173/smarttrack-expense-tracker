/**
 * Formats a number to a specific currency format.
 * @param {number} amount - The amount to format
 * @param {Object} config - The currency configuration (locale, code)
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return '₹0.00';
    }

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};
