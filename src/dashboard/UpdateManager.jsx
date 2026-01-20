import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

const UpdateManager = ({ darkMode }) => {
    const [versions, setVersions] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Form state - Changed from file upload to URL input
    const [downloadUrl, setDownloadUrl] = useState("");
    const [versionName, setVersionName] = useState("");
    const [versionCode, setVersionCode] = useState("");
    const [changelog, setChangelog] = useState("");
    const [fileSize, setFileSize] = useState(""); // In MB
    const [isCritical, setIsCritical] = useState(true); // Default to forced update

    // Validation errors
    const [errors, setErrors] = useState({});

    // Real-time listener for versions
    useEffect(() => {
        const q = query(
            collection(db, "app_versions"),
            orderBy("versionCode", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const versionsList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setVersions(versionsList);
        });
        return () => unsubscribe();
    }, []);

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!downloadUrl.trim()) {
            newErrors.downloadUrl = "Download URL is required";
        } else {
            try {
                new URL(downloadUrl);
            } catch {
                newErrors.downloadUrl = "Invalid URL format";
            }
        }

        if (!versionName.trim()) newErrors.versionName = "Version name is required";
        if (!versionCode || versionCode <= 0) newErrors.versionCode = "Valid version code is required";
        if (!changelog.trim()) newErrors.changelog = "Changelog is required";
        if (!fileSize || fileSize <= 0) newErrors.fileSize = "File size is required";

        // Check if version code already exists
        if (versions.some(v => v.versionCode === parseInt(versionCode))) {
            newErrors.versionCode = "Version code already exists";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Save version to Firestore
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setUploading(true);

        try {
            // Convert MB to bytes for consistency
            const fileSizeInBytes = parseFloat(fileSize) * 1024 * 1024;

            // Save to Firestore
            const versionDoc = doc(db, "app_versions", `version_${versionCode}`);
            await setDoc(versionDoc, {
                versionName: versionName.trim(),
                versionCode: parseInt(versionCode),
                downloadUrl: downloadUrl.trim(),
                changelog: changelog.trim(),
                fileSize: fileSizeInBytes,
                uploadedAt: new Date(),
                uploadedBy: "admin",
                isCritical: isCritical,
                isActive: true,
                downloadCount: 0,
            });

            // Reset form
            setDownloadUrl("");
            setVersionName("");
            setVersionCode("");
            setChangelog("");
            setFileSize("");
            setIsCritical(true);
            setUploading(false);

            alert("✅ Version added successfully!");
        } catch (error) {
            console.error("Error saving version:", error);
            alert("❌ Error: " + error.message);
            setUploading(false);
        }
    };

    // Toggle version active status
    const toggleVersionStatus = async (versionId, currentStatus) => {
        try {
            await updateDoc(doc(db, "app_versions", versionId), {
                isActive: !currentStatus,
            });
        } catch (error) {
            console.error("Error toggling status:", error);
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    const latestVersion = versions.length > 0 ? versions[0] : null;

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <div className={`rounded-xl shadow-md p-6 border transition-all duration-300 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                }`}>
                <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"
                    }`}>
                    <span className="text-2xl">📱</span>
                    Add New APK Version
                </h2>

                <div className="space-y-4">
                    {/* Download URL */}
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                            }`}>
                            APK Download URL (Google Drive, GitHub, etc.)
                        </label>
                        <input
                            type="url"
                            value={downloadUrl}
                            onChange={(e) => setDownloadUrl(e.target.value)}
                            disabled={uploading}
                            placeholder="https://drive.google.com/file/d/xxx/view?usp=sharing"
                            className={`w-full px-4 py-2 rounded-lg border text-sm ${darkMode
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                                } ${errors.downloadUrl ? "border-red-500" : ""}`}
                        />
                        {errors.downloadUrl && (
                            <p className="text-red-500 text-xs mt-1">{errors.downloadUrl}</p>
                        )}
                        <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            💡 Upload APK to Google Drive/GitHub, get shareable link, paste here
                        </p>
                    </div>

                    {/* Version Name & Code & File Size */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                                }`}>
                                Version Name
                            </label>
                            <input
                                type="text"
                                value={versionName}
                                onChange={(e) => setVersionName(e.target.value)}
                                disabled={uploading}
                                placeholder="1.10"
                                className={`w-full px-4 py-2 rounded-lg border text-sm ${darkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                                    } ${errors.versionName ? "border-red-500" : ""}`}
                            />
                            {errors.versionName && (
                                <p className="text-red-500 text-xs mt-1">{errors.versionName}</p>
                            )}
                        </div>

                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                                }`}>
                                Version Code
                            </label>
                            <input
                                type="number"
                                value={versionCode}
                                onChange={(e) => setVersionCode(e.target.value)}
                                disabled={uploading}
                                placeholder="18"
                                className={`w-full px-4 py-2 rounded-lg border text-sm ${darkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                                    } ${errors.versionCode ? "border-red-500" : ""}`}
                            />
                            {errors.versionCode && (
                                <p className="text-red-500 text-xs mt-1">{errors.versionCode}</p>
                            )}
                        </div>

                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                                }`}>
                                File Size (MB)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={fileSize}
                                onChange={(e) => setFileSize(e.target.value)}
                                disabled={uploading}
                                placeholder="25.5"
                                className={`w-full px-4 py-2 rounded-lg border text-sm ${darkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                                    } ${errors.fileSize ? "border-red-500" : ""}`}
                            />
                            {errors.fileSize && (
                                <p className="text-red-500 text-xs mt-1">{errors.fileSize}</p>
                            )}
                        </div>
                    </div>

                    {/* Changelog */}
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                            }`}>
                            What's New / Changelog
                        </label>
                        <textarea
                            value={changelog}
                            onChange={(e) => setChangelog(e.target.value)}
                            disabled={uploading}
                            rows="4"
                            placeholder="- Bug fixes&#10;- Performance improvements&#10;- New features"
                            className={`w-full px-4 py-2 rounded-lg border text-sm ${darkMode
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                                } ${errors.changelog ? "border-red-500" : ""}`}
                        />
                        {errors.changelog && (
                            <p className="text-red-500 text-xs mt-1">{errors.changelog}</p>
                        )}
                    </div>

                    {/* Critical Update */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="critical-update"
                            checked={isCritical}
                            onChange={(e) => setIsCritical(e.target.checked)}
                            disabled={uploading}
                            className="w-4 h-4 rounded"
                        />
                        <label
                            htmlFor="critical-update"
                            className={`text-sm font-medium cursor-pointer ${darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                        >
                            🚨 Force Update (Users must install or exit app)
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={uploading}
                        className={`w-full py-3 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg ${uploading
                            ? "bg-gray-400 cursor-not-allowed text-gray-700"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                    >
                        {uploading ? "⏳ Saving..." : "✅ Add Version"}
                    </button>
                </div>
            </div>

            {/* Current Version Info */}
            {latestVersion && (
                <div className={`rounded-xl shadow-md p-6 border transition-all duration-300 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                    }`}>
                    <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"
                        }`}>
                        <span className="text-2xl">✅</span>
                        Current Published Version
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className={`text-xs font-medium uppercase ${darkMode ? "text-gray-400" : "text-gray-500"
                                }`}>
                                Version
                            </p>
                            <p className={`text-2xl font-bold mt-1 ${darkMode ? "text-white" : "text-gray-900"
                                }`}>
                                {latestVersion.versionName}
                            </p>
                        </div>

                        <div>
                            <p className={`text-xs font-medium uppercase ${darkMode ? "text-gray-400" : "text-gray-500"
                                }`}>
                                Code
                            </p>
                            <p className={`text-2xl font-bold mt-1 ${darkMode ? "text-white" : "text-gray-900"
                                }`}>
                                {latestVersion.versionCode}
                            </p>
                        </div>

                        <div>
                            <p className={`text-xs font-medium uppercase ${darkMode ? "text-gray-400" : "text-gray-500"
                                }`}>
                                Size
                            </p>
                            <p className={`text-2xl font-bold mt-1 ${darkMode ? "text-white" : "text-gray-900"
                                }`}>
                                {formatFileSize(latestVersion.fileSize)}
                            </p>
                        </div>

                        <div>
                            <p className={`text-xs font-medium uppercase ${darkMode ? "text-gray-400" : "text-gray-500"
                                }`}>
                                Downloads
                            </p>
                            <p className={`text-2xl font-bold mt-1 ${darkMode ? "text-white" : "text-gray-900"
                                }`}>
                                {latestVersion.downloadCount || 0}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Version History */}
            <div className={`rounded-xl shadow-md border overflow-hidden transition-all duration-300 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                }`}>
                <div className="p-6 pb-4">
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"
                        }`}>
                        <span className="text-2xl">📜</span>
                        Version History
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-50"
                            }`}>
                            <tr>
                                <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-700"
                                    }`}>
                                    Version
                                </th>
                                <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-700"
                                    }`}>
                                    Changelog
                                </th>
                                <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-700"
                                    }`}>
                                    Added
                                </th>
                                <th className={`px-6 py-3 text-center text-xs font-bold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-700"
                                    }`}>
                                    Status
                                </th>
                                <th className={`px-6 py-3 text-center text-xs font-bold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-700"
                                    }`}>
                                    Download
                                </th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? "bg-gray-800 divide-gray-700" : "bg-white divide-gray-100"
                            }`}>
                            {versions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12">
                                        <span className="text-5xl mb-3 block">📭</span>
                                        <p className={`text-base font-medium ${darkMode ? "text-gray-400" : "text-gray-500"
                                            }`}>
                                            No versions added yet
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                versions.map((version) => (
                                    <tr key={version.id} className={`${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                                        }`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"
                                                    }`}>
                                                    v{version.versionName}
                                                </p>
                                                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"
                                                    }`}>
                                                    Code: {version.versionCode}
                                                </p>
                                                {version.isCritical && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 mt-1">
                                                        🚨 Forced
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className={`text-xs whitespace-pre-line ${darkMode ? "text-gray-300" : "text-gray-700"
                                                }`}>
                                                {version.changelog}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                                            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                                                {version.uploadedAt
                                                    ? new Date(version.uploadedAt.seconds * 1000).toLocaleString()
                                                    : "N/A"}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => toggleVersionStatus(version.id, version.isActive)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${version.isActive ? "bg-green-500" : "bg-gray-400"
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${version.isActive ? "translate-x-6" : "translate-x-1"
                                                        }`}
                                                />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <a
                                                href={version.downloadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                                            >
                                                📥 Link
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UpdateManager;
