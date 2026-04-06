import {
  MdDashboard,
  MdReceipt,
  MdAddCircle,
  MdCheckCircle,
  MdPendingActions,
  MdSettings,
  MdLogout,
} from "react-icons/md";

// create more paths for admin seprate business logics

const links = [
  {
    id: 1,
    text: "Home",
    path: "index",
    icon: <MdDashboard />,
    role: ["employee", "manager"],
  },
  {
    id: 2,
    text: "My Expenses",
    path: "my-expenses",
    icon: <MdReceipt />,
    role: ["employee", "manager"],
  },
  {
    id: 3,
    text: "Submit New Expense",
    path: "add-expense",
    icon: <MdAddCircle />,
    role: ["employee", "manager"],
  },
  {
    id: 4,
    text: "Employees Pending Expenses",
    path: "pending-expenses",
    icon: <MdPendingActions />,
    role: ["manager"],
  },
  {
    id: 5,
    text: "Employees Resolved Expenses",
    path: "employees-resolved-expenses",
    icon: <MdCheckCircle />,
    role: ["manager"],
  },
  {
    id: 6,
    text: "Resolved Expenses",
    path: "resolved-expenses",
    icon: <MdCheckCircle />,
    role: ["employee", "manager"],
  },

  {
    id: 7,
    text: "Settings",
    path: "settings",
    icon: <MdSettings />,
    role: ["employee", "manager"],
  },
  {
    id: 9,
    text: "Logout",
    path: "activate-account?form=login",
    icon: <MdLogout />,
    role: ["employee", "manager"],
  },
];

export default links;
