import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "../shared/Container";
import { useAuth } from "../context/AuthContext";
import { cancelBooking, getUserBookings } from "../services/booking";
import { BookingCard } from "../components/BookingCard";
import { getMyUserProfile, updateMyUserProfile } from "../services/user";



export function UserDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phoneNumber: "", dob: "", profileImageFile: null, username: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalForm, setOriginalForm] = useState({});
  const [err, setErr] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showCount, setShowCount] = useState(4);

  
  // ✅ FIXED — guard on user?.id, not token
  async function refresh() {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await getUserBookings(user.id);
      setBookings(res?.data || []);
    } finally {
      setLoading(false);
    }
  }

  // ✅ FIXED — depend on user?.id so effect re-runs once user is decoded from JWT
  useEffect(() => {
    if (!user?.id) return;

    refresh().catch(() => {});
    getMyUserProfile()
      .then((res) => {
        const p = res?.data || null;
        setProfile(p);
        const form = {
          name: p?.name || p?.username || "",
          email: p?.email || "",
          phoneNumber: p?.phoneNumber || "",
          dob: p?.dob ? p.dob.slice(0, 10) : "",
          profileImageFile: null,
          username: p?.username || "",
        };
        setProfileForm(form);
        setOriginalForm(form);
      })
      .catch(() => {});
  }, [user?.id]); // ✅ re-runs when user.id becomes available

  const upcoming = useMemo(() => bookings.filter((b) => b.status === "booked"), [bookings]);
  const completed = useMemo(() => bookings.filter((b) => b.status === "completed"), [bookings]);
  const cancelled = useMemo(() => bookings.filter((b) => b.status === "cancelled"), [bookings]);

  async function onCancel(b) {
    setActionLoadingId(b._id);
    setBookings((prev) => prev.map((x) => (x._id === b._id ? { ...x, status: "cancelled" } : x)));
    try {
      await cancelBooking(b._id);
    } catch {
      await refresh();
      throw new Error("Cancel failed");
    } finally {
      setActionLoadingId("");
      refresh().catch(() => {});
    }
  }

  function onBookAgain(b) {
    const therapyId = b?.therapyId?._id || b?.empID?.therapyId?._id || b?.therapyId;
    nav(`/booking?therapyId=${encodeURIComponent(therapyId)}`);
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
    if (file && !file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setErr("Please select a valid image file (JPG or PNG)");
      return;
    }
    setProfileForm((p) => ({ ...p, profileImageFile: file }));
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
    if (profile?.profileImage) return profile.profileImage;
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%239ca3af'/%3E%3Cpath d='M30 70 Q50 55 70 70 L70 85 Q50 95 30 85 Z' fill='%239ca3af'/%3E%3C/svg%3E";
  }

  async function onSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    setErr("");
    try {
      const res = await updateMyUserProfile(profileForm);
      const p = res?.data?.data || res?.data || null;
      setProfile(p);
      const form = {
        name: p?.name || p?.username || "",
        email: p?.email || "",
        phoneNumber: p?.phoneNumber || "",
        dob: p?.dob ? p.dob.slice(0, 10) : "",
        profileImageFile: null,
        username: p?.username || "",
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

  return (
    <Container className="py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">My Dashboard</h1>
          <p className="mt-2 text-slate-600">View upcoming bookings, therapy history, and cancellations.</p>
        </div>
        <button
          onClick={() => nav("/booking")}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
        >
          New booking
        </button>
      </div>

      {loading ? <div className="mt-6 rounded-xl border bg-white p-6">Loading...</div> : null}

      <section className="mt-6 rounded-2xl border bg-white p-6">
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <img
              src={getDisplayImage()}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 mx-auto"
            />
            {isEditMode && (
              <div className="absolute bottom-0 right-0 bg-slate-900 text-white rounded-full p-2 cursor-pointer hover:bg-slate-800">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-900">My Profile</h2>
          {!isEditMode ? (
            <button
              type="button"
              onClick={handleEditClick}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800"
            >
              Edit Profile
            </button>
          ) : null}
        </div>

        <form onSubmit={onSaveProfile} className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                readOnly={!isEditMode}
                disabled={!isEditMode}
                style={{ backgroundColor: isEditMode ? "white" : "#f8fafc" }}
              />
            </div>
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
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={profileForm.email}
                readOnly
                disabled
                style={{ backgroundColor: "#f8fafc" }}
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
          {isEditMode && (
            <div>
              <label className="text-sm font-medium text-slate-700">Profile Image</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleImageChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
              <p className="mt-1 text-xs text-slate-500">Supported formats: JPG, PNG</p>
              {imagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-slate-600 mb-1">New image preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-300"
                  />
                </div>
              )}
            </div>
          )}
          {isEditMode && (
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
          <div className="flex gap-3">
            {profile?.role ? <div className="self-center text-sm text-slate-600">Role: {profile.role}</div> : null}
          </div>
        </form>
        {err ? <div className="mt-4 text-sm rounded-lg bg-rose-50 text-rose-800 px-3 py-2">{err}</div> : null}
      </section>

      {/* Booking Tabs */}
<div className="mt-8">
  {/* Tab buttons */}
  <div className="flex gap-1 border-b border-slate-200 mb-6">
    {[
      { key: "upcoming", label: "Upcoming", count: upcoming.length },
      { key: "completed", label: "Completed", count: completed.length },
      { key: "cancelled", label: "Cancelled", count: cancelled.length },
    ].map(({ key, label, count }) => (
      <button
        key={key}
        onClick={() => { setActiveTab(key); setShowCount(4); }}
        className={
          "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors " +
          (activeTab === key
            ? "border-slate-900 text-slate-900"
            : "border-transparent text-slate-500 hover:text-slate-700")
        }
      >
        {label}
        <span className={
          "ml-2 text-xs px-1.5 py-0.5 rounded-full " +
          (activeTab === key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500")
        }>
          {count}
        </span>
      </button>
    ))}
  </div>

  {/* Upcoming */}
  {activeTab === "upcoming" && (
    <div>
      <div className="grid md:grid-cols-2 gap-4">
        {upcoming.slice(0, showCount).map((b) => (
          <BookingCard
            key={b._id}
            booking={b}
            canCancel
            onCancel={onCancel}
            actionLoading={actionLoadingId === b._id}
          />
        ))}
        {!upcoming.length && <div className="text-sm text-slate-600">No upcoming bookings.</div>}
      </div>
      {upcoming.length > showCount && (
        <button onClick={() => setShowCount((n) => n + 4)}
          className="mt-4 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-slate-50">
          Show more ({upcoming.length - showCount} remaining)
        </button>
      )}
    </div>
  )}

  {/* Completed */}
  {activeTab === "completed" && (
    <div>
      <div className="grid md:grid-cols-2 gap-4">
      {completed.slice(0, showCount).map((b) => (
  <BookingCard
    key={b._id}
    booking={b}
    onBookAgain={onBookAgain}
  />
))}
        {!completed.length && <div className="text-sm text-slate-600">No completed therapies yet.</div>}
      </div>
      {completed.length > showCount && (
        <button onClick={() => setShowCount((n) => n + 4)}
          className="mt-4 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-slate-50">
          Show more ({completed.length - showCount} remaining)
        </button>
      )}
    </div>
  )}

  {/* Cancelled */}
  {activeTab === "cancelled" && (
    <div>
      <div className="grid md:grid-cols-2 gap-4">
        {cancelled.slice(0, showCount).map((b) => (
          <BookingCard key={b._id} booking={b} />
        ))}
        {!cancelled.length && <div className="text-sm text-slate-600">No cancelled bookings.</div>}
      </div>
      {cancelled.length > showCount && (
        <button onClick={() => setShowCount((n) => n + 4)}
          className="mt-4 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-slate-50">
          Show more ({cancelled.length - showCount} remaining)
        </button>
      )}
    </div>
  )}
</div>
    </Container>
  );
}