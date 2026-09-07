import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import '../../styles/Settings.css';
const CLASS_VIEW_STORAGE_KEY = 'pithub_class_view_mode';

const SettingsPage = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [activeSection, setActiveSection] = useState('account');

    const [profileData, setProfileData] = useState({
        visibility: 'private',
        major: '',
        minor: '',
        gradSemester: '',
        website: '',
        bio: '',
        profileConfig: {}
    });

    const [profileEditData, setProfileEditData] = useState({
        major: '',
        minor: '',
        gradSemester: '',
        website: '',
        bio: ''
    });

    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const {
        toggleGlobalVisibility,
        setProfileFieldVisibility,
        isGlobalLoading,
        isFieldLoading
    } = useProfileSettings(user?.uid);

    {/* Load the user's Firestore profile. */}
    useEffect(() => {
        if (!user?.uid) return;

        const userRef = doc(db, 'users', user.uid);

        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (!snapshot.exists()) return;

            const data = snapshot.data();

            setProfileData(data);

            setProfileEditData({
                major: data.major || '',
                minor: data.minor || '',
                gradSemester: data.gradSemester || '',
                website: data.website || '',
                bio: data.bio || ''
            });
        });

        return () => unsubscribe();
    }, [user?.uid]);

    {/* Save profile information. */}
    const handleSaveProfile = async () => {
        if (!user?.uid) return;

        setIsSavingProfile(true);

        try {
            const userRef = doc(db, 'users', user.uid);

            await setDoc(
                userRef,
                profileEditData,
                { merge: true }
            );
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsSavingProfile(false);
        }
    };

    {/* Toggle a specific profile field. */}
    const handleToggleFieldVisibility = (fieldName) => {
        const currentConfig = profileData.profileConfig || {};
        const currentlyVisible = currentConfig[fieldName] !== false;

        setProfileFieldVisibility(
            fieldName,
            !currentlyVisible
        );
    };

    {/* Render the selected settings section. */}
    const renderSection = () => {
        switch (activeSection) {
            case 'account':
                return <AccountSection user={user} />;

            case 'profile':
                return (
                    <ProfileSection
                        profileData={profileData}
                        profileEditData={profileEditData}
                        setProfileEditData={setProfileEditData}
                        handleSaveProfile={handleSaveProfile}
                        isSavingProfile={isSavingProfile}
                        handleToggleFieldVisibility={handleToggleFieldVisibility}
                        toggleGlobalVisibility={toggleGlobalVisibility}
                        isGlobalLoading={isGlobalLoading}
                        isFieldLoading={isFieldLoading}
                    />
                );

            case 'appearance':
                return (
                    <AppearanceSection
                        theme={theme}
                        toggleTheme={toggleTheme}
                    />
                );

            case 'preferences':
                return <PreferencesSection />;

            default:
                return <AccountSection user={user} />;
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-container">

                <div className="settings-header">
                    <h1>Settings</h1>
                    <p>
                        Manage your account, profile, and application preferences.
                    </p>
                </div>

                <div className="settings-layout">

                    <nav className="settings-sidebar">
                        <button
                            className={`settings-nav-item ${
                                activeSection === 'account' ? 'active' : ''
                            }`}
                            onClick={() => setActiveSection('account')}
                        >
                            Account
                        </button>

                        <button
                            className={`settings-nav-item ${
                                activeSection === 'profile' ? 'active' : ''
                            }`}
                            onClick={() => setActiveSection('profile')}
                        >
                            Profile
                        </button>

                        <button
                            className={`settings-nav-item ${
                                activeSection === 'appearance' ? 'active' : ''
                            }`}
                            onClick={() => setActiveSection('appearance')}
                        >
                            Appearance
                        </button>

                        <button
                            className={`settings-nav-item ${
                                activeSection === 'preferences' ? 'active' : ''
                            }`}
                            onClick={() => setActiveSection('preferences')}
                        >
                            Preferences
                        </button>
                    </nav>

                    <section className="settings-content">
                        {renderSection()}
                    </section>

                </div>
            </div>
        </div>
    );
};


