import axios from 'axios'
import { useEffect, useState } from 'react'
import { useParams} from 'react-router-dom'
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

type GenreType = {
    id: number,
    name: string
}

type MovieType = {
    backdrop_path: string
    poster_path: string
    original_title: string
    overview: string
    genres: GenreType[]
}

const Movie = () => {
    const {movieId} = useParams()  
    const [movieData, setMovieData] = useState<MovieType | null>(null)
    useEffect(() => {
        const fetchMovieData = async () => {
            const {data} = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`)
            setMovieData(data)
        }
        const fetchCast = async () => {
            const {data} = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language`)
            console.log(data)
        }
        fetchMovieData()
        fetchCast()
    }, [])
    return (
        <div className='bg-primary min-h-screen text-neutral-50'>
            {movieData ? (
                <div className='min-h-screen w-full'>
                    <div className='flex min-h-screen items-center justify-center gap-10'>
                        <div>
                            <img className='rounded-xl' width={200} src={`https://image.tmdb.org/t/p/w500${movieData.poster_path}`} alt="" />
                        </div>
                        <div className='max-w-xl'>
                            <h3 className='text-3xl font-bold'>{movieData.original_title}</h3>
                            <div className='flex flex-wrap gap-2 my-5'>
                                {movieData.genres.map((genere, idx) => {
                                    return(<span key={idx} className={`px-4 p-1 rounded-xl border border-neutral-500`}>{genere.name}</span>)
                                })}
                            </div>
                            <p>{movieData.overview}</p>
                        </div>
                    </div>
                </div>
            ) : (<pre>{JSON.stringify(movieData, null, 2)}</pre>)}
        </div>
    )
}

export default Movie
