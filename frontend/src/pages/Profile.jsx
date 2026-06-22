import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { User, Mail, Edit2, Check, X, Upload, Bell, BellOff, FileText, Download, Link2 } from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import InterestOnboarding from '../components/InterestOnboarding';
import ImageCropperModal from '../components/ImageCropperModal';

export default function Profile() {
  const { user, deleteAccount } = useAuthStore();
  const { profile, userInterests, fetchProfile, fetchUserInterests, updateProfile, uploadAvatar } = useProfileStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [gender, setGender] = useState('');
  
  const [showInterestModal, setShowInterestModal] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingSub, setIsUpdatingSub] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const { uploadResume } = useProfileStore();

  useEffect(() => {
    fetchProfile();
    fetchUserInterests();
  }, [fetchProfile, fetchUserInterests]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setPhotoUrl(profile.profile_photo || '');
      setInstagram(profile.instagram || '');
      setLinkedin(profile.linkedin || '');
      setTwitter(profile.twitter || '');
      setGithub(profile.github || '');
      setResumeUrl(profile.resume_url || '');
      setGender(profile.gender || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    await updateProfile({ 
      name, 
      username: username.toLowerCase().trim() || null,
      bio, 
      profile_photo: photoUrl,
      instagram,
      linkedin,
      twitter,
      github,
      resume_url: resumeUrl,
      gender: gender || null
    });
    setIsEditing(false);
  };

  const handleSubscriptionChange = async (freq) => {
    setIsUpdatingSub(true);
    try {
      await updateProfile({ newsletter_frequency: freq });
    } catch (err) {
      console.error("Failed to update subscription", err);
    } finally {
      setIsUpdatingSub(false);
    }
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

  const handleResumeChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const newUrl = await uploadResume(file);
        setResumeUrl(newUrl);
        alert("Resume uploaded successfully!");
      } catch (error) {
        alert("Failed to upload resume: " + error.message);
      }
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
                    setUsername(profile?.username || '');
                    setBio(profile?.bio || '');
                    setPhotoUrl(profile?.profile_photo || '');
                    setInstagram(profile?.instagram || '');
                    setLinkedin(profile?.linkedin || '');
                    setTwitter(profile?.twitter || '');
                    setGithub(profile?.github || '');
                    setResumeUrl(profile?.resume_url || '');
                    setGender(profile?.gender || '');
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username (Unique)</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. hackerman99"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub URL</label>
                      <input 
                        type="url" 
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">LinkedIn URL</label>
                      <input 
                        type="url" 
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Twitter/X URL</label>
                      <input 
                        type="url" 
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="https://twitter.com/..."
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instagram URL</label>
                      <input 
                        type="url" 
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Profile Photo</label>
                    <div className="flex space-x-2">
                      <input 
                        type="url" 
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="flex-1 min-w-0 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Resume</label>
                    <div className="flex flex-wrap items-center gap-3">
                      <button 
                        onClick={() => resumeInputRef.current?.click()}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center whitespace-nowrap"
                      >
                        <FileText className="w-4 h-4 mr-2" /> {resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                      </button>
                      {resumeUrl && (
                        <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                          <Check className="w-4 h-4 mr-1" /> Uploaded
                        </span>
                      )}
                      <input 
                        type="file"
                        accept=".pdf,.doc,.docx"
                        ref={resumeInputRef}
                        className="hidden"
                        onChange={handleResumeChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="" className="text-slate-900">Prefer not to say</option>
                      <option value="Female" className="text-slate-900">Female</option>
                      <option value="Male" className="text-slate-900">Male</option>
                      <option value="Non-Binary" className="text-slate-900">Non-Binary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                          {profile?.name || user?.email?.split('@')[0] || 'User'}
                          {profile?.gender === 'Female' && <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">She/Her</span>}
                          {profile?.gender === 'Male' && <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">He/Him</span>}
                          {profile?.gender === 'Non-Binary' && <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">They/Them</span>}
                        </h1>
                        {profile?.username && (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700">
                            @{profile.username}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">{profile?.bio || 'No bio provided yet.'}</p>
                      {(!profile?.bio || !profile?.gender || !profile?.resume_url || !profile?.name || !profile?.username || !profile?.github || !profile?.linkedin) && (
                        <p className="text-sm text-brand-600 dark:text-brand-400 mt-2 font-medium">💡 Add your details for a better personalised experience</p>
                      )}
                    </div>
                    {profile?.resume_url && (
                      <a 
                        href={profile.resume_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors font-medium text-sm whitespace-nowrap"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        View Resume
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center text-slate-500 dark:text-slate-400 mr-4">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{user?.email}</span>
                    </div>

                    {profile?.github && (
                      <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-[#181717] dark:text-white hover:opacity-80 transition-opacity">
                        <FaGithub className="w-6 h-6" />
                      </a>
                    )}
                    {profile?.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] hover:opacity-80 transition-opacity">
                        <FaLinkedin className="w-6 h-6" />
                      </a>
                    )}
                    {profile?.twitter && (
                      <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-[#1DA1F2] hover:opacity-80 transition-opacity">
                        <FaTwitter className="w-6 h-6" />
                      </a>
                    )}
                    {profile?.instagram && (
                      <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                        <svg width="0" height="0">
                          <linearGradient id="ig-gradient" x1="1" y1="1" x2="0" y2="0">
                            <stop stopColor="#f09433" offset="0%" />
                            <stop stopColor="#e6683c" offset="25%" />
                            <stop stopColor="#dc2743" offset="50%" />
                            <stop stopColor="#cc2366" offset="75%" />
                            <stop stopColor="#bc1888" offset="100%" />
                          </linearGradient>
                        </svg>
                        <FaInstagram className="w-6 h-6" style={{ fill: "url(#ig-gradient)" }} />
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>



            {/* Interests Section */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Your Interests</h3>
                <button 
                  onClick={() => setShowInterestModal(true)}
                  className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium transition-colors"
                >
                  Manage Interests
                </button>
              </div>
              
              {userInterests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userInterests.map(interest => (
                    <span 
                      key={interest.id}
                      className="px-3 py-1 bg-brand-50 dark:bg-brand-900/50 text-brand-700 dark:text-brand-100 rounded-full text-sm font-semibold border border-brand-200 dark:border-brand-500/50 shadow-sm"
                    >
                      {interest.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm">You haven't selected any interests yet.</p>
              )}
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Email Digests</h3>
                  <p className="text-sm text-slate-500">Get personalized event recommendations sent straight to your inbox.</p>
                </div>
                
                {/* YouTube Style Subscribe Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSubscriptionChange(profile?.newsletter_frequency === 'none' || !profile?.newsletter_frequency ? 'weekly' : 'none')}
                  disabled={isUpdatingSub}
                  className={`px-5 py-2 rounded-full font-semibold flex items-center justify-center transition-colors relative overflow-hidden ${
                    profile?.newsletter_frequency !== 'none' && profile?.newsletter_frequency 
                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200' 
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-md'
                  }`}
                  style={{ width: '135px', height: '40px' }}
                >
                  <AnimatePresence mode="wait">
                    {(profile?.newsletter_frequency !== 'none' && profile?.newsletter_frequency) ? (
                      <motion.div
                        key="subscribed"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center whitespace-nowrap absolute"
                      >
                        <Bell className="w-4 h-4 mr-2" fill="currentColor" /> Subscribed
                      </motion.div>
                    ) : (
                      <motion.div
                        key="subscribe"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center whitespace-nowrap absolute"
                      >
                        Subscribe
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Only show options if subscribed */}
              {(profile?.newsletter_frequency !== 'none' && profile?.newsletter_frequency) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Delivery Frequency</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['daily', 'weekly', 'monthly', 'yearly'].map((freq) => {
                      const currentFreq = profile?.newsletter_frequency || 'none';
                      const isSelected = currentFreq === freq;
                      
                      return (
                        <button
                          key={freq}
                          onClick={() => handleSubscriptionChange(freq)}
                          disabled={isUpdatingSub || isSelected}
                          className={`flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                            isSelected 
                              ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/30 dark:border-brand-800 dark:text-brand-300 shadow-sm ring-1 ring-brand-500' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span className="capitalize mr-2">{freq}</span>
                          {isSelected ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4 opacity-50" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
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