/* ACCOUNT */

const AccountSection = ({ user }) => {
    return (
        <div className="settings-section">
            <div className="settings-section-header">
                <h2>Account</h2>
                <p>
                    Manage your PitHub account information.
                </p>
            </div>

            <div className="settings-divider" />

            <div className="settings-field">
                <label>Display Name</label>

                <input
                    type="text"
                    value={user?.displayName || ''}
                    disabled
                />

                <span className="settings-help">
                    Your name is managed through your Lewis University Google account.
                </span>
            </div>

            <div className="settings-field">
                <label>Email</label>

                <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                />

                <span className="settings-help">
                    Your PitHub account uses your Lewis University email address.
                </span>
            </div>

            <div className="settings-field">
                <label>Account Type</label>

                <input
                    type="text"
                    value="Student"
                    disabled
                />
            </div>
        </div>
    );
};


{/* PROFILE */}

const ProfileSection = ({
    profileData,
    profileEditData,
    setProfileEditData,
    handleSaveProfile,
    isSavingProfile,
    handleToggleFieldVisibility,
    toggleGlobalVisibility,
    isGlobalLoading,
    isFieldLoading
}) => {

    const fieldVisibility = (field) => {
        return profileData?.profileConfig?.[field] !== false;
    };

    return (
        <div className="settings-section">

            <div className="settings-section-header">
                <h2>Profile</h2>
                <p>
                    Manage the information displayed on your PitHub profile.
                </p>
            </div>

            <div className="settings-divider" />

            {/* Global profile visibility */}
            <div className="settings-profile-privacy">

                <div>
                    <label>Profile Visibility</label>

                    <p className="settings-help">
                        Control whether other PitHub users can view your profile.
                    </p>
                </div>

                <button
                    className={`visibility-button ${
                        profileData.visibility === 'public'
                            ? 'public'
                            : 'private'
                    }`}
                    onClick={() =>
                        toggleGlobalVisibility(profileData.visibility)
                    }
                    disabled={isGlobalLoading}
                >
                    {isGlobalLoading
                        ? 'Updating...'
                        : profileData.visibility === 'public'
                            ? 'Public'
                            : 'Private'
                    }
                </button>

            </div>

            <div className="settings-divider" />

            <div className="settings-profile-grid">

                <ProfileInput
                    label="Major"
                    value={profileEditData.major}
                    placeholder="Major..."
                    onChange={(value) =>
                        setProfileEditData({
                            ...profileEditData,
                            major: value
                        })
                    }
                    visible={fieldVisibility('showMajor')}
                    onToggle={() =>
                        handleToggleFieldVisibility('showMajor')
                    }
                    disabled={isFieldLoading}
                />

                <ProfileInput
                    label="Minor"
                    value={profileEditData.minor}
                    placeholder="Minor..."
                    onChange={(value) =>
                        setProfileEditData({
                            ...profileEditData,
                            minor: value
                        })
                    }
                    visible={fieldVisibility('showMinor')}
                    onToggle={() =>
                        handleToggleFieldVisibility('showMinor')
                    }
                    disabled={isFieldLoading}
                />

                <ProfileInput
                    label="Expected Graduation"
                    value={profileEditData.gradSemester}
                    placeholder="Spring 2027"
                    onChange={(value) =>
                        setProfileEditData({
                            ...profileEditData,
                            gradSemester: value
                        })
                    }
                    visible={fieldVisibility('showGraduation')}
                    onToggle={() =>
                        handleToggleFieldVisibility('showGraduation')
                    }
                    disabled={isFieldLoading}
                />

                <ProfileInput
                    label="Website"
                    value={profileEditData.website}
                    placeholder="https://your-link"
                    onChange={(value) =>
                        setProfileEditData({
                            ...profileEditData,
                            website: value
                        })
                    }
                    visible={fieldVisibility('showWebsite')}
                    onToggle={() =>
                        handleToggleFieldVisibility('showWebsite')
                    }
                    disabled={isFieldLoading}
                />

                <div className="settings-field settings-field-full">
                    <div className="settings-field-label-row">
                        <label>Bio</label>

                        <VisibilityButton
                            visible={fieldVisibility('showBio')}
                            onClick={() =>
                                handleToggleFieldVisibility('showBio')
                            }
                            disabled={isFieldLoading}
                        />
                    </div>

                    <textarea
                        value={profileEditData.bio}
                        placeholder="Tell us about yourself..."
                        onChange={(e) =>
                            setProfileEditData({
                                ...profileEditData,
                                bio: e.target.value
                            })
                        }
                    />
                </div>

            </div>

            <div className="settings-actions">
                <button
                    className="settings-save-button"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                >
                    {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
            </div>

        </div>
    );
};


{/* PROFILE INPUT */}

const ProfileInput = ({
    label,
    value,
    placeholder,
    onChange,
    visible,
    onToggle,
    disabled
}) => {
    return (
        <div className="settings-field">

            <div className="settings-field-label-row">
                <label>{label}</label>

                <VisibilityButton
                    visible={visible}
                    onClick={onToggle}
                    disabled={disabled}
                />
            </div>

            <input
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />

        </div>
    );
};


{/* VISIBILITY BUTTON */}

const VisibilityButton = ({
    visible,
    onClick,
    disabled
}) => {
    return (
        <button
            className={`visibility-field-button ${
                visible ? 'visible' : 'hidden'
            }`}
            onClick={onClick}
            disabled={disabled}
        >
            {visible ? 'Visible' : 'Hidden'}
        </button>
    );
};


{/* APPEARANCE */}

const AppearanceSection = ({
    theme,
    toggleTheme
}) => {
    return (
        <div className="settings-section">

            <div className="settings-section-header">
                <h2>Appearance</h2>
                <p>
                    Customize how PitHub looks on your device.
                </p>
            </div>

            <div className="settings-divider" />

            <div className="settings-option-row">

                <div>
                    <label>Theme</label>

                    <p className="settings-help">
                        Choose between light and dark mode.
                    </p>
                </div>

                <button
                    className="theme-select-button"
                    onClick={toggleTheme}
                >
                    {theme === 'light' ? 'Light' : 'Dark'}
                </button>

            </div>

        </div>
    );
};


{/* PREFERENCES */}

const PreferencesSection = (view) => {
    const [classView, setClassView] = useState(() => {
        return localStorage.getItem(CLASS_VIEW_STORAGE_KEY) || 'grid';
    });
    const handleClassViewChange = (view) => {
        setClassView(view);
        localStorage.setItem(CLASS_VIEW_STORAGE_KEY, view);
        // Tell other components in the same application
        // that the preference has changed.
        window.dispatchEvent(
            new CustomEvent('classViewModeChanged', {
                detail: view
            })
        );
    };
    return (
        <div className="settings-section">

            <div className="settings-section-header">
                <h2>Preferences</h2>
                <p>
                    Manage your PitHub application preferences.
                </p>
            </div>

            <div className="settings-divider" />

            <div className="settings-option-row">
                <div>
                    <label>Class View</label>

                    <p className="settings-help">
                        Choose how your classes are displayed.
                    </p>
                </div>

                <div className="settings-choice-group">
                    <button
                        className={`settings-choice-button ${
                            classView === 'grid' ? 'active' : ''
                        }`}
                        onClick={() => handleClassViewChange('grid')}
                    >
                        Grid
                    </button>

                    <button
                        className={`settings-choice-button ${
                            classView === 'list' ? 'active' : ''
                        }`}
                        onClick={() => handleClassViewChange('list')}
                    >
                        List
                    </button>
                </div>
            </div>

        </div>
    );
};

export default SettingsPage;