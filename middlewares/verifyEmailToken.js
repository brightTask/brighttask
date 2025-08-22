const jwt = require('jsonwebtoken');
const { User, Wallet, Transaction, Referral } = require('../models');
require('dotenv').config();


function renderPage(title, message, type = "success") {
  const colors = {
    success: "#00bfa6",
    error: "#dc3545",
    info: "#ffc107"
  };

  const color = colors[type] || "#00bfa6";

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
      body {
        background: #f4f4f4;
        font-family: 'Segoe UI', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
      }
      .card {
        background: white;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 500px;
      }
      h1 {
        color: ${color};
        margin-bottom: 10px;
      }
      p {
        color: #444;
        font-size: 16px;
        line-height: 1.6;
      }
      .btn {
        margin-top: 20px;
        display: inline-block;
        padding: 12px 24px;
        background: ${color};
        color: white;
        border-radius: 8px;
        text-decoration: none;
        font-weight: bold;
        transition: background 0.3s ease;
      }
      .btn:hover {
        opacity: 0.9;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${title}</h1>
      <p>${message}</p>
      <a class="btn" href="${process.env.BASE_URL || '/'}">Continue to Website</a>
    </div>
  </body>
  </html>
  `;
}

async function verifyEmailToken(req, res) {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send(renderPage("Missing Token", "No verification token was provided in the URL.", "error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    const user = await User.findOne({ where: { email: decoded.email } }); // ✅ FIXED

    console.log(user);
    
    if (!user) {
      return res.status(404).send(renderPage("User Not Found", "We couldn't find a user associated with this token.", "error"));
    }

    if (user.email_verified) {
      return res.send(renderPage("Already Verified", "Your email has already been verified. You may now log in to your account.", "info"));
    }

    user.email_verified = true;
    await user.save();

    // Handle referral bonus if they were referred
    if (user.referredBy) {
      try {
        const referrer = await User.findOne({ where: { referralCode: user.referredBy } });

        if (referrer) {
          const rewardAmount = 0.43;

          // Check if referral already exists
          let referral = await Referral.findOne({
            where: {
              referrerId: referrer.id,
              refereeId: user.id
            }
          });

          if (!referral) {
            referral = await Referral.create({
              referrerId: referrer.id,
              refereeId: user.id,
              rewardAmount
            });

            // Update referrer's wallet
            let wallet = await Wallet.findOne({ where: { userId: referrer.id } });
            if (!wallet) {
              wallet = await Wallet.create({ userId: referrer.id, balance: 0 });
            }

            const balanceBefore = wallet.balance;
            wallet.balance += rewardAmount;
            await wallet.save();

            // Log transaction
            await Transaction.create({
              userId: referrer.id,
              type: 'referral',
              typeId: referral.id,
              direction: 'credit',
              amount: rewardAmount,
              fee: 0,
              netAmount: rewardAmount,
              balanceBefore,
              balanceAfter: wallet.balance,
              note: `Referral reward for inviting ${user.username}`
            });
          }
        }
      } catch (referralError) {
        console.error("Referral reward error:", referralError);
        // You may choose to continue or fail silently
      }
    }

    // Send success message
    return res.send(renderPage(
      "Email Verified",
      "Your email has been verified successfully! You may now log in.",
      "success"
    ));

  } catch (err) {
    console.error("Verification error:", err);
    return res.status(400).send(renderPage("Invalid or Expired Token", "This verification link is invalid or has expired.", "error"));
  }
}



module.exports = verifyEmailToken;
