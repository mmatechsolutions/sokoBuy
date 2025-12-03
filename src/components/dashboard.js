import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authcontext";

export default function Dashboard() {
  const { token, signout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // unauthorized -> sign out
        signout();
        return;
      }
      const data = await res.json();
      setProfile(data.user);
    };
    fetchProfile();
  }, [token]);

  return (
    <div style={{ maxWidth: 720, margin: "40px auto" }}>
      <h2>Dashboard</h2>
      {profile ? (
        <div>
          <p>
            Welcome, {profile.firstName} {profile.lastName}
          </p>
          <p>Email: {profile.email}</p>
          <p>Phone: {profile.phone}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      <button onClick={signout}>Sign out</button>
    </div>
  );
}
