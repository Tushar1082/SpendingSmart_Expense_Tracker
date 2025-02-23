# Spending Smart - Expense Tracker

![Spending Smart](https://github.com/user-attachments/assets/4f8500e3-1b16-47f7-b500-33d44fbfd848)


Spending Smart is a **MERN stack-based** expense tracking web application designed to help users **manage individual, group, and travel expenses** effectively. It includes financial planning tools, analytics, and secure transactions, making expense management effortless.

## Features

### 🔐 User Authentication
- Secure login/signup using **Firebase Authentication**.
- Profile image storage via **Firebase Storage**.

### 💰 Expense Management
- Track **individual, group, and travel expenses**.
- Manage **recurring expenses** and **saving goals**.
- Advanced analytics for expense insights.
- Secure payer-payee transactions displayed on the homepage.

### 👥 Group Expense Handling
- Create and manage groups with **admin controls**.
- Add and search friends for easy expense sharing.
- Payment requests and settlements using **Razorpay**.

### ⚡ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas)
- **Authentication & Storage:** Firebase
- **Payments:** Razorpay

## Installation

### Prerequisites
- Node.js (>=16.x)
- MongoDB Atlas (or local MongoDB instance)

### Steps to Run Locally

1. **Clone the repository**
   ```sh
   git clone https://github.com/yourusername/spending-smart.git
   cd spending-smart
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Set up environment variables**
   - Create a `.env` file in the root directory and add:
     ```env
     MONGO_URI=your_mongodb_connection_string
     FIREBASE_API_KEY=your_firebase_api_key
     RAZORPAY_KEY=your_razorpay_key
     ```
4. **Start the backend server**
   ```sh
   npm run server
   ```
5. **Start the frontend**
   ```sh
   npm run dev
   ```

## Screenshots

### 📌 Homepage
![Homepage](https://github.com/user-attachments/assets/11475b27-6822-47f9-a6e6-7e2b555992c3)
![Homepage-2](https://github.com/user-attachments/assets/6924a290-11f1-44ea-906b-13bc2fe66fbe)
![Homepage-3]](https://github.com/user-attachments/assets/40eb820e-2fd2-4516-a6ae-88682a53b485)
![Homepage-4]](https://github.com/user-attachments/assets/22c94919-d1e6-471e-93fe-71efd3386a16)


### 📌 Group Expense Management
![Group Management](https://github.com/user-attachments/assets/d3511d7e-d2af-479a-acd9-f7d4aed004aa)
![Request Money Through Request Button](https://github.com/user-attachments/assets/dd9dfda1-85da-4458-943c-216a4f5fce14)

### 📌 Expense Analytics
![](screenshots/analytics.png)
![Expense Analytics-1](https://github.com/user-attachments/assets/52b09b6a-0a9b-4b0d-85ed-ac7d64b254eb)
![Expense Analytics-2](https://github.com/user-attachments/assets/890ff1a5-d0e2-43d0-8afe-9324bf196916)

