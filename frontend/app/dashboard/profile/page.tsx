'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BASE_URL } from '../../utils/constants';
const Profile = () => {
  const [email, setEmail] = useState('codethebug3@gmail.com');
  const [newPassword, setNewPassword] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const router = useRouter();

  const [user, setUser] = useState<any>(null); // State to store user data
  const [loading, setLoading] = useState(true); // State to manage loading
  const [error, setError] = useState<string | null>(null); // State to manage errors

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch the user profile data
        const response = await fetch(`${BASE_URL}/user/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`, // Pass the token from localStorage
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile.");
        }

        const data = await response.json();
        setUser(data.user); // Set the user data
      } catch (err: any) {
        setError(err.message); // Handle errors
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchProfile();
  }, []);

  const handleUpdatePassword = () => {
    // Handle password update logic here
    alert('Password updated successfully');
  };

  const handleDeleteAccount = () => {
    if (confirmEmail !== email) {
      alert('Email confirmation does not match!');
      return;
    }
    // Handle account deletion logic here
    alert( "Account deleted successfully",
    )
    router.push("/dashboard")
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C] rounded-md flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Account</h1>

      <div className="w-full max-w-xl space-y-8">
        {/* Settings Section */}
        <div className="bg-[#1a1c1e] p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-white mb-2">Settings</h2>
          <p className="text-sm text-gray-400 mb-4">
            Customize your account details.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full bg-gray-700 text-gray-200 px-4 py-2 rounded-lg border border-gray-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-gray-700 text-gray-200 px-4 py-2 rounded-lg border border-gray-600 focus:outline-hidden"
              />
            </div>
            <button
              onClick={handleUpdatePassword}
              className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
            >
              Update New Password
            </button>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="bg-[#1a1c1e] p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-white mb-2">Delete Account</h2>
          <p className="text-sm text-gray-400 mb-4">
            Permanently remove your account and all its contents. Proceed with
            caution.
          </p>
          <p className="text-sm text-gray-400 mb-2">
            To confirm, please type your email address: <span className="text-gray-200 font-semibold">{user?.email}</span>
          </p>
          <div>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-gray-700 text-gray-200 px-4 py-2 rounded-lg border border-gray-600 focus:outline-hidden mb-4"
            />
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-[#d63f47] text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
