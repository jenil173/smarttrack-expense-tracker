const SplitExpense = require('../models/SplitExpense');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/emailService');

// @desc    Create a new split expense
// @route   POST /api/splits
// @access  Private
const createSplit = async (req, res) => {
    try {
        const { totalAmount, description, participants } = req.body;

        if (!totalAmount || !description || !participants || participants.length === 0) {
            return res.status(400).json({ message: 'Please provide totalAmount, description, and at least one participant' });
        }

        // Validate split amounts (sum of other participants shouldn't exceed total)
        const splitSum = participants.reduce((acc, p) => acc + Number(p.amount), 0);
        if (splitSum > totalAmount + 0.01) {
            return res.status(400).json({ message: `Split amounts (${splitSum}) cannot exceed total amount (${totalAmount})` });
        }

        // Process participants and detect SmartTrack users
        const processedParticipants = await Promise.all(participants.map(async (p) => {
            const foundUser = await User.findOne({ email: p.email.toLowerCase() });
            return {
                user: foundUser ? foundUser._id : null,
                email: p.email.toLowerCase(),
                amount: Number(p.amount),
                status: 'pending'
            };
        }));

        const splitExpense = await SplitExpense.create({
            payer: req.user.id,
            totalAmount,
            description,
            participants: processedParticipants
        });

        // Trigger Notifications
        for (const p of processedParticipants) {
            // 1. In-App Notification for registered users
            if (p.user) {
                await Notification.create({
                    user: p.user,
                    title: 'New Shared Expense',
                    message: `${req.user.name || req.user.email} added you to a shared expense: ${description} (Your share: ₹${p.amount})`,
                    type: 'info'
                });
            } else {
                // 2. Email Invitation for external users
                const inviteMessage = `
                    <div style="font-family: sans-serif; color: #333;">
                        <h2 style="color: #4338CA;">SmartTrack - Collaborative Split</h2>
                        <p>Hi there,</p>
                        <p><strong>${req.user.name || req.user.email}</strong> has added you to a shared expense on SmartTrack.</p>
                        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
                            <p><strong>Description:</strong> ${description}</p>
                            <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
                            <p><strong>Your Share:</strong> ₹${p.amount}</p>
                        </div>
                        <p>Want to track your own finances? Join SmartTrack today!</p>
                        <a href="http://localhost:5173/register" style="display: inline-block; background: #4338CA; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Create Free Account</a>
                        <p style="margin-top: 30px; font-size: 12px; color: #999;">Sent via SmartTrack Automated System</p>
                    </div>
                `;

                await sendEmail({
                    to: p.email,
                    subject: `SmartTrack Invitation: Shared Expense from ${req.user.name || 'a friend'}`,
                    html: inviteMessage
                });
            }
        }

        res.status(201).json(splitExpense);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get splits involved with user (payer or participant)
// @route   GET /api/splits
// @access  Private
const getMySplits = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find splits where user is the payer OR a participant
        const splits = await SplitExpense.find({
            $or: [
                { payer: userId },
                { 'participants.user': userId }
            ]
        })
        .populate('payer', 'name email')
        .populate('participants.user', 'name email')
        .sort({ createdAt: -1 });

        res.status(200).json(splits);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Settle a participant's share
// @route   PUT /api/splits/:id/settle
// @access  Private
const settleParticipant = async (req, res) => {
    try {
        const { participantId } = req.body;
        const splitId = req.params.id;

        const split = await SplitExpense.findById(splitId).populate('payer', 'email');
        if (!split) return res.status(404).json({ message: 'Split record not found' });

        // Find the participant entry
        const pIndex = split.participants.findIndex(p => p._id.toString() === participantId);
        if (pIndex === -1) return res.status(404).json({ message: 'Participant not found in this split' });

        const p = split.participants[pIndex];

        // Authorization: Only the payer OR the specific participant can settle
        const isPayer = split.payer._id.toString() === req.user.id;
        const isTargetParticipant = p.user && p.user.toString() === req.user.id;

        if (!isPayer && !isTargetParticipant) {
            return res.status(401).json({ message: 'Not authorized to settle this balance' });
        }

        // Toggle status or set to paid
        split.participants[pIndex].status = 'paid';

        // Check if all are paid to auto-settle the whole record
        const allSettled = split.participants.every(participant => participant.status === 'paid');
        if (allSettled) {
            split.status = 'settled';
        }

        await split.save();

        // Notify the other party
        if (isTargetParticipant) {
            await Notification.create({
                user: split.payer._id,
                title: 'Payment Received',
                message: `${req.user.name || req.user.email} marked their share of "${split.description}" as PAID (₹${p.amount}).`,
                type: 'success'
            });
        } else if (isPayer && p.user) {
            await Notification.create({
                user: p.user,
                title: 'Balance Settled',
                message: `${req.user.name || req.user.email} marked your share of "${split.description}" as SETTLED.`,
                type: 'success'
            });
        }

        res.status(200).json(split);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    createSplit,
    getMySplits,
    settleParticipant
};
