import React, { useState, useEffect, useRef } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import defaultProfileImage from '../assets/images/default-profile.png';
import Paper from '@mui/material/Paper';
import Header from './Header';
import { firebase, firestore } from '../firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import './styles/ProfilePage.css';

function ProfilePage() {
  const storage = getStorage();
  const [userProfile, setUserProfile] = useState({
    username: 'John Doe',
    favoriteAnime: 'One Piece',
    profileImageURL: null, // Store the image URL in the state
  });

  const [editableField, setEditableField] = useState({
    username: null,
    favoriteAnime: null,
  });

  const userId = firebase.auth().currentUser.uid; // Get the current user's ID

  // Fetch user profile data from Firestore
  useEffect(() => {
    const userRef = firestore.collection('users').doc(userId);
    userRef.get().then((doc) => {
      if (doc.exists) {
        setUserProfile(doc.data());
      }
    });
  }, [userId]);

  const handleImageUpload = (file) => {
    const storageRef = ref(storage, `images/${userId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        // Handle state change events here (progress, pause, resume)
      },
      (error) => {
        // Handle unsuccessful uploads
        console.error('Error uploading image:', error);
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('Image uploaded successfully. Download URL:', downloadURL);
          // Update the user profile with the image download URL
          handleSaveImageURL(downloadURL); // Create this function to update Firestore with the URL
        });
      }
    );
  };

  const handleSaveImageURL = async (imageURL) => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      await userRef.update({ profileImageURL: imageURL });

      setUserProfile((prevProfile) => ({
        ...prevProfile,
        profileImageURL: imageURL,
      }));
      console.log('Profile image URL updated successfully.');
    } catch (error) {
      console.error('Error updating profile image URL:', error);
    }
  };

  const editableFieldRef = useRef(null);

  const handleEdit = (field) => {
    console.log('handleEdit')
    setEditableField((prevEditableField) => ({
      ...prevEditableField,
      [field]: userProfile[field], // Store the current value
    }));
    console.log(field) // says favoriteAnime and username respectively
  };

  const handleSave = async (field) => {
    console.log('handlesave')
    try {
      const userRef = firestore.collection('users').doc(userId); // Define userRef here
      const updatedField = editableField[field];

      if (updatedField !== null) {
        await userRef.update({ [field]: updatedField });

        setUserProfile((prevProfile) => ({
          ...prevProfile,
          [field]: updatedField,
        }));
        setEditableField((prevEditableField) => ({
          ...prevEditableField,
          [field]: null,
        }));
        console.log(`${field} updated successfully.`);
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  const handleInputChange = (e) => {
    console.log('handleInputChange')
    const { name, value } = e.target;
    setEditableField((prevEditableField) => ({
      ...prevEditableField,
      [name]: value,
    }));
  };

  const handleKeyDown = async (e, field) => {
    console.log('handleKeyDown');
    if (e.key === 'Enter') {
      await handleSave(field); // Await the handleSave function
    }
  };  

  const inputStyle = {
    color: editableField === 'username' || editableField === 'favoriteAnime' ? 'black' : 'whitesmoke',
    textAlign: 'center',
  };

  const commonTextStyle = {
    color: 'whitesmoke',
    textAlign: 'center',
  };

  return (
    <div>
      <Header />
      <Container>
        <Paper elevation={3} className='profile-card'>
          <Typography variant="h4" className='profileTitle' style={{ margin: '10px' }} align="center">Profile</Typography>
          <div className="profile-info" style={{ textAlign: 'center' }}>
            <div>
              {userProfile.profileImageURL ? ( // Conditionally render the image only if there's a profileImageURL
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={userProfile.profileImageURL}
                    alt="Profile"
                    style={{
                      width: '200px',
                      height: '200px',
                      display: 'block',
                      margin: '10px auto',
                      borderRadius: '50%',
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    style={{ display: 'none' }}
                    ref={editableFieldRef} // Add this ref to access the input element
                  />
                  {!editableField.profileImage && (
                    <PhotoCameraIcon
                      onClick={() => {
                        editableFieldRef.current.click(); // Trigger the file input click
                        handleEdit('profileImage');
                      }}
                      className="camera-icon" // Add a class for styling
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: 'white',
                      }}
                    />
                  )}
                </div>
              ) : null}

              {!userProfile.profileImageURL && ( // Render the default image only if there's no profileImageURL
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={defaultProfileImage}
                    alt="Default Profile"
                    style={{
                      width: '200px',
                      height: '200px',
                      display: 'block',
                      margin: '10px auto',
                      borderRadius: '50%',
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    style={{ display: 'none' }}
                    ref={editableFieldRef} // Add this ref to access the input element
                  />
                  {!editableField.profileImage && (
                    <PhotoCameraIcon
                      onClick={() => {
                        editableFieldRef.current.click(); // Trigger the file input click
                        handleEdit('profileImage');
                      }}
                      className="camera-icon" // Add a class for styling
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: 'white',
                      }}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="editable-section">
              {editableField.username !== null ? (
                <TextField
                  type="text"
                  name="username"
                  value={editableField.username}
                  onChange={handleInputChange}
                  onBlur={() => handleSave('username')}
                  onKeyDown={(e) => handleKeyDown(e, 'username')}
                  InputProps={{ style: commonTextStyle }}
                />
              ) : (
                <>
                  <span style={commonTextStyle}>Username: {userProfile.username}</span>
                  {!editableField.username && (
                    <EditIcon
                      onClick={() => handleEdit('username')}
                      className="edit-icon"
                      style={{ marginLeft: '8px', fontSize: '16px', cursor: 'pointer', color: 'white' }}
                    />
                  )}
                </>
              )}
            </div>

            <div className="editable-section">
              {editableField.favoriteAnime !== null ? (
                <TextField
                  type="text"
                  name="favoriteAnime"
                  value={editableField.favoriteAnime}
                  onChange={handleInputChange}
                  onBlur={() => handleSave('favoriteAnime')}
                  onKeyDown={(e) => handleKeyDown(e, 'favoriteAnime')}
                  InputProps={{ style: commonTextStyle }}
                />
              ) : (
                <>
                  <span style={commonTextStyle}>Favorite Anime: {userProfile.favoriteAnime}</span>
                  {!editableField.favoriteAnime && (
                    <EditIcon
                      onClick={() => handleEdit('favoriteAnime')}
                      className="edit-icon"
                      style={{ marginLeft: '8px', fontSize: '16px', cursor: 'pointer', color: 'white' }}
                    />
                  )}
                </>
              )}
            </div>

          </div>
        </Paper>
      </Container>
    </div>
  );
}

export default ProfilePage;
