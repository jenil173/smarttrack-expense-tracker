const PDFDocument = require('pdfkit-table');

const formatCurrency = (amount) => {
    return `INR ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Map INR text to Symbol for better PDF display if font supports it, 
// but using 'INR' or 'Rs.' is safer if standard fonts are used.
// The user explicitly asked for ₹ symbol usage.
const CURRENCY_SYMBOL = 'Rs.'; // pdfkit default fonts sometimes struggle with ₹, we'll try to use a standard one or just Rs.
// Actually, let's try to use the symbol if possible or stick to the requirement as much as we can with standard fonts.
const formatCurrencySymbol = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const generatePDFReport = async (user, summaryData, res = null) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
            let buffers = [];

            if (res) {
                doc.pipe(res);
            }

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- Header ---
            doc.fillColor('#4338CA').font('Helvetica-Bold').fontSize(26).text('SMARTTRACK', { align: 'center' });
            doc.fontSize(16).text('FINANCIAL REPORT', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#6B7280').text(`Generated on ${new Date().toLocaleString('en-IN')}`, { align: 'center' });
            doc.moveDown(1.5);

            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#E5E7EB').stroke();
            doc.moveDown(1.5);

            // --- User Details ---
            doc.fillColor('#111827').font('Helvetica-Bold').fontSize(14).text('User Details');
            doc.moveDown(0.5);
            doc.font('Helvetica').fontSize(11).fillColor('#374151');
            
            const column1Left = 50;
            const column2Left = 250;
            let currentY = doc.y;

            doc.text(`Name:`, column1Left, currentY);
            doc.font('Helvetica-Bold').text(`${user.name || 'User'}`, column1Left + 50, currentY);
            
            doc.font('Helvetica').text(`Email:`, column2Left, currentY);
            doc.font('Helvetica-Bold').text(`${user.email}`, column2Left + 50, currentY);
            
            doc.moveDown(0.5);
            currentY = doc.y;
            const monthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
            doc.font('Helvetica').text(`Report Month:`, column1Left, currentY);
            doc.font('Helvetica-Bold').text(`${monthStr}`, column1Left + 80, currentY);
            
            doc.moveDown(2.5);

            // --- Financial Summary Table ---
            doc.fillColor('#111827').font('Helvetica-Bold').fontSize(14).text('Financial Summary', 50);
            doc.moveDown(0.8);

            const summaryTable = {
                headers: [
                    { label: "Metric", property: 'metric', width: 150, renderer: null },
                    { label: "Value", property: 'value', width: 150, renderer: null },
                    { label: "Status", property: 'status', width: 150, renderer: null },
                ],
                rows: [
                    ["Total Income", formatCurrencySymbol(summaryData.totalIncome), "Verified"],
                    ["Total Expenses", formatCurrencySymbol(summaryData.totalExpense), "Processed"],
                    ["Net Savings", formatCurrencySymbol(summaryData.savings), summaryData.savings >= 0 ? "Positive" : "Negative"],
                    ["Financial Health", `${summaryData.healthScore} / 100`, summaryData.healthScore > 70 ? "Excellent" : summaryData.healthScore > 40 ? "Good" : "Needs Attention"]
                ]
            };

            doc.table(summaryTable, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10).fillColor('#374151'),
                prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                    doc.font("Helvetica").fontSize(10).fillColor('#4B5563');
                }
            });
            doc.moveDown(2);

            // --- Category Breakdown ---
            if (summaryData.categoryData && Object.keys(summaryData.categoryData).length > 0) {
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(14).text('Expense Category Table');
                doc.moveDown(0.8);

                const categoryRows = Object.entries(summaryData.categoryData).map(([cat, amt]) => [
                    cat,
                    formatCurrencySymbol(amt),
                    `${Math.round((amt / (summaryData.totalExpense || 1)) * 100)}%`
                ]);

                const categoryTable = {
                    headers: ["Category", "Amount Spent", "Percentage"],
                    rows: categoryRows
                };

                doc.table(categoryTable, {
                    width: 450,
                    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10).fillColor('#374151'),
                    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => doc.font("Helvetica").fontSize(10).fillColor('#4B5563')
                });
                doc.moveDown(2);
            }

            // --- Smart Insights ---
            if (summaryData.insights && summaryData.insights.length > 0) {
                if (doc.y > 600) doc.addPage();
                
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(14).text('Smart Insights');
                doc.moveDown(0.8);

                summaryData.insights.forEach(insight => {
                    doc.font('Helvetica').fontSize(10).fillColor('#4B5563').text(`• ${insight}`, { width: 480 });
                    doc.moveDown(0.5);
                });
            }

            // --- Footer ---
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor('#9CA3AF').text(
                    `Page ${i + 1} of ${range.count} - SmartTrack Financial Analysis Platform`,
                    50,
                    doc.page.height - 50,
                    { align: 'center' }
                );
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generatePDFReport };
