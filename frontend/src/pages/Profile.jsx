import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { User, Mail, Edit2, Check, X, Upload } from 'lucide-react';
import InterestOnboarding from '../components/InterestOnboarding';
import ImageCropperModal from '../components/ImageCropperModal';

export default function Profile() {
  const { user, deleteAccount } = useAuthStore();
  const { profile, userInterests, fetchProfile, fetchUserInterests, updateProfile, uploadAvatar } = useProfileStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [showInterestModal, setShowInterestModal] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchUserInterests();
  }, [fetchProfile, fetchUserInterests]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setPhotoUrl(profile.profile_photo || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    await updateProfile({ name, bio, profile_photo: photoUrl });
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== profile?.name) {
      alert("The name you entered does not match your profile name.");
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAccount();
    } catch (error) {
      alert(`Could not delete account: ${error.message}`);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleCroppedImage = async (croppedFile) => {
    try {
      const newUrl = await uploadAvatar(croppedFile);
      setPhotoUrl(newUrl);
      setSelectedImage(null);
    } catch (error) {
      alert("Failed to upload avatar: " + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {showInterestModal && <InterestOnboarding onComplete={() => setShowInterestModal(false)} />}
      
      {selectedImage && (
        <ImageCropperModal 
          imageSrc={selectedImage} 
          onComplete={handleCroppedImage}
          onCancel={() => setSelectedImage(null)}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden relative flex flex-col p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Account</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              This action cannot be undone. Please type <span className="font-bold text-slate-900 dark:text-white">{profile?.name}</span> to confirm.
            </p>
            <input 
              type="text" 
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={profile?.name}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 mb-6"
            />
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== profile?.name}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Header/Cover */}
        <div className="h-32 bg-gradient-to-r from-brand-500 to-brand-700"></div>
        
        <div className="px-8 pb-8 relative">
          {/* Avatar */}
          <div className="absolute -top-16 left-8">
            <div className="h-32 w-32 rounded-full border-4 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
              {profile?.profile_photo ? (
                <img src={profile.profile_photo} alt={name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-16 w-16 text-slate-400" />
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors text-sm font-medium"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setName(profile?.name || '');
                    setBio(profile?.bio || '');
                    setPhotoUrl(profile?.profile_photo || '');
                  }}
                  className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors text-sm font-medium"
                >
                  <X className="w-4 h-4 mr-1" /> Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                  <Check className="w-4 h-4 mr-1" /> Save
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-6">
            {/* Info Section */}
            <div>
              {isEditing ? (
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Profile Photo</label>
                    <div className="flex space-x-2">
                      <input 
                        type="url" 
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center whitespace-nowrap"
                      >
                        <Upload className="w-4 h-4 mr-2" /> Upload
                      </button>
                      <input 
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{profile?.name || 'Anonymous User'}</h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">{profile?.bio || 'No bio provided yet.'}</p>
                </>
              )}
            </div>

            <div className="flex items-center text-slate-500 dark:text-slate-400">
              <Mail className="w-4 h-4 mr-2" />
              <span>{user?.email}</span>
            </div>

            {/* Interests Section */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Your Interests</h3>
                <button 
                  onClick={() => setShowInterestModal(true)}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Manage Interests
                </button>
              </div>
              
              {userInterests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userInterests.map(interest => (
                    <span 
                      key={interest.id}
                      className="px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium border border-brand-200 dark:border-brand-800"
                    >
                      {interest.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">You haven't selected any interests yet.</p>
              )}
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-10">
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
