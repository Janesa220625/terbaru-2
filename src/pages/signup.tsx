import React from "react";
import SignupForm from "@/components/Auth/SignupForm";

const SignupPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Warehouse Inventory
          </h1>
          <p className="text-slate-500 mt-2">
            Create a new account to get started
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
