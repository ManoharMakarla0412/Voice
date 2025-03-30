"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BASE_URL } from "../../utils/constants";
import {
  User,
  Shield,
  CreditCard,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  Mail,
  Lock,
  Trash2,
  Save,
  AlertCircle,
  X,
  BadgeCheck,
} from "lucide-react";

interface User {
  username?: string;
  email?: string;
  plan?: string;
  billing?: string;
  billingCycleDays?: number;
  registrationDate?: string;
  _id?: string;
  assistant?: boolean;
  twilioNumbers?: any[];
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BASE_URL}/user/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile.");
        }

        const data = await response.json();
        setUser(data.data.user);
        if (data.data.user?.email) {
          setEmail(data.data.user.email);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdatePassword = () => {
    // Reset states
    setPasswordError(null);
    setUpdateSuccess(false);

    // Validate passwords
    if (!newPassword) {
      setPasswordError("Please enter a new password");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    // Handle password update logic here
    setUpdateSuccess(true);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = () => {
    if (confirmEmail !== email) {
      alert("Email confirmation does not match!");
      return;
    }

    if (confirmPhrase !== "DELETE MY ACCOUNT") {
      alert("Please type DELETE MY ACCOUNT to confirm");
      return;
    }

    // Handle account deletion logic here
    alert("Account deleted successfully");
    router.push("/dashboard");
  };

  // Format date to be more readable
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/70">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="alert alert-error max-w-md border-2 border-error/30">
          <AlertTriangle className="h-6 w-6" />
          <div>
            <h3 className="font-bold">Error</h3>
            <div className="text-sm">{error}</div>
          </div>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={() => setError(null)}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header with title and stats */}
        <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="avatar avatar-placeholder avatar-online">
                  <div className="bg-primary/20 text-primary-content rounded-full w-16 shadow-md">
                    <span className="text-2xl">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <User className="h-6 w-6 text-primary" />
                    {user?.username}
                  </h1>
                  <p className="text-base-content/80 mt-1">{user?.email}</p>
                </div>
              </div>

              {/* User Stats */}
              <div className="stats bg-base-200/60 shadow-md border border-base-200/30">
                <div className="stat">
                  <div className="flex items-center gap-2">
                    <BadgeCheck size={18} className="text-primary" />
                    <div className="stat-title font-medium">Account Status</div>
                  </div>
                  <div className="stat-value text-primary text-center">
                    {user?.plan || "Free"}
                  </div>
                  <div className="stat-desc text-center">Active Account</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg p-2">
          <div className="card-body p-2">
            <div className="tabs tabs-boxed bg-base-100/30 p-1 rounded-lg justify-center">
              <button
                className={`tab gap-2 ${
                  activeTab === "profile"
                    ? "tab-active bg-primary/10 text-primary"
                    : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <User size={16} />
                Profile
              </button>
              <button
                className={`tab gap-2 ${
                  activeTab === "security"
                    ? "tab-active bg-primary/10 text-primary"
                    : ""
                }`}
                onClick={() => setActiveTab("security")}
              >
                <Shield size={16} />
                Security
              </button>
              <button
                className={`tab gap-2 ${
                  activeTab === "billing"
                    ? "tab-active bg-primary/10 text-primary"
                    : ""
                }`}
                onClick={() => setActiveTab("billing")}
              >
                <CreditCard size={16} />
                Billing
              </button>
              <button
                className={`tab gap-2 ${
                  activeTab === "danger"
                    ? "tab-active bg-error/10 text-error"
                    : ""
                }`}
                onClick={() => setActiveTab("danger")}
              >
                <AlertTriangle size={16} />
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="text-primary" size={18} />
                <h2 className="font-bold text-lg">Profile Information</h2>
              </div>
              <p className="text-base-content/70 mb-4">
                View your account details and information
              </p>
              <div className="divider my-2"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-base">Username</span>
                  </label>
                  <input
                    type="text"
                    value={user?.username || ""}
                    disabled
                    className="input input-bordered bg-base-200/60 w-full"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-base">Email</span>
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="input input-bordered bg-base-200/60 w-full"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-base flex items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      Member Since
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formatDate(user?.registrationDate)}
                    disabled
                    className="input input-bordered bg-base-200/60 w-full"
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-base">Account Status</span>
                  </label>
                  <div className="flex items-center gap-3 h-14 px-4 bg-base-200/60 rounded-lg">
                    <div className="badge badge-success gap-1">
                      <div className="h-2 w-2 bg-current rounded-full"></div>
                      Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="text-primary" size={18} />
                <h2 className="font-bold text-lg">Security Settings</h2>
              </div>
              <p className="text-base-content/70 mb-4">
                Manage your password and account security
              </p>
              <div className="divider my-2"></div>

              {updateSuccess && (
                <div className="alert alert-success mb-6 border border-success/30">
                  <CheckCircle size={16} />
                  <div>
                    <h3 className="font-bold">Success</h3>
                    <div className="text-sm">
                      Password updated successfully!
                    </div>
                  </div>
                </div>
              )}

              {passwordError && (
                <div className="alert alert-error mb-6 border border-error/30">
                  <AlertCircle size={16} />
                  <div>
                    <h3 className="font-bold">Error</h3>
                    <div className="text-sm">{passwordError}</div>
                  </div>
                </div>
              )}

              <div className="max-w-md mx-auto mt-6 bg-base-200/60 p-6 rounded-lg border border-base-200/30">
                <div className="form-control w-full mb-6">
                  <label className="label mb-1">
                    <span className="label-text text-base flex items-center gap-2">
                      <Lock size={16} className="text-primary" />
                      New Password
                    </span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="input input-bordered w-full"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <label className="label mt-1">
                    <span className="label-text-alt">Minimum 8 characters</span>
                  </label>
                </div>

                <div className="form-control w-full mb-8">
                  <label className="label mb-1">
                    <span className="label-text text-base flex items-center gap-2">
                      <Lock size={16} className="text-primary" />
                      Confirm New Password
                    </span>
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="input input-bordered w-full"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary w-full gap-2"
                  onClick={handleUpdatePassword}
                >
                  <Save size={16} />
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div className="card bg-base-300/80 border-2 border-primary/30 shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="text-primary" size={18} />
                <h2 className="font-bold text-lg">Billing Information</h2>
              </div>
              <p className="text-base-content/70 mb-4">
                Manage your subscription and billing details
              </p>
              <div className="divider my-2"></div>

              <div className="stats stats-horizontal bg-base-200/60 shadow-md mb-8 w-full border border-base-200/30">
                <div className="stat">
                  <div className="stat-title">Current Plan</div>
                  <div className="stat-value text-primary">
                    {user?.plan || "Free"}
                  </div>
                  <div className="stat-desc">Pro Features Enabled</div>
                </div>

                <div className="stat">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <div className="stat-title">Billing Cycle</div>
                  </div>
                  <div className="stat-value">{user?.billing || "N/A"}</div>
                  <div className="stat-desc">
                    {user?.billingCycleDays || 0} days
                  </div>
                </div>
              </div>

              <div className="alert bg-info/10 border border-info/30 mb-8">
                <AlertCircle className="text-info" size={18} />
                <div>
                  <h3 className="font-bold">Information</h3>
                  <div className="text-sm">
                    Need to update your billing information? Visit the billing
                    portal.
                  </div>
                </div>
              </div>

              <div className="join join-vertical md:join-horizontal w-full gap-4">
                <button className="btn btn-primary join-item flex-1 gap-2">
                  <CreditCard size={16} />
                  Manage Subscription
                </button>
                <button className="btn btn-outline join-item flex-1 gap-2">
                  <Clock size={16} />
                  Billing History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Tab */}
        {activeTab === "danger" && (
          <div className="card bg-base-300/80 border-2 border-error/30 shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-error" size={18} />
                <h2 className="font-bold text-lg text-error">Delete Account</h2>
              </div>
              <p className="text-base-content/70 mb-4">
                Permanently delete your account and all associated data
              </p>
              <div className="divider my-2"></div>

              <div className="alert bg-warning/10 border border-warning/30 mb-8">
                <AlertTriangle className="text-warning" size={18} />
                <div>
                  <h3 className="font-bold">Warning!</h3>
                  <div>
                    <p className="mb-2">
                      This action cannot be undone. All your data will be
                      permanently removed including:
                    </p>
                    <ul className="list-disc ml-5 mt-2">
                      <li>Your account information</li>
                      <li>All conversation history</li>
                      <li>Saved preferences and settings</li>
                      <li>Subscription data</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="max-w-md mx-auto bg-base-200/60 p-6 rounded-lg border border-base-200/30">
                <div className="form-control w-full mb-6">
                  <label className="label mb-1">
                    <span className="label-text text-base flex items-center gap-2">
                      <Mail size={16} className="text-error" />
                      To confirm, please type your email address:
                    </span>
                  </label>
                  <div className="flex flex-col gap-1 mb-2">
                    <span className="text-sm font-medium text-base-content/80">
                      {user?.email}
                    </span>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="input input-bordered w-full mt-2"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-control w-full mb-8">
                  <label className="label mb-1">
                    <span className="label-text text-base flex items-center gap-2">
                      <AlertTriangle size={16} className="text-error" />
                      Type "DELETE MY ACCOUNT" to confirm:
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="DELETE MY ACCOUNT"
                    className="input input-bordered w-full"
                    value={confirmPhrase}
                    onChange={(e) => setConfirmPhrase(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-error w-full gap-2"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 size={16} />
                  Permanently Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
