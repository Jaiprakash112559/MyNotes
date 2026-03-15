import React, { useEffect, useState } from 'react'
import styles from './Profile.module.css'
import axios from 'axios'
import CustomButton from '../components/CustomButton';
import NavBar from '../components/Navigation';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api.js';

export default function Profile() {
  let [err, setErr] = useState("");
  let [data, setData] = useState({});
  let [isEditing, setIsEditing] = useState(false);
  let [editName, setEditName] = useState("");
  let [isChangingPassword, setIsChangingPassword] = useState(false);
  let [currentPassword, setCurrentPassword] = useState("");
  let [newPassword, setNewPassword] = useState("");
  let token = JSON.parse(localStorage.getItem("userData")).token;
  let id = JSON.parse(localStorage.getItem("userData")).id;
  let navigate = useNavigate();
  
  useEffect(() => {
    fetchData();
  }, [])
  
  async function fetchData() {
    try {
      let res = await axios.get(`${API_BASE_URL}/profile/${id}`, {
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${token}`
        }
      });
      if (res.status === 200) {
        setData(res.data.data);
        setEditName(res.data.data.name);
      } else {
        alert("Something went wrong, please try again later");
      }
    } catch (error) {
      setErr(error.message);
      console.log(error);
    }
  }

  async function handleUpdate() {
    try {
      setErr("");
      let res = await axios.put(`${API_BASE_URL}/update`, {
        email: data.email,
        name: editName
      }, {
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${token}`
        }
      });
      
      if (res.status === 200) {
        setData({ ...data, name: editName });
        setIsEditing(false);
        // Update local storage so the NavBar reflects the new name on refresh
        let userData = JSON.parse(localStorage.getItem("userData"));
        userData.name = editName;
        localStorage.setItem("userData", JSON.stringify(userData));
      }
    } catch (error) {
      setErr(error.response?.data?.message || "Failed to update profile");
      console.log(error);
    }
  }

  async function handleChangePassword() {
    try {
      setErr("");
      let res = await axios.put(`${API_BASE_URL}/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${token}`
        }
      });

      if (res.status === 200) {
        alert("Password updated successfully!");
        setIsChangingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (error) {
      setErr(error.response?.data?.message || "Failed to change password");
      console.log(error);
    }
  }
  
  function logoutHandler() {
    localStorage.removeItem("userData");
    navigate("/login");
  }
  
  return (
    <>
      <NavBar login='true' title='MyNotes for Revision' username={data.name} id={id} />
      <div className={styles.profileCard}>
        {err && <p className={styles.err}>{err}</p>}
        <h1 className={styles.title}>Profile</h1>
        
        {isChangingPassword ? (
          <div className={styles.profileInfo}>
            <div className={styles.editRow}>
              <span className={styles.label}>Current:</span>
              <input 
                type="password" 
                className={styles.editInput} 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                placeholder="Current Password"
                autoFocus 
              />
            </div>
            <div className={styles.editRow}>
              <span className={styles.label}>New:</span>
              <input 
                type="password" 
                className={styles.editInput} 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="New Password"
              />
            </div>
          </div>
        ) : (
          <div className={styles.profileInfo}>
            {isEditing ? (
              <div className={styles.editRow}>
                <span className={styles.label}>Name:</span>
                <input 
                  type="text" 
                  className={styles.editInput} 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  autoFocus 
                />
              </div>
            ) : (
              <p><span className={styles.label}>Name:</span> {data.name}</p>
            )}
            <p><span className={styles.label}>Email:</span> {data.email}</p>
            <p><span className={styles.label}>Role:</span> {data.role}</p>
            <p><span className={styles.label}>Phone:</span> {data.phone}</p>
          </div>
        )}
        
        {isChangingPassword ? (
            <>
                <CustomButton btnText='Update Password' handler={handleChangePassword} customStyle={styles.btn} />
                <CustomButton btnText='Cancel' handler={() => { setIsChangingPassword(false); setCurrentPassword(""); setNewPassword(""); }} customStyle={styles.btn} />
            </>
        ) : isEditing ? (
            <>
                <CustomButton btnText='Save Changes' handler={handleUpdate} customStyle={styles.btn} />
                <CustomButton btnText='Cancel' handler={() => { setIsEditing(false); setEditName(data.name); }} customStyle={styles.btn} />
            </>
        ) : (
            <>
                <CustomButton btnText='Edit Profile' handler={() => setIsEditing(true)} customStyle={styles.btn} />
                <CustomButton btnText='Change Password' handler={() => setIsChangingPassword(true)} customStyle={styles.btn} />
                <CustomButton btnText='Refresh' handler={fetchData} customStyle={styles.btn} />
                <CustomButton btnText='Logout' handler={logoutHandler} customStyle={styles.btn} />
            </>
        )}
      </div>
    </>
  )
}
