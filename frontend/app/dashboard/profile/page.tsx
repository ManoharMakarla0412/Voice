"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BASE_URL } from "../../utils/constants"

interface User {
  username?: string
  email?: string
  plan?: string
  billing?: string
  billingCycleDays?: number
  registrationDate?: string
  _id?: string
  assistant?: boolean
  twilioNumbers?: any[]
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile")
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [confirmPhrase, setConfirmPhrase] = useState("")
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BASE_URL}/user/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch user profile.")
        }

        const data = await response.json()
        setUser(data.data.user)
        if (data.data.user?.email) {
          setEmail(data.data.user.email)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleUpdatePassword = () => {
    // Reset states
    setPasswordError(null)
    setUpdateSuccess(false)

    // Validate passwords
    if (!newPassword) {
      setPasswordError("Please enter a new password")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match")
      return
    }

    // Handle password update logic here
    setUpdateSuccess(true)
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleDeleteAccount = () => {
    if (confirmEmail !== email) {
      alert("Email confirmation does not match!")
      return
    }

    if (confirmPhrase !== "DELETE MY ACCOUNT") {
      alert("Please type DELETE MY ACCOUNT to confirm")
      return
    }

    // Handle account deletion logic here
    alert("Account deleted successfully")
    router.push("/dashboard")
  }

  // Format date to be more readable
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="alert alert-error max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <h3 className="font-bold">Error</h3>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Profile Header */}
      <div className="hero bg-base-100 mb-8 rounded-box shadow-xl border border-base-300">
        <div className="hero-content flex-col md:flex-row py-8">
          <div className="avatar avatar-placeholder avatar-online">
            <div className="bg-primary text-primary-content rounded-full w-24 shadow-md">
              <span className="text-3xl">{user?.username?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <div className="text-center md:text-left md:ml-4">
            <h1 className="text-3xl font-bold">{user?.username}</h1>
            <p className="text-base-content/70 mt-2">{user?.email}</p>
            <div className="mt-3">
              <span className="badge badge-primary badge-lg">{user?.plan} Plan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-8 justify-center bg-base-100 p-1 rounded-full shadow-md">
        <button 
          className={`tab tab-lg ${activeTab === "profile" ? "tab-active" : ""}`} 
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button 
          className={`tab tab-lg ${activeTab === "security" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          Security
        </button>
        <button 
          className={`tab tab-lg ${activeTab === "billing" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("billing")}
        >
          Billing
        </button>
        <button 
          className={`tab tab-lg ${activeTab === "danger" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("danger")}
        >
          Delete Account
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-8">
            <h2 className="card-title text-2xl mb-2">Profile Information</h2>
            <p className="text-base-content/70 mb-4">View your account details and information</p>
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
                  className="input input-bordered w-full mt-2 bg-base-300/50" 
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
                  className="input input-bordered w-full mt-2 bg-base-300/50" 
                />
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base">Member Since</span>
                </label>
                <input 
                  type="text" 
                  value={formatDate(user?.registrationDate)} 
                  disabled 
                  className="input input-bordered w-full mt-2 bg-base-300/50" 
                />
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base">Account Status</span>
                </label>
                <div className="flex items-center gap-3 h-14 px-4 bg-base-300/30 rounded-lg border border-base-300 mt-2">
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
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-8">
            <h2 className="card-title text-2xl mb-2">Security Settings</h2>
            <p className="text-base-content/70 mb-4">Manage your password and account security</p>
            <div className="divider my-2"></div>
            
            {updateSuccess && (
              <div className="alert alert-success mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <h3 className="font-bold">Success</h3>
                  <div className="text-sm">Password updated successfully!</div>
                </div>
              </div>
            )}
            
            {passwordError && (
              <div className="alert alert-error mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <h3 className="font-bold">Error</h3>
                  <div className="text-sm">{passwordError}</div>
                </div>
              </div>
            )}
            
            <div className="max-w-md mx-auto mt-6 bg-base-300/20 p-6 rounded-lg shadow-inner">
              <div className="form-control w-full mb-6">
                <label className="label mb-1">
                  <span className="label-text text-base">New Password</span>
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
                  <span className="label-text text-base">Confirm New Password</span>
                </label>
                <input 
                  type="password" 
                  placeholder="Confirm new password" 
                  className="input input-bordered w-full" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <button className="btn btn-primary w-full" onClick={handleUpdatePassword}>
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-8">
            <h2 className="card-title text-2xl mb-2">Billing Information</h2>
            <p className="text-base-content/70 mb-4">Manage your subscription and billing details</p>
            <div className="divider my-2"></div>
            
            <div className="stats stats-horizontal bg-base-300/30 shadow-md mb-8 w-full border border-base-300">
              <div className="stat">
                <div className="stat-title">Current Plan</div>
                <div className="stat-value text-primary">{user?.plan || "Free"}</div>
                <div className="stat-desc">Pro Features Enabled</div>
              </div>
              
              <div className="stat">
                <div className="stat-title">Billing Cycle</div>
                <div className="stat-value">{user?.billing || "N/A"}</div>
                <div className="stat-desc">{user?.billingCycleDays || 0} days</div>
              </div>
            </div>
            
            <div className="alert alert-info mb-8 bg-info/20 border border-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div>
                <h3 className="font-bold">Information</h3>
                <div className="text-sm">Need to update your billing information? Visit the billing portal.</div>
              </div>
            </div>
            
            <div className="join join-vertical md:join-horizontal w-full gap-4">
              <button className="btn btn-primary join-item flex-1">Manage Subscription</button>
              <button className="btn btn-outline join-item flex-1">Billing History</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Tab */}
      {activeTab === "danger" && (
        <div className="card bg-base-100 shadow-xl border border-error/30">
          <div className="card-body p-8">
            <h2 className="card-title text-2xl mb-2 text-error">Delete Account</h2>
            <p className="text-base-content/70 mb-4">Permanently delete your account and all associated data</p>
            <div className="divider my-2"></div>
            
            <div className="alert alert-warning mb-8 bg-warning/20 border border-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-warning shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div>
                <h3 className="font-bold">Warning!</h3>
                <div>
                  <p className="mb-2">This action cannot be undone. All your data will be permanently removed including:</p>
                  <ul className="list-disc ml-5 mt-2">
                    <li>Your account information</li>
                    <li>All conversation history</li>
                    <li>Saved preferences and settings</li>
                    <li>Subscription data</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="max-w-md mx-auto bg-base-300/20 p-6 rounded-lg shadow-inner">
              <div className="form-control w-full mb-6">
                <label className="label mb-1">
                  <span className="label-text text-base">To confirm, please type your email address:</span>
                </label>
                <div className="flex flex-col gap-1 mb-2">
                  <span className="text-sm font-medium text-base-content/80">{user?.email}</span>
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
                  <span className="label-text text-base">Type "DELETE MY ACCOUNT" to confirm:</span>
                </label>
                <input 
                  type="text" 
                  placeholder="DELETE MY ACCOUNT" 
                  className="input input-bordered w-full" 
                  value={confirmPhrase}
                  onChange={(e) => setConfirmPhrase(e.target.value)}
                />
              </div>
              
              <button className="btn btn-error w-full" onClick={handleDeleteAccount}>
                Permanently Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile