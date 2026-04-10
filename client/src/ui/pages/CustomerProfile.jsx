import React, { useEffect, useState } from "react";
import { Container } from "../shared/Container";
import { getMyUserProfile, updateMyUserProfile } from "../services/user";
import { useAuth } from "../context/AuthContext";

export function CustomerProfile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ 
    name: "", 
    email: "", 
    phoneNumber: "", 
    dob: "", 
    profileImageFile: null 
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalForm, setOriginalForm] = useState({});

  // Prevent stale state from a previous user session.
  useEffect(() => {
    setProfile(null);
    setProfileForm({ name: "", email: "", phoneNumber: "", dob: "", profileImageFile: null });
    setOriginalForm({});
    setErr("");
    setIsEditMode(false);
    setImagePreview(null);
  }, [token]);

  async function loadProfile() {
    setErr("");
    setLoading(true);
    try {
      const profileRes = await getMyUserProfile();
      const p = profileRes?.data || null;
      setProfile(p);
      const form = {
        name: p?.name || p?.username || "", // Fallback to username if name is missing
        email: p?.email || "",
        phoneNumber: p?.phoneNumber || "",
        dob: p?.dob || "",
        profileImageFile: null,
      };
      setProfileForm(form);
      setOriginalForm(form);
      setImagePreview(null);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile().catch(() => {});
  }, [token]);

  async function onSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    setErr("");
    try {
      const res = await updateMyUserProfile(profileForm);
      const updated = res?.data || null;
      setProfile(updated);
      const form = {
        name: updated?.name || updated?.username || "", // Fallback to username if name is missing
        email: updated?.email || "",
        phoneNumber: updated?.phoneNumber || "",
        dob: updated?.dob || "",
        profileImageFile: null,
      };
      setProfileForm(form);
      setOriginalForm(form);
      setImagePreview(null);
      setIsEditMode(false);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Profile update failed.");
    } finally {
      setSavingProfile(false);
    }
  }

  function handleEditClick() {
    setIsEditMode(true);
    setOriginalForm({ ...profileForm });
  }

  function handleCancelClick() {
    setProfileForm({ ...originalForm });
    setImagePreview(null);
    setIsEditMode(false);
    setErr("");
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0] || null;
    
    // Validate file type
    if (file && !file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setErr("Please select a valid image file (JPG or PNG)");
      return;
    }
    
    setProfileForm((p) => ({ ...p, profileImageFile: file }));
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  function getDisplayImage() {
    if (imagePreview) return imagePreview;
    if (profile?.profileImage) return profile.profileImage;
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%239ca3af'/%3E%3Cpath d='M30 70 Q50 55 70 70 L70 85 Q50 95 30 85 Z' fill='%239ca3af'/%3E%3C/svg%3E";
  }

  if (loading) {
    return (
      <Container className="py-10">
        <div className="text-center">Loading profile...</div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-semibold text-slate-900">My Profile</h1>
      <p className="mt-2 text-slate-600">Manage your personal information and profile picture.</p>

      <div className="mt-6 rounded-2xl border bg-white p-6">
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <img
              src={getDisplayImage()}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-slate-200 mx-auto"
            />
            {isEditMode && (
              <div className="absolute bottom-0 right-0 bg-slate-900 text-white rounded-full p-2 cursor-pointer hover:bg-slate-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={onSaveProfile} className="grid gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900">Personal Information</h2>
            {!isEditMode ? (
              <button
                type="button"
                onClick={handleEditClick}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelClick}
                  disabled={savingProfile}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50"
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                readOnly={!isEditMode}
                disabled={!isEditMode}
                style={{ backgroundColor: isEditMode ? 'white' : '#f8fafc' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={profileForm.email}
                readOnly
                disabled
                style={{ backgroundColor: '#f8fafc' }}
              />
              <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={profileForm.phoneNumber}
                onChange={(e) => setProfileForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                readOnly={!isEditMode}
                disabled={!isEditMode}
                style={{ backgroundColor: isEditMode ? 'white' : '#f8fafc' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Date of Birth</label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={profileForm.dob || ""}
                onChange={(e) => setProfileForm((p) => ({ ...p, dob: e.target.value }))}
                readOnly={!isEditMode}
                disabled={!isEditMode}
                style={{ backgroundColor: isEditMode ? 'white' : '#f8fafc' }}
              />
            </div>
          </div>

          {isEditMode && (
            <div>
              <label className="text-sm font-medium text-slate-700">Profile Image</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
              <p className="mt-1 text-xs text-slate-500">Supported formats: JPG, PNG. Maximum size: 5MB</p>
              {imagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-slate-600 mb-1">New image preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-300"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <div className="text-sm text-slate-600 self-center">
              Member since: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
        </form>

        {err ? <div className="mt-4 text-sm rounded-lg bg-rose-50 text-rose-800 px-3 py-2">{err}</div> : null}
      </div>
    </Container>
  );
}
