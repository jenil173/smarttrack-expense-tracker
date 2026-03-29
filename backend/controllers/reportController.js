const { generatePDFReport } = require('../utils/pdfGenerator');
const sendEmail = require('../utils/emailService');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');

// Helper to fetch summary data (identical to expenseController but we need it here)
const getReportData = async (userId) => {
    const expenses = await Expense.find({ user: userId });
    const incomes = await Income.find({ user: userId });

    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;

    let healthScore = 100;
    if (totalIncome > 0) {
        const rawScore = ((totalIncome - totalExpense) / totalIncome) * 100;
        healthScore = Math.max(0, Math.min(100, rawScore));
    } else if (totalExpense > 0) {
        healthScore = 0;
    } else {
        healthScore = 100;
    }

    const thisMonthStr = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });

    const categoryData = {};
    expenses.forEach(exp => {
        if (categoryData[exp.category]) categoryData[exp.category] += exp.amount;
        else categoryData[exp.category] = exp.amount;
    });

    const monthlyData = {};
    expenses.forEach(exp => {
        const monthYear = new Date(exp.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlyData[monthYear]) monthlyData[monthYear] = { expense: 0, income: 0, month: monthYear };
        monthlyData[monthYear].expense += exp.amount;
    });
    incomes.forEach(inc => {
        const monthYear = new Date(inc.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlyData[monthYear]) monthlyData[monthYear] = { expense: 0, income: 0, month: monthYear };
        monthlyData[monthYear].income += inc.amount;
    });

    const thisMonthData = monthlyData[thisMonthStr] || { income: 0, expense: 0 };
    const savings = thisMonthData.income - thisMonthData.expense;

    const user = await User.findById(userId);
    const monthlyBudget = user ? user.monthlyBudget : 0;

    const insights = [];
    if (savings > 0) insights.push(`You saved ₹${savings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} this month.`);
    else if (savings < 0) insights.push(`You spent ₹${Math.abs(savings).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} more than you earned this month.`);

    const categories = Object.keys(categoryData);
    if (categories.length > 0 && totalIncome > 0) {
        let topCat = categories[0], topAmt = categoryData[topCat];
        for (let cat in categoryData) {
            if (categoryData[cat] > topAmt) {
                topAmt = categoryData[cat]; topCat = cat;
            }
        }
        const pct = Math.round((topAmt / totalIncome) * 100);
        if (pct > 0) insights.push(`You spent ${pct}% of your overall income on ${topCat}.`);
    }

    if (monthlyBudget > 0) {
        const expensePct = Math.round((thisMonthData.expense / monthlyBudget) * 100);
        if (expensePct >= 100) insights.push(`Warning: You have exceeded your monthly budget by ${expensePct - 100}%.`);
        else if (expensePct >= 80) insights.push(`Caution: You have used ${expensePct}% of your monthly budget.`);
    }

    return {
        totalIncome,
        totalExpense,
        balance,
        savings,
        healthScore: Math.round(healthScore),
        categoryData,
        monthlyBudget,
        insights
    };
};

// @desc    Export PDF Report
// @route   POST /api/reports/export-pdf
// @access  Private
const exportPDF = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const data = await getReportData(req.user.id);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=financial_report.pdf');

        // This will pipe directly to res as it is passed as 3rd arg
        await generatePDFReport(user, data, res);
    } catch (error) {
        console.error('PDF Export Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server Error generating report', error: error.message });
        }
    }
};

const emailReport = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const data = await getReportData(req.user.id);

        console.log(`[REPORTS] Generating PDF Report for: ${user.email}`);
        // Generate PDF Buffer (res is omitted)
        const pdfBuffer = await generatePDFReport(user, data);
        console.log(`[SUCCESS] PDF Buffer generated (Size: ${pdfBuffer.length} bytes)`);

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2 style="color: #4338CA;">Your Monthly Financial Report</h2>
                <p>Hi ${user.name || 'there'},</p>
                <p>Please find your requested financial report attached to this email.</p>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>Total Income:</strong> ₹${data.totalIncome.toLocaleString('en-IN')}</li>
                        <li><strong>Total Expense:</strong> ₹${data.totalExpense.toLocaleString('en-IN')}</li>
                        <li><strong>Net Savings:</strong> ₹${data.savings.toLocaleString('en-IN')}</li>
                        <li><strong>Health Score:</strong> ${data.healthScore}/100</li>
                    </ul>
                </div>
                <p>Keep tracking your expenses to maintain a healthy budget!</p>
                <p style="font-size: 12px; color: #6b7280;">Sent via SmartTrack System</p>
            </div>
        `;

        const sent = await sendEmail({
            to: user.email,
            subject: 'SmartTrack - Your Financial Report',
            html: htmlContent,
            attachments: [
                {
                    filename: 'financial_report.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        });

        if (sent) {
            console.log(`[SUCCESS] Financial report emailed successfully to: ${user.email}`);
            res.status(200).json({ message: 'Report sent to your email successfully.' });
        } else {
            console.warn(`[WARNING] Email dispatch returned false for: ${user.email}`);
            res.status(500).json({ message: 'Could not send email. Please check server logs.' });
        }
    } catch (error) {
        console.error(`[ERROR] Email Report Process failed for ${req.user.id}:`, error.message);
        res.status(500).json({ message: 'Server Error emailing report', error: error.message });
    }
};

const exportCSV = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
        const incomes = await Income.find({ user: req.user.id }).sort({ date: -1 });

        let csv = 'Type,Title,Amount,Category,Date,Note\n';
        
        incomes.forEach(inc => {
            csv += `Income,${inc.title},${inc.amount},Income,${new Date(inc.date).toLocaleDateString()},${inc.note || ''}\n`;
        });
        
        expenses.forEach(exp => {
            csv += `Expense,${exp.title},${exp.amount},${exp.category},${new Date(exp.date).toLocaleDateString()},${exp.note || ''}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=financial_data.csv');
        res.status(200).send(csv);
    } catch (error) {
        console.error('CSV Export Error:', error);
        res.status(500).json({ message: 'Server Error exporting CSV', error: error.message });
    }
};

module.exports = {
    exportPDF,
    emailReport,
    exportCSV
};
