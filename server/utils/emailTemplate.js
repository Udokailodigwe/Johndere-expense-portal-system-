// Simple email template for manager when expense is submitted
export const expenseSubmittedTemplate = (manager, employee, expense) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 15px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .detail { margin: 10px 0; }
    .label { font-weight: bold; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Expense Submission</h2>
    </div>
    
    <div class="content">
      <p>Hello ${manager.name},</p>
      
      <p>${employee.name} has submitted a new expense for approval.</p>
      
      <div style="margin: 20px 0; padding: 15px; background-color: white; border-left: 3px solid #4CAF50;">
        <div class="detail">
          <span class="label">Amount:</span> $${expense.amount}
        </div>
        <div class="detail">
          <span class="label">Category:</span> ${expense.category.replace(
            /_/g,
            " "
          )}
        </div>
        <div class="detail">
          <span class="label">Description:</span> ${expense.description}
        </div>
        <div class="detail">
          <span class="label">Date:</span> ${new Date(
            expense.expenseDate
          ).toLocaleDateString()}
        </div>
        <div class="detail">
          <span class="label">Submitted by:</span> ${employee.name} (${
    employee.email
  })
        </div>
        ${
          expense.notes
            ? `<div class="detail"><span class="label">Notes:</span> ${expense.notes}</div>`
            : ""
        }
      </div>
      
      <p>Please log in to the portal to review and approve this expense.</p>
      
      <p>
        <a href="${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/pending-expenses" 
           style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Review Expense
        </a>
      </p>
    </div>
    
    <div class="footer">
      <p>John Deere Internal Expense Reimbursement Portal</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Simple email template for employee when expense is approved/rejected
export const expenseStatusUpdateTemplate = (
  employee,
  expense,
  manager,
  status,
  rejectReason = null
) => {
  const isApproved = status === "approved";
  const color = isApproved ? "#4CAF50" : "#f44336";

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: ${color}; color: white; padding: 15px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .detail { margin: 10px 0; }
    .label { font-weight: bold; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    .rejection-box { background-color: #fff3cd; border: 1px solid #ffc107; padding: 10px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Expense ${isApproved ? "Approved" : "Rejected"}</h2>
    </div>
    
    <div class="content">
      <p>Hello ${employee.name},</p>
      
      <p>Your expense has been <strong>${status}</strong> by ${
    manager.name
  }.</p>
      
      <div style="margin: 20px 0; padding: 15px; background-color: white; border-left: 3px solid ${color};">
        <div class="detail">
          <span class="label">Amount:</span> $${expense.amount}
        </div>
        <div class="detail">
          <span class="label">Category:</span> ${expense.category.replace(
            /_/g,
            " "
          )}
        </div>
        <div class="detail">
          <span class="label">Description:</span> ${expense.description}
        </div>
        <div class="detail">
          <span class="label">Expense Date:</span> ${new Date(
            expense.expenseDate
          ).toLocaleDateString()}
        </div>
        <div class="detail">
          <span class="label">${
            isApproved ? "Approved" : "Rejected"
          } by:</span> ${manager.name}
        </div>
        <div class="detail">
          <span class="label">Decision Date:</span> ${new Date().toLocaleDateString()}
        </div>
      </div>
      
      ${
        !isApproved && rejectReason
          ? `
      <div class="rejection-box">
        <div class="label">Rejection Reason:</div>
        <p>${rejectReason}</p>
      </div>
      `
          : ""
      }
      
      ${
        isApproved
          ? "<p>Your reimbursement will be processed within 5-7 business days.</p>"
          : "<p>Please contact your manager if you have questions about this decision.</p>"
      }
      
      <p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/${
    isApproved ? "resolved-expenses" : "my-expenses"
  }" 
           style="display: inline-block; background-color: ${color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          View ${isApproved ? "Resolved" : "My"} Expenses
        </a>
      </p>
    </div>
    
    <div class="footer">
      <p>John Deere Internal Expense Reimbursement Portal</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Simple email template for employee confirmation when expense is created
export const expenseCreatedConfirmationTemplate = (employee, expense) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2196F3; color: white; padding: 15px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .detail { margin: 10px 0; }
    .label { font-weight: bold; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Expense Submitted Successfully</h2>
    </div>
    
    <div class="content">
      <p>Hello ${employee.name},</p>
      
      <p>Your expense has been submitted successfully and is pending approval.</p>
      
      <div style="margin: 20px 0; padding: 15px; background-color: white; border-left: 3px solid #2196F3;">
        <div class="detail">
          <span class="label">Amount:</span> $${expense.amount}
        </div>
        <div class="detail">
          <span class="label">Category:</span> ${expense.category.replace(
            /_/g,
            " "
          )}
        </div>
        <div class="detail">
          <span class="label">Description:</span> ${expense.description}
        </div>
        <div class="detail">
          <span class="label">Expense Date:</span> ${new Date(
            expense.expenseDate
          ).toLocaleDateString()}
        </div>
        <div class="detail">
          <span class="label">Submitted:</span> ${new Date().toLocaleDateString()}
        </div>
        ${
          expense.notes
            ? `<div class="detail"><span class="label">Notes:</span> ${expense.notes}</div>`
            : ""
        }
      </div>
      
      <p>You will receive an email notification once your expense has been reviewed.</p>
      
      <p>
        <a href="${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/my-expenses" 
           style="display: inline-block; background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          View My Expenses
        </a>
      </p>
    </div>
    
    <div class="footer">
      <p>John Deere Internal Expense Reimbursement Portal</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
};
