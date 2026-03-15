import React, { useEffect, useState } from 'react'
import Navigation from '../components/Navigation'
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import LeftNav from '../components/LeftNav';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import API_BASE_URL from '../config/api.js';

export default function Home() {
  let navigate = useNavigate();
  let [username, setUsername] = useState("");
  let [id, setId] = useState("");
  let [selectedNote, setSelectedNote] = useState(null);
  let [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Edit State
  let [isEditing, setIsEditing] = useState(false);
  let [editTitle, setEditTitle] = useState("");
  let [editContent, setEditContent] = useState("");

  useEffect(() => {
    let userData = JSON.parse(localStorage.getItem("userData"));
    let token = userData?.token;
    if (!token) {
      navigate("/login");
    } else {
      setUsername(userData.name);
      setId(userData.id);
    }
  }, [])

  const handleNoteSelect = (note) => {
    setSelectedNote(note);
    setIsEditing(false); // Reset edit mode when selecting a new note
  };

  const handleEditClick = () => {
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      let token = JSON.parse(localStorage.getItem("userData")).token;
      let res = await axios.put(`${API_BASE_URL}/updateNote/${selectedNote._id}`, {
        title: editTitle,
        content: editContent
      }, {
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${token}`
        }
      });

      if (res.data.success) {
        setSelectedNote(res.data.note); // Update the currently viewed note
        setIsEditing(false);
        setRefreshTrigger(prev => prev + 1); // Trigger sidebar refresh
      }
    } catch (error) {
      console.error("Error updating note:", error);
      alert(error.response?.data?.message || "Failed to update note");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      let token = JSON.parse(localStorage.getItem("userData")).token;
      let res = await axios.delete(`${API_BASE_URL}/deleteNote/${selectedNote._id}`, {
        headers: {
          "authorization": `Bearer ${token}`
        }
      });

      if (res.data.success) {
        setSelectedNote(null); // Clear the view
        setRefreshTrigger(prev => prev + 1); // Trigger sidebar refresh
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      alert(error.response?.data?.message || "Failed to delete note");
    }
  };

  return (
    <div>
      <Navigation login='true' title='MyNotes for Revision' username={username} id={id} />
      <div className={styles.container}>
        <div className={styles.left}>
          <LeftNav onNoteSelect={handleNoteSelect} refreshTrigger={refreshTrigger} />
        </div>
        <div className={styles.right}>
          <div className={styles.right_top}>
            <h1>My Notes</h1>
            {selectedNote && (
              <div className={styles.noteContent}>
                {!isEditing && (
                  <div className={styles.noteActions}>
                    <button onClick={handleEditClick} className={styles.iconBtn} title="Edit Note">
                      <EditIcon />
                    </button>
                    <button onClick={handleDelete} className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Delete Note">
                      <DeleteIcon />
                    </button>
                  </div>
                )}
                
                {isEditing ? (
                  <div className={styles.editForm}>
                    <input 
                      type="text" 
                      className={styles.editTitleInput} 
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)} 
                      placeholder="Note Title"
                      autoFocus
                    />
                    <textarea 
                      className={styles.editContentArea} 
                      value={editContent} 
                      onChange={(e) => setEditContent(e.target.value)} 
                      placeholder="Note Content"
                      rows={10}
                    />
                    <div className={styles.editActions}>
                      <button onClick={handleSaveEdit} className={styles.saveBtn}>Save</button>
                      <button onClick={handleCancelEdit} className={styles.cancelBtn}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2>{selectedNote.title}</h2>
                    <p>{selectedNote.content}</p>
                  </>
                )}
              </div>
            )}
            {!selectedNote && (
              <div className={styles.welcomeMessage}>
                <h2>Welcome to MyNotes!</h2>
                <p>Select a note from the left sidebar to view its content.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
