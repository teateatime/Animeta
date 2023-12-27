import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Header from './Header';
import './styles/SearchResults.css';

function GenreSelector({ genres, selectedGenres, onGenreClick }) {
  return (
    <div className="anilist-genres-container">
      {genres.map((genre) => (
        <div
          key={genre}
          className={`genre-item ${selectedGenres.includes(genre) ? 'selected-genre' : ''}`}
          onClick={() =>
            onGenreClick((prevGenres) =>
              prevGenres.includes(genre) ? prevGenres.filter((g) => g !== genre) : [...prevGenres, genre]
            )
          }
        >
          <Typography variant="body2" className="genre-title">
            {genre}
          </Typography>
        </div>
      ))}
    </div>
  );
}

function SearchResults() {
  const location = useLocation();
  const [animeResults, setAnimeResults] = useState([]);
  const [mangaResults, setMangaResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);

  const genresRow1 = ['Action', 'Adventure', 'Comedy', 'Drama'];
  const genresRow2 = ['Fantasy', 'Romance', 'Slice of Life', 'Horror'];

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchTerm = searchParams.get('search');

    const fetchData = async () => {
      try {
        // Check if the anime data is already in cache
        const cachedAnimeData = localStorage.getItem(`anime_${searchTerm}`);
        if (cachedAnimeData) {
          setAnimeResults(JSON.parse(cachedAnimeData));
        } else {
          const animeResponse = await axios.get(`https://api.jikan.moe/v4/anime?q=${searchTerm}`);
          setAnimeResults(animeResponse.data.data || []);
          // Cache the anime data
          localStorage.setItem(`anime_${searchTerm}`, JSON.stringify(animeResponse.data.data));
        }

        // Check if the manga data is already in cache
        const cachedMangaData = localStorage.getItem(`manga_${searchTerm}`);
        if (cachedMangaData) {
          setMangaResults(JSON.parse(cachedMangaData));
        } else {
          const mangaResponse = await axios.get(`https://api.jikan.moe/v4/manga?q=${searchTerm}&sfw`);
          setMangaResults(mangaResponse.data.data || []);
          // Cache the manga data
          localStorage.setItem(`manga_${searchTerm}`, JSON.stringify(mangaResponse.data.data));
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch anime and manga:', error);
        setError('Failed to fetch anime and manga. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search]);

  // Display loading message
  if (loading) {
    return <div className='loading'>Loading anime and manga details...</div>;
  }

  // Handle error messages
  if (error) {
    return (
      <>
        <div className="error-message" style={{ color: 'blue', textAlign: 'center', margin: '10px' }}>
          {error}
        </div>
        <div className="sidebar" style={{ flex: '0 0 200px', backgroundColor: 'background-color: #1a202c' }}>
          <Typography variant='h4' className='currAniTitle' style={{ marginTop: '10px', textAlign: 'center' }}>
            Genres
          </Typography>
          <GenreSelector genres={genresRow1} selectedGenres={selectedGenres} onGenreClick={setSelectedGenres} />
          <GenreSelector genres={genresRow2} selectedGenres={selectedGenres} onGenreClick={setSelectedGenres} />
        </div>
      </>
    );
  }

  const maxTitleLength = 20;

  const showAnimeResults = animeResults.some(
    (animeItem) =>
      selectedGenres.length === 0 || animeItem.genres.some((genre) => selectedGenres.includes(genre.name))
  );

  const showMangaResults = mangaResults.some(
    (mangaItem) =>
      selectedGenres.length === 0 || mangaItem.genres.some((genre) => selectedGenres.includes(genre.name))
  );

  return (
    <>
      <div>
        <Header />
        <div className="sidebar" style={{ flex: '0 0 200px', backgroundColor: '#1a202c' }}>
          <Typography variant="h4" className="genresTitle" style={{ padding: '5px', textAlign: 'center' }}>
            Genres
          </Typography>
          <GenreSelector genres={genresRow1} selectedGenres={selectedGenres} onGenreClick={setSelectedGenres} />
          <GenreSelector genres={genresRow2} selectedGenres={selectedGenres} onGenreClick={setSelectedGenres} />
        </div>

        {/* Display genres and error messages */}
        {(!showAnimeResults && !showMangaResults) && (
          <div style={{ margin: '10px', textAlign: 'center' }}>
            <p className="searchGenreError">
              No anime or manga results found{selectedGenres.length > 0 ? ` for the selected genres: ${selectedGenres.join(', ')}.` : '.'}
            </p>
          </div>
        )}

        {/* Display anime results */}
        {showAnimeResults && (
          <div style={{ margin: '10px' }}>
            <Typography variant="h4" className="aniResultsTitle" style={{ margin: '10px', textAlign: 'center' }}>
              Anime Results
            </Typography>
            <div className="search-results">
              {animeResults.length > 0 ? (
                animeResults
                  .filter((animeItem) => selectedGenres.length === 0 || animeItem.genres.some((genre) => selectedGenres.includes(genre.name)))
                  .map((animeItem) => (
                    <div className="searchAnimeItem" key={animeItem.mal_id}>
                      <Link to={`/summary/${animeItem.mal_id}`}>
                        <div className="aniresult-item">
                          <Typography variant="body2" component="h3" title={animeItem.title}>
                            {animeItem.title.length > maxTitleLength ? `${animeItem.title.substring(0, maxTitleLength - 3)}...` : animeItem.title}
                          </Typography>
                          {animeItem.images && animeItem.images.jpg && animeItem.images.jpg.large_image_url && (
                            <img className="aniresult-img" src={animeItem.images.jpg.large_image_url} alt={animeItem.title} />
                          )}
                        </div>
                      </Link>
                    </div>
                  ))
              ) : (
                <p className="searchContentError">No anime results found{selectedGenres.length > 0 ? ' for the selected genres.' : '.'}</p>
              )}
            </div>
          </div>
        )}

        {/* Display manga results */}
        {showMangaResults && (
          <div style={{ margin: '10px' }}>
            <Typography variant="h4" className="mangaResultsTitle" style={{ marginTop: '10px', textAlign: 'center' }}>
              Manga Results
            </Typography>
            <div className="search-results">
              {mangaResults.length > 0 ? (
                mangaResults
                  .filter((mangaItem) => selectedGenres.length === 0 || mangaItem.genres.some((genre) => selectedGenres.includes(genre.name)))
                  .map((mangaItem) => (
                    <div className="searchMangaItem" key={mangaItem.mal_id}>
                      <Link to={`/summary/${mangaItem.mal_id}`}>
                        <div className="manga-item">
                          <Typography variant="body2" component="h3" title={mangaItem.title}>
                            {mangaItem.title.length > maxTitleLength ? `${mangaItem.title.substring(0, maxTitleLength - 3)}...` : mangaItem.title}
                          </Typography>
                          {mangaItem.images && mangaItem.images.jpg && mangaItem.images.jpg.large_image_url && (
                            <img className="manga-img" src={mangaItem.images.jpg.large_image_url} alt={mangaItem.title} />
                          )}
                        </div>
                      </Link>
                    </div>
                  ))
              ) : (
                <p className="searchContentError">
                  No manga results found{selectedGenres.length > 0 ? ' for the selected genres.' : '.'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SearchResults;