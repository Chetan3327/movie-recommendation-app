import axios, { AxiosResponse } from 'axios'
import React, { useEffect, useState } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

type MovieData = {
  original_title: any;
  poster_path: any;
}

type GenreType = {
  id: number,
  name: string
}

const MovieCard = (movie: MovieData) => {
  return(
    <div>
      <img className='rounded-md shadow-md cursor-pointer' src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} width={250} alt={movie.original_title} />
    </div>
  )
}
const App = () => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [movieData, setMovieData] = useState<MovieData[]>([])
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [generes, setGeneres] = useState<GenreType[] | null>(null)
  const [activeGenre, setActiveGenre] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const {data} = await axios.get(`https://api.themoviedb.org/3/discover/movie?with_genres=28&api_key=${TMDB_API_KEY}&with_origin_country=IN&page=1`)
      const movieDataArray = data.results.map((movie_data: MovieData) => ({
        "original_title": movie_data.original_title,
        "poster_path": movie_data.poster_path,
      }));
      setMovieData(movieDataArray)
    }
    fetchData();
  }, [])

  useEffect(() => {
    const fetchGenre = async () => {
      const {data} = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&with_origin_country=IN&language=en-US`)
      const generes: GenreType[] = data.genres
      setGeneres(generes)
    }
    fetchGenre()
  })

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setErrorMessage("")
  }
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    if(!searchTerm){
      return 
    }
    setLoading(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/recommend`, {"sentence": searchTerm})
      const recommendations: number[] = response.data.recommendations
      const axiosRequests: Promise<AxiosResponse<any, any>>[] = recommendations.map((id) => {
        return axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`)
      })

      Promise.all(axiosRequests).then((responses) => {
        const movieDataArray = responses.map((movie_data) => ({
          "original_title": movie_data.data.original_title,
          "poster_path": movie_data.data.poster_path,
        }));
        setMovieData(movieDataArray);
        console.log(movieDataArray)
      }).catch((error) => {
        console.error("Error fetching movie data:", error);
      });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setErrorMessage("Error fetching recommendations. Please try again later.");
    }
    setLoading(false)
    setErrorMessage("")
  }

  const fetchByGenre = async (genere: number) => {
    const {data} = await axios.get(`https://api.themoviedb.org/3/discover/movie?with_genres=${genere}&api_key=${TMDB_API_KEY}&with_origin_country=IN&page=1`)
    console.log(data)

    const movieDataArray = data.results.map((movie_data: MovieData) => ({
      "original_title": movie_data.original_title,
      "poster_path": movie_data.poster_path,
    }));
    setMovieData(movieDataArray)
    setActiveGenre(genere)
  }

  return (
    <div className='bg-primary min-h-screen text-neutral-50 p-20'>
      <form className='flex gap-5'>
        <input onChange={(e) => handleInput(e)} className='w-full bg-secondary p-2 rounded outline-none' type="text" placeholder='search by keyword, genre' />
        <button onClick={(e) => handleSubmit(e)} className={`${loading && 'animate-spin'} bg-secondary px-4 p-2 rounded border border-secondary hover:bg-secondary/50 hover:duration-400 hover:border-neutral-500`}>Recommend</button>
      </form>
      {errorMessage && (<div className='my-5 pl-5 bg-red-500 p-2 rounded-md border-2 border-red-950'>{errorMessage}</div>)}
      {generes && (
        <div className='flex flex-wrap gap-2 my-5'>
          {generes.map((genere, idx) => {
            return(<span onClick={() => fetchByGenre(genere.id)} key={idx} className={`px-4 p-2 bg-secondary cursor-pointer rounded-sm border border-secondary hover:border-neutral-500 ${genere.id === activeGenre && 'bg-white text-secondary'}`}>{genere.name}</span>)
          })}
        </div>
      )}
      <div className='mt-10 flex flex-wrap gap-5 justify-center'>
        {movieData.map((movie, idx) => {
          return(<MovieCard {...movie} key={idx} />)
        })}
      </div>
    </div>
  )
}

export default App
