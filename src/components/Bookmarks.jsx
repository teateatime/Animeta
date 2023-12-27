import React, { useState, useEffect } from 'react';
import { firebase, firestore } from '../firebase';
import { Typography, List, ListItem, ListItemText } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import Header from './Header';
import './styles/Bookmarks.css'; // Import your custom CSS for styling

function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const user = firebase.auth().currentUser;

        if (user) {
          const bookmarksRef = firestore.collection('users').doc(user.uid).collection('bookmarks');
          const snapshot = await bookmarksRef.get();

          const bookmarkList = snapshot.docs.map((doc) => ({
            id: doc.id,
            malId: doc.data().malId,
            title: doc.data().title,
          }));

          setBookmarks(bookmarkList);
          setIsLoading(false); // Set loading to false after bookmarks are fetched
        } else {
          console.log('User not authenticated.');
        }
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      }
    };

    fetchBookmarks();
  }, []);

  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      const user = firebase.auth().currentUser;

      if (user) {
        await firestore
          .collection('users')
          .doc(user.uid)
          .collection('bookmarks')
          .doc(bookmarkId)
          .delete();
        console.log('Bookmark deleted:', bookmarkId);

        setBookmarks((prevBookmarks) =>
          prevBookmarks.filter((bookmark) => bookmark.id !== bookmarkId)
        );
      } else {
        console.log('User not authenticated.');
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  return (
    <div>
      <Header />
      <div className="bookmarks-container">
        <Typography variant="h4" className="bookmarks-heading">
          Bookmarks
        </Typography>
        {isLoading ? (
          <Typography variant="body1" className="no-bookmarks-message">
            Loading bookmarks...
          </Typography>
        ) : bookmarks.length === 0 ? (
          <Typography variant="body1" className="no-bookmarks-message">
            No bookmarks available.
          </Typography>
        ) : (
          <List className="bookmarks-list">
            {bookmarks.map((bookmark) => (
              <ListItem key={bookmark.id} className="bookmark-item">
                <div className="bookmark-content">
                  <div className="bookmark-title-container">
                    <a href={`/summary/${bookmark.malId}`} target="_blank" rel="noopener noreferrer" className="bookmark-link">
                      <ListItemText className='bookmark-title' primary={bookmark.title.length > 20 ? `${bookmark.title.slice(0, 20)}...` : bookmark.title} />
                    </a>
                  </div>
                  <div className="bookmark-action-container">
                    <button
                      className="cohesive-delete-button"
                      onClick={() => handleDeleteBookmark(bookmark.id)}
                    >
                      <DeleteIcon />
                      <Typography variant='body2'>Delete from watchlist</Typography>
                    </button>
                  </div>
                </div>
              </ListItem>
            ))}
          </List>
        )}
      </div>
    </div>
  );
}

export default BookmarksPage;
