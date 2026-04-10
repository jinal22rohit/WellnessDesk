import React, { useState, useEffect } from "react";
import { Spinner } from "./Spinner";
import { useToast } from "./Toast";
import { getEmployeeById, updateEmployee } from "../services/employee";
import { fetchTherapies } from "../services/therapy";

export function EmployeeEditForm({ employeeId, onSave, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [employeeData, setEmployeeData] = useState(null);
  const [therapies, setTherapies] = useState([]);
  const [existingImage, setExistingImage] = useState(null);   // ✅ current emp image
  const [imagePreview, setImagePreview] = useState(null);     // ✅ new image preview

  const [formData, setFormData] = useState({
    empName: "",
    dob: "",
    email: "",
    phno: "",
    empImgFile: null,
    username: "",
    password: "",
    therapyId: ""
  });

  const [validation, setValidation] = useState({
    empName: { valid: true, message: "" },
    email: { valid: true, message: "" },
    phno: { valid: true, message: "" },
    password: { valid: true, message: "" }
  });

  const { showToast } = useToast();

  // ✅ Load employee data + therapies together
  async function loadEmployeeData() {
    setLoading(true);
    setError("");
    try {
      const [empRes, therapyRes] = await Promise.all([
        getEmployeeById(employeeId),
        fetchTherapies()
      ]);

      const employee = empRes?.data;
      const user = employee?.userId;

        

      // ✅ Load real therapies from DB
      setTherapies(Array.isArray(therapyRes) ? therapyRes : therapyRes?.data || []);
      setEmployeeData(employee);

      // ✅ Store existing image to show current photo
      setExistingImage(employee?.empImg || null);

      setFormData({
        empName: employee?.empName || "",
        dob: employee?.dob ? employee.dob.split("T")[0] : "",
         email: user?.email || employee?.email || "",
         phno: user?.phoneNumber || employee?.phno || "",
         username: user?.username || employee?.username || "",
        password: "",
        therapyId: employee?.therapyId?._id || employee?.therapyId || "",
        empImgFile: null,
      });

    } catch (err) {
      console.error("FULL ERROR:", err?.response?.data || err);
      setError("Failed to load employee data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (employeeId) loadEmployeeData();
  }, [employeeId]);

  const validateField = (name, value) => {
    switch (name) {
      case "empName":
        return value.length >= 2
          ? { valid: true, message: "" }
          : { valid: false, message: "Name must be at least 2 characters" };
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? { valid: true, message: "" }
          : { valid: false, message: "Invalid email format" };
      case "phno":
        return /^[0-9]{10}$/.test(value.replace(/\D/g, ""))
          ? { valid: true, message: "" }
          : { valid: false, message: "Phone number must be 10 digits" };
      case "password":
        if (!value) return { valid: true, message: "" };
        return value.length >= 8
          ? { valid: true, message: "" }
          : { valid: false, message: "Password must be at least 8 characters" };
      default:
        return { valid: true, message: "" };
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validation[name]) {
      setValidation(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  // ✅ Show preview when new image selected
  function handleImageChange(e) {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, empImgFile: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    console.log("FORM DATA ON SUBMIT:", JSON.stringify({
  empName: formData.empName,
  email: formData.email,
  phno: formData.phno,
  therapyId: formData.therapyId,
}));

    try {
      const validations = {};
      ["empName", "email", "phno"].forEach(key => {
        validations[key] = validateField(key, formData[key]);
      });
      if (formData.password) {
        validations.password = validateField("password", formData.password);
      }

      const hasErrors = Object.values(validations).some(v => !v.valid);
      if (hasErrors) {
        setValidation(prev => ({ ...prev, ...validations }));
        throw new Error("Please fix validation errors before saving");
      }

      // ✅ Send correct field names matching controller
const updateData = {
  empName: formData.empName,
  dob: formData.dob,
  therapyId: formData.therapyId,
  email: formData.email,
  phoneNumber: formData.phno,
  empImgFile: formData.empImgFile,   // ✅ include image
  password: formData.password || undefined,
};

      if (formData.password) updateData.password = formData.password;

      const res = await updateEmployee(employeeId, updateData);

      if (!res?.success) throw new Error(res?.message || "Update failed");

      showToast("success", "Employee profile updated successfully!");
      onSave?.(res?.data);

      setTimeout(() => onCancel?.(), 1000);

    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Update failed";
      setError(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Spinner size="medium" />
          <span className="text-slate-600">Loading employee data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-edit-form">
      {/* Header */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-4">
          {/* ✅ Show existing employee image */}
          <img
            src={
              imagePreview ||
              existingImage ||
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%239ca3af'/%3E%3Cpath d='M30 70 Q50 55 70 70 L70 85 Q50 95 30 85 Z' fill='%239ca3af'/%3E%3C/svg%3E"
            }
            alt="Employee"
            className="w-14 h-14 rounded-full object-cover border-2 border-slate-200"
          />
          <div>
            <h3 className="font-semibold text-slate-900">Editing Employee Profile</h3>
            <div className="mt-1 text-sm text-slate-600">
              <span className="font-medium">{employeeData?.empName}</span>
              {formData.username && <span className="ml-2">• Username: {formData.username}</span>}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-slate-900 rounded"></span>
            Personal Information
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Employee Name</label>
              <input
                type="text"
                value={formData.empName}
                onChange={(e) => handleInputChange("empName", e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                  !validation.empName.valid ? "border-rose-300 bg-rose-50" : "border-slate-300"
                }`}
                required
              />
              {!validation.empName.valid && (
                <p className="mt-1 text-xs text-rose-600">{validation.empName.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleInputChange("dob", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                  !validation.email.valid ? "border-rose-300 bg-rose-50" : "border-slate-300"
                }`}
                required
              />
              {!validation.email.valid && (
                <p className="mt-1 text-xs text-rose-600">{validation.email.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={formData.phno}
                onChange={(e) => handleInputChange("phno", e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                  !validation.phno.valid ? "border-rose-300 bg-rose-50" : "border-slate-300"
                }`}
                required
              />
              {!validation.phno.valid && (
                <p className="mt-1 text-xs text-rose-600">{validation.phno.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Login Credentials */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-slate-900 rounded"></span>
            Login Credentials
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Login Username</label>
              <input
                type="text"
                value={formData.username}
                readOnly
                disabled
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-slate-50"
              />
              <p className="mt-1 text-xs text-slate-500">Username cannot be changed</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">New Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Leave blank to keep current password"
                className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                  !validation.password.valid ? "border-rose-300 bg-rose-50" : "border-slate-300"
                }`}
              />
              {!validation.password.valid && (
                <p className="mt-1 text-xs text-rose-600">{validation.password.message}</p>
              )}
              {formData.password && validation.password.valid && (
                <p className="mt-1 text-xs text-emerald-600">Password will be updated</p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-slate-900 rounded"></span>
            Professional Information
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Assigned Therapy</label>
              {/* ✅ Real therapies loaded from DB */}
              <select
                value={formData.therapyId}
                onChange={(e) => handleInputChange("therapyId", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">Select therapy</option>
                {therapies.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.therapyName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Employee Photo</label>
              {/* ✅ Show current image + allow replacing */}
              {existingImage && !imagePreview && (
                <div className="mt-1 mb-2 flex items-center gap-2">
                  <img
                    src={existingImage}
                    alt="Current"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <span className="text-xs text-slate-500">Current photo — upload new to replace</span>
                </div>
              )}
              {imagePreview && (
                <div className="mt-1 mb-2 flex items-center gap-2">
                  <img
                    src={imagePreview}
                    alt="New preview"
                    className="w-10 h-10 rounded-full object-cover border border-emerald-300"
                  />
                  <span className="text-xs text-emerald-600">New photo selected</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-slate-500">Optional: Upload new photo to replace current</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <Spinner size="small" />
                Saving...
              </div>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}