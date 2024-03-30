import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Typography from '@mui/material/Typography';
import Header from './Header';
import GitHubIcon from '@material-ui/icons/GitHub';
import './styles/AnimeList.css';

function AnimeList() {
  const [animeFacts, setAnimeFacts] = useState([]);

  // useEffect(() => {
  //   // Fetch anime facts
  //   axios.get('http://localhost:3000/api/anime-facts')
  //     .then(response => {
  //       setAnimeFacts(response.data);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching anime facts:', error);
  //     });
  // }, []);

  const animeFactsSection = (
    <div className='anime-facts-section'>
      <Typography variant='h4' className='animeFactsTitle' style={{ marginTop: '10px' }}>
        Anime Facts
      </Typography>
      <div className='anime-facts-list'>
        <Typography variant='body1' className='anime-fact'>
          <strong>Jujutsu Kaisen: </strong>Gojo can cast domain expansion multiple times a day, while others are limited to only once a day
        </Typography>
        <Typography variant='body1' className='anime-fact'>
          <strong>Gintama: </strong>The original title of the series was Yorozuya Gin-chan.
        </Typography>
        {/* {animeFacts.map((fact, index) => (
          <AnimeFact key={index} fact={fact} />
        ))} */}
      </div>
    </div>
  );

  // Fetch current season anime data
  const fetchCurrentSeasonAnime = async () => {
    const response = await axios.get('https://api.jikan.moe/v4/seasons/now');
    return response.data.data;
  };

  // Fetch upcoming seasonal anime data
  const fetchUpcomingSeasonAnime = async () => {
    const response = await axios.get('https://api.jikan.moe/v4/seasons/upcoming');
    return response.data.data;
  };

  // Fetch trending anime data
  const fetchTrendingAnime = async () => {
    const response = await axios.get('https://api.jikan.moe/v4/top/anime');
    return response.data.data;
  };

  // Fetch recommended manga data
  const fetchRecommendedManga = async () => {
    const response = await axios.get('https://api.jikan.moe/v4/top/manga');
    return response.data.data;
  };

  // Use useQuery hook to fetch data for recommended manga
  const {
    data: recommendedManga,
    isLoading: recommendedMangaLoading,
    isError: recommendedMangaError,
  } = useQuery('recommendedManga', fetchRecommendedManga);

  // Use useQuery hooks to fetch data
  const {
    data: currentSeasonAnime,
    isLoading: currentSeasonLoading,
    isError: currentSeasonError,
  } = useQuery('currentSeason', fetchCurrentSeasonAnime);

  // Use useQuery hook to fetch data for upcoming seasonal anime
  const {
    data: upcomingSeasonAnime,
    isLoading: upcomingSeasonLoading,
    isError: upcomingSeasonError,
  } = useQuery('upcomingSeason', fetchUpcomingSeasonAnime);

  const {
    data: trendingAnime,
    isLoading: trendingAnimeLoading,
    isError: trendingAnimeError,
  } = useQuery('trendingAnime', fetchTrendingAnime);

  // List of genres for filtering
  const genres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 'Slice of Life', 'Horror'];

  // State to handle filtering
  const [selectedGenres, setSelectedGenres] = useState([]);

  useEffect(() => {
    // Clear the local storage cache for anime data when the component mounts
    localStorage.removeItem('animeData');
  }, []);

  if (currentSeasonLoading || trendingAnimeLoading || recommendedMangaLoading || upcomingSeasonLoading) {
    return <div className='loading'>Loading anime...</div>;
  }

  if (currentSeasonError || trendingAnimeError || recommendedMangaError || upcomingSeasonError) {
    return (
      <div style={{ textAlign: 'center', margin: '10px' }}>
        <p className='searchContentError'>Error fetching anime. Please refresh the page or try again later.</p>
      </div>
    );
  }

  // Filter recommended manga based on selected genres
  const filteredRecommendedManga = recommendedManga.filter((manga) =>
    selectedGenres.length === 0 || manga.genres.some((genre) => selectedGenres.includes(genre.name))
  );

  // Filter anime based on selected genres
  const filteredSeasonalAnime = currentSeasonAnime.filter((anime) =>
    selectedGenres.length === 0 || anime.genres.some((genre) => selectedGenres.includes(genre.name))
  );

  const filteredTrendingAnime = trendingAnime.filter((anime) =>
    selectedGenres.length === 0 || anime.genres.some((genre) => selectedGenres.includes(genre.name))
  );

  // Filter upcoming seasonal anime based on selected genres
  const filteredUpcomingSeasonAnime = upcomingSeasonAnime.filter((anime) =>
    selectedGenres.length === 0 || anime.genres.some((genre) => selectedGenres.includes(genre.name))
  );

  // Check if any anime titles are available for seasonal and trending anime
  const showSeasonalAnime = filteredSeasonalAnime.length > 0;
  const showTrendingAnime = filteredTrendingAnime.length > 0;
  const showRecommendedManga = filteredRecommendedManga.length > 0;
  const showUpcomingSeasonAnime = filteredUpcomingSeasonAnime.length > 0;

  const responsiveCarouselSettings = {
    dots: false,
    infinite: true,
    autoplaySpeed: 5000,
    slidesToScroll: 1,
    autoplay: true,
    fade: false, // Disable fade transition
    cssEase: 'linear',
    responsive: [
      {
        breakpoint: 2000,
        settings: {
          slidesToShow: 6,
        },
      },
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2, // Display 2 items on tablets and mobiles
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1, // Display 1 item on smaller screens
        },
      },
    ],
  };

  const topPicksCarouselSettings = {
    dots: false,
    infinite: true,
    autoplaySpeed: 10000,
    slidesToShow: 1, // Display only one item at a time
    slidesToScroll: 1,
    autoplay: true,
    fade: false, // Disable fade transition
    cssEase: 'linear',
  };

  const combinedItems = [
    ...filteredTrendingAnime.slice(0, 3),
    ...filteredRecommendedManga.slice(0, 1),
    ...filteredSeasonalAnime.slice(0, 1),
  ];

  return (
    <div>
      <Header />
      <div style={{ display: 'flex', overflowX: 'hidden' }}>
        <div style={{flex: '1', maxWidth: '100%' }}>
          {/* Top Picks Section */}
          <div className='top-picks-section'>
            <Typography variant='h4' className='ourPicksTitle' style={{ marginTop: '10px'}}>
              Our Picks
            </Typography>
            <div className='top-picks-carousel'>
              <Slider {...topPicksCarouselSettings}>
                {/* Top Picks - Trending Anime */}
                {combinedItems.map((item) => (
                  <TopPicksItem key={item.mal_id} item={item} />
                ))}
              </Slider>
            </div>
          </div>
          <hr className='hr-divider'></hr>
          {/* Current Season Anime Carousel */}
          {showSeasonalAnime && (
            <>
            <Typography variant='h4' className='currAniTitle' style={{ marginTop: '10px', textAlign: 'center' }}>
              Current Season Anime
            </Typography>
              <div style={{ maxWidth: '100%', margin: '0 50px' }}>
                <Slider {...responsiveCarouselSettings}>
                  {filteredSeasonalAnime.map((anime) => (
                    <AnimeItem key={anime.mal_id} anime={anime} />
                  ))}
                </Slider>
              </div>
            </>
          )}
          <hr className='hr-divider'></hr>
          {/* Upcoming Season Anime Carousel */}
          {showUpcomingSeasonAnime && (
            <>
              <Typography variant='h4' className='upcomingAniTitle' style={{ marginTop: '10px', textAlign: 'center' }}>Upcoming Season Anime</Typography>
              <div style={{ maxWidth: '100%', margin: '0 50px' }}>
                <Slider {...responsiveCarouselSettings}>
                  {filteredUpcomingSeasonAnime.map((anime) => (
                    <AnimeItem key={anime.mal_id} anime={anime} />
                  ))}
                </Slider>
              </div>
            </>
          )}
          <hr className='hr-divider'></hr>
          {/* Trending Anime Carousel */}
          {showTrendingAnime && (
            <>
              <Typography variant='h4' className='trendingAniTitle' style={{ marginTop: '10px', textAlign: 'center' }}>Trending Anime</Typography>
              <div style={{ maxWidth: '100%', margin: '0 50px' }}>
                <Slider {...responsiveCarouselSettings}>
                  {filteredTrendingAnime.map((anime) => (
                    <AnimeItem key={anime.mal_id} anime={anime} />
                  ))}
                </Slider>
              </div>
            </>
          )}
          <hr className='hr-divider'></hr>
          {/* Recommended Manga Carousel */}
          {showRecommendedManga && (
            <>
              <Typography variant='h4' className='recommendedMangaTitle' style={{ marginTop: '10px', textAlign: 'center' }}>
                Recommended Manga
              </Typography>
              <div style={{ maxWidth: '100%', margin: '0 50px' }}>
                <Slider {...responsiveCarouselSettings}>
                  {filteredRecommendedManga.map((manga) => (
                    <MangaItem key={manga.mal_id} manga={manga} />
                  ))}
                </Slider>
              </div>
            </>
          )}
          {!showSeasonalAnime && !showTrendingAnime && (
            <p className='noAnime'>No anime found for the selected genres. Please try different genres.</p>
          )}
          {/* Anime Facts Section */}
          {animeFactsSection}
          <hr className='hr-divider'></hr>
          {/* Footer Section */}
          <div className="footer">
            <a href="#top">
              <Typography variant='h5' component='h3' className="animeta-text">
                Animeta
              </Typography>
            </a>
            <Typography variant="body1" color="textSecondary" className="footer-right">
              © {new Date().getFullYear()} Animeta. All rights reserved.
            </Typography>
            <a href="https://github.com/teateatime/Animeta">
              <GitHubIcon style={{ fontSize: 30, color: 'mintcream', background: '#333', padding: '3px', borderRadius: '5px'}} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimeItem({ anime }) {
  const maxTitleLength = 20; // Maximum number of characters for the title
  const truncatedTitle = anime.title.length > maxTitleLength ? `${anime.title.slice(0, maxTitleLength)}...` : anime.title;

  return (
    <div className='anime-item'>
      <Link to={`/summary/${anime.mal_id}`}>
        <Typography variant='h5' component='h3' title={anime.title}>
          {truncatedTitle}
        </Typography>
        <img src={anime.images?.jpg?.large_image_url} alt={anime.title} />
      </Link>
    </div>
  );
}

function MangaItem({ manga }) {
  const maxTitleLength = 20; // Maximum number of characters for the title
  const truncatedTitle = manga.title.length > maxTitleLength ? `${manga.title.slice(0, maxTitleLength)}...` : manga.title;

  return (
    <div className='manga-item'>
      <Link to={`/summary/${manga.mal_id}`}>
        <Typography variant='h5' component='h3' title={manga.title}>
          {truncatedTitle}
        </Typography>
        <img src={manga.images?.jpg?.large_image_url} alt={manga.title} />
      </Link>
    </div>
  );
}

function TopPicksItem({ item }) {
  const maxTitleLength = 50;
  const maxSynopsisLength = 150;
  const truncatedTitle =
    item.title.length > maxTitleLength ? `${item.title.slice(0, maxTitleLength)}...` : item.title;
  const truncatedSynopsis =
    item.synopsis.length > maxSynopsisLength ? `${item.synopsis.slice(0, maxSynopsisLength)}...` : item.synopsis;

  return (
    <div className='top-picks-item'>
      <div className='top-picks-image' style={{ backgroundImage: `url(${item.images?.jpg?.large_image_url})` }}>
        <div className='top-picks-overlay'>
          <div className='top-picks-wrapper'>
            <div className='top-picks-content'>
              <Typography variant='h5' component='h3' className='top-picks-title'>
                {truncatedTitle}
              </Typography>
              <div>
                <p className='top-picks-description'>{truncatedSynopsis}</p>
                <a className='top-picks-link' href={`/summary/${item.mal_id}`}>
                  More Info
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimeFact({ fact }) {
  return (
    <div className='anime-fact-item'>
      <Typography variant='body1' className='anime-fact'>
        <strong>{fact.animeName}:</strong> {fact.fact}
      </Typography>
    </div>
  );
}

export default AnimeList;