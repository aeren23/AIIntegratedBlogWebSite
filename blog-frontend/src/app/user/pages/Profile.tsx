import { Alert, Button, Label, Spinner, TextInput, Textarea } from 'flowbite-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiOutlineCamera } from 'react-icons/hi';
import { useAuth } from '../../../contexts/AuthContext';
import {
  createMyProfile,
  deleteSelfAccount,
  fetchMyProfile,
  updateMyProfile,
  uploadMyAvatar,
  type UserProfile,
} from '../../../api/user.api';
import ConfirmModal from '../../../components/common/ConfirmModal';

type ProfileFormState = {
  displayName: string;
  bio: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/?$/, '');
  }
})();

const resolveErrorMessage = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    const apiMessage = (err.response?.data as { errorMessage?: string } | undefined)
      ?.errorMessage;
    if (apiMessage) {
      return apiMessage;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unable to load profile details.';
};

const resolveAvatarUrl = (url?: string | null) => {
  if (!url) {
    return null;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${API_ORIGIN}${normalized}`;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formState, setFormState] = useState<ProfileFormState>({
    displayName: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profileData = await fetchMyProfile();
      setProfile(profileData);
      setFormState({
        displayName: profileData?.displayName ?? user?.username ?? '',
        bio: profileData?.bio ?? '',
      });
    } catch (err) {
      setError(resolveErrorMessage(err));
      setFormState({
        displayName: user?.username ?? '',
        bio: '',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    if (!user) {
      return;
    }
    void loadProfile();
  }, [loadProfile, user]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      displayName: formState.displayName.trim() || undefined,
      bio: formState.bio.trim(),
    };

    try {
      const saved = profile
        ? await updateMyProfile(payload)
        : await createMyProfile(payload);
      setProfile(saved);
      setFormState({
        displayName: saved.displayName ?? '',
        bio: saved.bio ?? '',
      });
      setSuccess(profile ? 'Profile updated successfully.' : 'Profile created successfully.');
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setError(null);
    setSuccess(null);

    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      const updated = await uploadMyAvatar(file);
      setProfile(updated);
      if (!profile && !formState.displayName.trim() && !formState.bio.trim()) {
        setFormState({
          displayName: updated.displayName ?? user?.username ?? '',
          bio: updated.bio ?? '',
        });
      }
      setSuccess('Avatar updated successfully.');
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteSelfAccount();
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setIsDeactivating(false);
      setIsDeactivateOpen(false);
    }
  };

  const initialDisplayName = profile?.displayName ?? user?.username ?? '';
  const initialBio = profile?.bio ?? '';
  const isDirty =
    formState.displayName !== initialDisplayName || formState.bio !== initialBio;
  const canSave = profile ? isDirty : true;
  const avatarUrl = useMemo(
    () => resolveAvatarUrl(profile?.profileImageUrl),
    [profile?.profileImageUrl],
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <Spinner size="sm" />
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <Alert color="failure">
        <span className="font-medium">Session error.</span> Please sign in again.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Account</p>
          <h2 className="text-2xl font-semibold text-slate-900">My Profile</h2>
        </div>
        <Button color="light" onClick={handleSave} disabled={isSaving || !canSave}>
          {isSaving ? 'Saving...' : profile ? 'Save changes' : 'Create profile'}
        </Button>
      </header>

      {error && (
        <Alert color="failure">
          <span className="font-medium">Profile error.</span> {error}
        </Alert>
      )}

      {success && (
        <Alert color="success">
          <span className="font-medium">Success.</span> {success}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-2xl font-semibold text-slate-600">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{user.username.slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <Button
                    color="light"
                    size="xs"
                    className="absolute -bottom-3 -right-3 !rounded-full !px-2.5 !py-2 shadow-sm"
                    onClick={handlePickAvatar}
                    disabled={isUploading}
                  >
                    <HiOutlineCamera className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Profile identity
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {profile?.displayName || user.username}
                  </h3>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 px-4 py-3 text-xs text-slate-500">
                <p className="font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Member since
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Avatar: JPG, PNG, WEBP.</span>
              <span>Max size 2MB.</span>
              {isUploading && (
                <span className="flex items-center gap-2 text-slate-500">
                  <Spinner size="sm" />
                  Uploading avatar...
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display name</Label>
                <TextInput
                  id="display-name"
                  value={formState.displayName}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      displayName: event.target.value,
                    }))
                  }
                  placeholder={user.username}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <TextInput id="username" value={user.username} disabled />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formState.bio}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, bio: event.target.value }))
                  }
                  rows={5}
                  placeholder="Tell the community about yourself..."
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                Your display name and bio show up on your articles and comments.
              </span>
              <span className="font-semibold text-slate-600">
                {profile ? 'Profile active' : 'Profile not created yet'}
              </span>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Profile status
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Profile</span>
                <span className="font-semibold text-slate-900">
                  {profile ? 'Ready' : 'Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Avatar</span>
                <span className="font-semibold text-slate-900">
                  {profile?.profileImageUrl ? 'Uploaded' : 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Created</span>
                <span className="font-semibold text-slate-900">
                  {formatDate(profile?.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 text-xs text-slate-500">
            Keep your profile up to date so readers can recognize you. Changes are
            saved immediately after pressing the button.
          </div>

          <div className="rounded-2xl border border-rose-200/70 bg-rose-50/70 p-4 text-xs text-rose-700">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
              Danger zone
            </p>
            <p className="mt-2 text-sm text-rose-700">
              Deactivating your account will sign you out and disable access until an
              admin reactivates the account. The last active admin cannot deactivate
              their own account.
            </p>
            <Button
              color="failure"
              size="xs"
              className="mt-3"
              onClick={() => setIsDeactivateOpen(true)}
              disabled={isDeactivating}
            >
              Deactivate account
            </Button>
          </div>
        </aside>
      </div>

      <ConfirmModal
        open={isDeactivateOpen}
        title="Deactivate your account?"
        description="This will disable your account and log you out. You will need an admin to reactivate it."
        confirmLabel="Deactivate"
        confirmColor="failure"
        isLoading={isDeactivating}
        onConfirm={handleDeactivateAccount}
        onCancel={() => setIsDeactivateOpen(false)}
      />
    </div>
  );
};

export default Profile;
