import React from "react";
import * as XLSX from "xlsx";

const TestData = [
  {
    _id: "123",
    group_id: "group1",
    expense_id: "exp001",
    title: "Groceries",
    amount: 1500,
    date: "2024-02-14",
  },
  {
    _id: "456",
    group_id: "group2",
    expense_id: "exp002",
    title: "Rent",
    amount: 8000,
    date: "2024-02-01",
  },
  {
    _id: "789",
    group_id: "group3",
    expense_id: "exp003",
    title: "Internet Bill",
    amount: 700,
    date: "2024-02-10",
  },
];

const ExportToExcel = ({ expenses }) => {
  const exportToExcel = () => {
    if (!expenses || expenses.length === 0) {
      alert("No data to export!");
      return;
    }

    // Remove _id, group_id, and expense_id & add Serial Number
    const filteredExpenses = expenses.map(({ _id, group_id, expense_id, ...rest }, index) => ({
      "S.No": index + 1,
      ...rest,
    }));

    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredExpenses);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 5 },  // S.No
      { wch: 20 }, // Title
      { wch: 10 }, // Amount
      { wch: 15 }, // Date
    ];

    // Apply left alignment to amount column
    Object.keys(worksheet).forEach((cell) => {
      if (cell.startsWith("C") && cell !== "C1") {
        worksheet[cell].s = { alignment: { horizontal: "left" } };
      }
    });

    // Create a new workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "expenses.xlsx");
  };

  return <button onClick={exportToExcel}>Download Excel</button>;
};

export default function Reports() {
  return <ExportToExcel expenses={TestData} />;
}
