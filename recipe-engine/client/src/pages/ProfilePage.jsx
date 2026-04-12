/**
 * @file ProfilePage.jsx
 * @description User profile page — scaffold created by Hossein, implementation by Flora.
 * @author Hossein (scaffold), Flora (implementation)
 */

import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Profile</h1>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
      {/* Flora: add edit profile form here */}
    </div>
  );
};

export default ProfilePage;
