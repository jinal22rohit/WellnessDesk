import React, { useEffect, useMemo, useState } from "react";
import { Container } from "../shared/Container";
import { completeBooking, getMyEmployeeBookings } from "../services/booking";
import { BookingCard } from "../components/BookingCard";
import { getMyEmployeeProfile, updateMyEmployeeProfile } from "../services/employee";
import { getUserById } from "../services/user";
import { useAuth } from "../context/AuthContext";

export function EmployeeDashboard({ employeeId }) {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ empName: "", dob: "", email: "", phno: "", empImgFile: null, username: "", password: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalForm, setOriginalForm] = useState({});
  
  const [empTab, setEmpTab] = useState("upcoming");
  const [empShowCount, setEmpShowCount] = useState(4);

   const empUpcoming = useMemo(() => bookings.filter((b) => b.status === "booked"), [bookings]);
   const empCompleted = useMemo(() => bookings.filter((b) => b.status === "completed"), [bookings]);
  const empCancelled = useMemo(() => bookings.filter((b) => b.status === "cancelled"), [bookings]);

  async function loadEmployeeById(userId) {
    setErr("");
    setLoading(true);
    try {
      const [userRes, profileRes] = await Promise.all([getUserById(userId), getMyEmployeeProfile()]);
      const userData = userRes?.data?.data || null;
      const profileData = profileRes?.data || null;

      setProfile(profileData);
      const form = {
        empName: profileData?.empName || "",
        dob: profileData?.dob ? profileData.dob.split("T")[0] : "",
        email: profileData?.email || "",
        phno: profileData?.phoneNumber || "",   // ✅ phoneNumber not phno
        empImgFile: null,
        username: profileData?.username || userData?.username || "",  // ✅ root level
        password: "",
      };
      setProfileForm(form);
      setOriginalForm(form);
      setImagePreview(null);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load employee data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadProfileAndBookings() {
    setErr("");
    setLoading(true);
    try {
      const [profileRes, bookingsRes] = await Promise.all([getMyEmployeeProfile(), getMyEmployeeBookings()]);
      const p = profileRes?.data || null;
      setProfile(p);
      const form = {
        empName: p?.empName || "",
        dob: p?.dob ? p.dob.split("T")[0] : "",
        email: p?.email || "",
        phno: p?.phoneNumber || "",    // ✅ backend returns phoneNumber not phno
        empImgFile: null,
        username: p?.username || "",   // ✅ backend returns username at root level
        password: "",
      };
      setProfileForm(form);
      setOriginalForm(form);
      setImagePreview(null);
      setBookings(bookingsRes?.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load employee dashboard.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (employeeId) {
      loadEmployeeById(employeeId).catch(() => {});
    } else {
      loadProfileAndBookings().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, employeeId]);

  async function refresh() {
    try {
      const res = await getMyEmployeeBookings();
      setBookings(res?.data || []);
    } catch {}
  }

  const today = useMemo(() => bookings, [bookings]);

  // ✅ FIXED — re-fetch fresh profile after save instead of using stale update response
  async function onSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    setErr("");
    try {
      const res = await updateMyEmployeeProfile(profileForm);
      if (!res?.success) throw new Error(res?.message || "Update failed");

      // Re-fetch fresh data
      const profileRes = await getMyEmployeeProfile();
      const p = profileRes?.data || null;
      setProfile(p);
      const form = {
        empName: p?.empName || "",
        dob: p?.dob ? p.dob.split("T")[0] : "",
        email: p?.email || "",
        phno: p?.phoneNumber || "",    // ✅ phoneNumber
        empImgFile: null,
        username: p?.username || "",   // ✅ root level
        password: "",
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
    setProfileForm((p) => ({ ...p, empImgFile: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  function getDisplayImage() {
    if (imagePreview) return imagePreview;
    if (profile?.empImg) return profile.empImg;
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-family='sans-serif' font-size='14' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
  }

  async function onComplete(b) {
    setActionLoadingId(b._id);
    setBookings((prev) => prev.map((x) => (x._id === b._id ? { ...x, status: "completed" } : x)));
    try {
      await completeBooking(b._id);
    } catch {
      await refresh();
      throw new Error("Complete failed");
    } finally {
      setActionLoadingId("");
      refresh().catch(() => {});
    }
  }

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-semibold text-slate-900">Employee Dashboard</h1>
      <p className="mt-2 text-slate-600">View your appointments and update your profile.</p>

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
            <h2 className="text-xl font-semibold text-slate-900">My Profile</h2>
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
                  {savingProfile ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={profileForm.empName}
                onChange={(e) => setProfileForm((p) => ({ ...p, empName: e.target.value }))}
                readOnly={!isEditMode}
                disabled={!isEditMode}
                style={{ backgroundColor: isEditMode ? "white" : "#f8fafc" }}
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
                style={{ backgroundColor: isEditMode ? "white" : "#f8fafc" }}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={profileForm.email}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                readOnly={!isEditMode}
                disabled={!isEditMode}
                style={{ backgroundColor: isEditMode ? "white" : "#f8fafc" }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={profileForm.phno}
                onChange={(e) => setProfileForm((p) => ({ ...p, phno: e.target.value }))}
                readOnly={!isEditMode}
                disabled={!isEditMode}
                style={{ backgroundColor: isEditMode ? "white" : "#f8fafc" }}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Login Username</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={profileForm.username}
                readOnly
                disabled
                style={{ backgroundColor: "#f8fafc" }}
              />
              <p className="mt-1 text-xs text-slate-500">Username cannot be changed</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={profileForm.password}
                onChange={(e) => setProfileForm((p) => ({ ...p, password: e.target.value }))}
                readOnly={!isEditMode}
                disabled={!isEditMode}
                placeholder={isEditMode ? "Enter new password (optional)" : "••••••••"}
                style={{ backgroundColor: isEditMode ? "white" : "#f8fafc" }}
              />
              {isEditMode && (
                <p className="mt-1 text-xs text-slate-500">Leave blank to keep current password</p>
              )}
            </div>
          </div>

          {isEditMode && (
            <div>
              <label className="text-sm font-medium text-slate-700">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
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
            {profile?.therapyId?.therapyName ? (
              <div className="text-sm text-slate-600 self-center">
                Assigned Therapy: {profile.therapyId.therapyName}
              </div>
            ) : null}
          </div>
        </form>

        {err ? <div className="mt-4 text-sm rounded-lg bg-rose-50 text-rose-800 px-3 py-2">{err}</div> : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={refresh} className="px-3 py-2 rounded-md border bg-white text-sm font-medium">
            Refresh Appointments
          </button>
        </div>
      </div>

    <section className="mt-8">
  <h2 className="text-xl font-semibold text-slate-900">Appointments</h2>

  {/* Tabs */}
  <div className="flex gap-1 border-b border-slate-200 mt-4 mb-6">
    {[
      { key: "upcoming", label: "Upcoming", data: empUpcoming },
      { key: "completed", label: "Completed", data: empCompleted },
      { key: "cancelled", label: "Cancelled", data: empCancelled },
    ].map(({ key, label, data }) => (
      <button
        key={key}
        onClick={() => { setEmpTab(key); setEmpShowCount(4); }}
        className={
          "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors " +
          (empTab === key
            ? "border-slate-900 text-slate-900"
            : "border-transparent text-slate-500 hover:text-slate-700")
        }
      >
        {label}
        <span className={
          "ml-2 text-xs px-1.5 py-0.5 rounded-full " +
          (empTab === key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500")
        }>
          {data.length}
        </span>
      </button>
    ))}
  </div>

  {loading ? <div className="rounded-xl border bg-white p-6">Loading...</div> : null}

  {!loading && (() => {
    const tabData = empTab === "upcoming" ? empUpcoming : empTab === "completed" ? empCompleted : empCancelled;
    return (
      <div>
        <div className="grid md:grid-cols-2 gap-4">
          {tabData.slice(0, empShowCount).map((b) => (
            <BookingCard
              key={b._id}
              booking={b}
              canComplete={empTab === "upcoming"}
              onComplete={onComplete}
              actionLoading={actionLoadingId === b._id}
            />
          ))}
          {!tabData.length && (
            <div className="text-sm text-slate-600">No {empTab} appointments.</div>
          )}
        </div>
        {tabData.length > empShowCount && (
          <button onClick={() => setEmpShowCount((n) => n + 4)}
            className="mt-4 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-slate-50">
            Show more ({tabData.length - empShowCount} remaining)
          </button>
        )}
      </div>
    );
  })()}
</section>
    </Container>
  );
}