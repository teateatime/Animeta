import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Header from './Header';
import { firebase, firestore } from '../firebase';
import { setBookmarks, bookmarks } from './Bookmarks';
import './styles/SummaryPage.css';

function SummaryPage() {
  const { malId } = useParams();
  const [mediaDetails, setMediaDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [editableReviewField, setEditableReviewField] = useState({});
  const [editModes, setEditModes] = useState({});
  const navigate = useNavigate();

  const videoRef = useRef(null); // Create a ref to access the video element

  useEffect(() => {
    // Pause the video when the component mounts and whenever mediaDetails change
    if (videoRef.current && videoRef.current.pause) {
      videoRef.current.pause();
    }
  }, [mediaDetails, videoRef]);  

  const user = firebase.auth().currentUser;

  useEffect(() => {
    if (user) {
      fetchReviews(); // Call the function to fetch reviews when the component mounts and user is authenticated
    } else {
      // Handle the case where the user is not authenticated
      console.log('User not authenticated.');
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const currentUser = firebase.auth().currentUser;
  
      if (currentUser) {
        console.log('Fetching reviews for user:', currentUser.uid);
        const userReviewsRef = firestore.collection('users').doc(currentUser.uid).collection('reviews');
        const reviewsSnapshot = await userReviewsRef.where('mediaId', '==', malId).get();
  
        const fetchedReviews = reviewsSnapshot.docs.map((reviewDoc) => ({
          id: reviewDoc.id,
          ...reviewDoc.data(),
        }));
  
        console.log('Fetched reviews:', fetchedReviews);
        setReviews(fetchedReviews);
      } else {
        console.log('User not authenticated.');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };  

  const handleAddBookmark = async () => {
    try {
      const user = firebase.auth().currentUser;
  
      if (user) {
        await firestore.collection('users').doc(user.uid).collection('bookmarks').add({
          title: mediaDetails.title,
          malId: malId,
        });
  
        setIsBookmarked(true); // Set bookmark status to true
        console.log('Bookmark added:', mediaDetails.title);
      } else {
        console.log('User not authenticated.');
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  }

  const handleAddReview = async (content) => {
    try {
      const user = firebase.auth().currentUser;
  
      if (user) {
        const reviewData = {
          userId: user.uid,
          mediaId: malId,
          content: content,
          date: new Date().toISOString(), // Add the current date
        };
  
        await firestore.collection('users').doc(user.uid).collection('reviews').add(reviewData);
  
        console.log('Review added:', content);
        setNewReviewContent('');
        setIsAddingReview(false);
  
        // Fetch updated reviews immediately after adding a new review
        fetchReviews(); // Call the function to fetch reviews again
      } else {
        console.log('User not authenticated.');
      }
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };  
  
  const handleReviewInputChange = (e, reviewId) => {
    console.log('handleReviewInputChange');
    const { value } = e.target;
    setEditableReviewField((prevEditableReviewField) => ({
      ...prevEditableReviewField,
      [reviewId]: value,
    }));
  };
  
  const handleEditReview = (review) => {
    console.log('handleEditReview');
    console.log(review);

    // Update the edit mode status for the specific review
    setEditModes((prevEditModes) => ({
      ...prevEditModes,
      [review.id]: true,
    }));
  };

  const handleReviewKeyDown = async (e, reviewId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleSaveReview(reviewId);
    }
  };

  const handleSaveReview = async (reviewId) => {
    try {
      const updatedContent = editableReviewField[reviewId];
      if (updatedContent !== null) {
        const user = firebase.auth().currentUser;
        if (user) {
          const reviewsRef = firestore.collection('users').doc(user.uid).collection('reviews');
          await reviewsRef.doc(reviewId).update({
            content: updatedContent,
            date: new Date().toISOString(), // Update the date to the current date
          });
  
          setReviews((prevReviews) =>
            prevReviews.map((review) => {
              if (review.id === reviewId) {
                return { ...review, content: updatedContent, date: new Date().toISOString() };
              }
              return review;
            })
          );
  
          // Reset the edit mode for the specific review
          setEditModes((prevEditModes) => ({
            ...prevEditModes,
            [reviewId]: false,
          }));
  
          console.log('Review updated successfully.');
        } else {
          console.log('User not authenticated.');
        }
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    console.log('handleDeleteReview')
    try {
      const user = firebase.auth().currentUser;
      console.log(user)
      console.log('reviewId: ' + reviewId)
      if (user) {
        console.log('user: ' + user.uid)
        const reviewsRef = firestore.collection('users').doc(user.uid).collection('reviews');
        await reviewsRef.doc(reviewId).delete();
        setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
        console.log('Review deleted:', reviewId);
      } else {
        console.log('User not authenticated.');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };  

  const handleDeleteBookmark = async () => {
    try {
      const user = firebase.auth().currentUser;

      if (user) {
        const bookmarksRef = firestore.collection('users').doc(user.uid).collection('bookmarks');
        const snapshot = await bookmarksRef.where('malId', '==', malId).get();

        if (!snapshot.empty) {
          snapshot.docs[0].ref.delete(); // Delete the bookmark document
          setIsBookmarked(false); // Set bookmark status to false
          console.log('Bookmark deleted:', malId);
        }
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const checkIfBookmarked = async () => {
    const user = firebase.auth().currentUser;

    if (user) {
      const bookmarksRef = firestore.collection('users').doc(user.uid).collection('bookmarks');
      const snapshot = await bookmarksRef.where('malId', '==', malId).get();

      if (!snapshot.empty) {
        setIsBookmarked(true);
      }
    }
  };
  
  useEffect(() => {
    const fetchMediaDetails = async () => {
      try {
        console.log('Fetching media details for malId:', malId);

        try {
          const animeResponse = await axios.get(`https://api.jikan.moe/v4/anime/${malId}`);
          const animeData = animeResponse.data.data;

          console.log('Anime response:', animeData);

          if (animeData) {
            setMediaDetails(animeData);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error fetching anime details:', error);
        }

        // If anime details not found, attempt to fetch manga details
        try {
          const mangaResponse = await axios.get(`https://api.jikan.moe/v4/manga/${malId}`);
          const mangaData = mangaResponse.data.data;

          console.log('Manga response:', mangaData);

          if (mangaData) {
            setMediaDetails(mangaData);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error fetching manga details:', error);
        }

        setError('Media details not found.');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching media details:', error);
        setError('Error fetching media details. Please try again later.');
        setLoading(false);
      }
    };

    fetchMediaDetails();
  }, [malId]);

  useEffect(() => {
    checkIfBookmarked(); // Check bookmark status
  }, [malId]);

  useEffect(() => {
    console.log(mediaDetails);
  }, [mediaDetails]);

  useEffect(() => {
    fetchReviews(); // Fetch reviews when the component mounts
  }, [malId]);

  if (loading) {
    return <div className='loading'>Loading summary...</div>;
  }

  if (error || !mediaDetails.title) {
    return <div className='searchContentError'>{error || 'Media details not found.'}</div>;
  }

  const showVideo = mediaDetails.trailer && mediaDetails.trailer.embed_url;

  return (
    <div>
      <Header />
      <Container className="summary-page">
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={4}>
            <div className='summary-left'>
              <Button
                variant="outlined"
                color="primary"
                style={{ margin: '20px auto 0', display: 'block' }}
                onClick={() => navigate(-1)}
              >
                Back to Previous Page
              </Button>
              <Typography style={{margin: '0 auto', textAlign: 'center'}} variant="h5" className='aniSummaryTitle'>{mediaDetails.title}</Typography>
              <img style={{margin: '0 auto'}} src={mediaDetails.images?.jpg?.large_image_url || ''} alt={mediaDetails.title} className="media-image" />
              {user && (
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ margin: '20px auto 0', display: 'block' }}
                  onClick={isBookmarked ? handleDeleteBookmark : handleAddBookmark}
                  disabled={!user} // Disable the button when user is not logged in
                >
                  {isBookmarked ? 'Saved' : 'Add to Bookmarks'} {isBookmarked && <span>✔️</span>}
                </Button>
              )}
            </div>
          </Grid>
          <Grid item xs={12} md={8} style={{marginTop: '50px'}}>
            <Paper elevation={3} className='summary-right glassmorphism'>
              <div className='sumMediaDetails'>
                <div className="synopsis-section">
                  <Typography variant="h6" className='sumDetailTitles'>Synopsis</Typography>
                  <p>{mediaDetails.synopsis}</p>
                </div>
                <div className="score-section">
                  <Typography variant="h6" className='sumDetailTitles'>Statistics</Typography>
                  <p>Score: {mediaDetails.score}/10</p>
                  <p>Scored By: {mediaDetails.scored_by}</p>
                  <p>Rank: #{mediaDetails.rank}</p>
                  <p>Popularity: #{mediaDetails.popularity}</p>
                  <p>Members: {mediaDetails.members}</p>
                  <p>Favorites: {mediaDetails.favorites}</p>
                </div>
                <div className='media-info-section'>
                  <Typography variant="h6" className='sumDetailTitles'>Information</Typography>
                  <p>Type: {mediaDetails.type}</p>
                  <p>Source: {mediaDetails.source}</p>
                  <p>Episodes: {mediaDetails.episodes}</p>
                  <p>Rating: {mediaDetails.rating}</p>
                  <p>Status: {mediaDetails.status}</p>
                  <p>Airing: {mediaDetails.airing ? 'Yes' : 'No'}</p>
                  {mediaDetails.aired && <p>Aired: {mediaDetails.aired.string}</p>}
                  <p>Duration: {mediaDetails.duration}</p>
                </div>
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            {showVideo && (
              <Paper elevation={3} className='trailer-container glassmorphism'>
                <iframe
                  ref={videoRef}
                  width="100%"
                  height="315"
                  src={mediaDetails.trailer.embed_url}
                  title={`${mediaDetails.title} Trailer`}
                  frameBorder="0"
                  allowFullScreen
                />
              </Paper>
            )}
          </Grid>

          <Grid item xs={12} style={{ textAlign: 'center' }}>
            {user && (
              <Typography variant="h5" className='aniSummaryTitle'>Thoughts on Series</Typography>
            )}
          </Grid>

          <Grid item xs={12} style={{ textAlign: 'center' }}>
            {user && (
              <div className="add-review-form">
                {isAddingReview ? (
                  <>
                    <textarea
                      placeholder="Write your review here..."
                      value={newReviewContent}
                      onChange={(e) => setNewReviewContent(e.target.value)}
                    />
                    <div>
                      <Button 
                        variant="outlined"
                        color="primary"
                        onClick={() => handleAddReview(newReviewContent)}>
                        Add Note
                      </Button>
                      <Button 
                        variant="outlined"
                        color="secondary"
                        onClick={() => setIsAddingReview(false)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button 
                    variant="outlined"
                    color="primary"
                    onClick={() => setIsAddingReview(true)}>Add Note</Button>
                )}
              </div>
            )}
          </Grid>

          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <div className="review-list">
              {reviews.map((review) => (
                <Paper key={review.id} elevation={3} className="user-review">
                  {editModes[review.id] ? (
                    <>
                      <textarea
                        value={editableReviewField[review.id] || review.content}
                        onChange={(e) => handleReviewInputChange(e, review.id)}
                        onKeyDown={(e) => handleReviewKeyDown(e, review.id)}
                      />
                      <Button onClick={() => handleSaveReview(review.id)}>Save</Button>
                      <Button onClick={() => setEditModes((prevEditModes) => ({ ...prevEditModes, [review.id]: false }))}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="body1" className='review-content-item'>{review.content}</Typography>
                      <Typography variant="caption" className='review-date'>
                        {new Date(review.date).toLocaleDateString()}
                      </Typography>
                      {user && review.userId === user.uid && (
                        <>
                          <Button onClick={() => handleEditReview(review)}>Edit</Button>
                          <Button onClick={() => handleDeleteReview(review.id)}>Delete</Button>
                        </>
                      )}
                    </>
                  )}
                </Paper>
              ))}
            </div>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default SummaryPage;