import joblib
import pickle
import pandas as pd

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()
origins = ['*']
app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ['*'],
    allow_headers = ['*']
)

from sentence_transformers import SentenceTransformer
try:
    model = joblib.load("./model/sentence_transformers_model.pkl")
except FileNotFoundError:
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    joblib.dump(model, "./model/sentence_transformers_model.pkl")

@app.get('/')
def index():
    return {'message': 'Hello, world'}

class SentenceInput(BaseModel):
    sentence: str

@app.post("/get_embedding/")
async def get_embedding(sentence_input: SentenceInput):
    try:
        # print(sentence_input.sentence)
        embedding = model.encode(sentence_input.sentence)
        return {"embedding": embedding.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

movies = pd.read_csv('./model/tmdb_5000_movies.csv')
movies = movies.reset_index()
movies = movies[['id', 'title', 'overview']]

with open('./model/nn_rec.pkl', 'rb') as f:
    nn_model = pickle.load(f)

@app.post("/recommend/")
async def recommend(sentence_input: SentenceInput):
    try:
        embedding = model.encode([sentence_input.sentence])
        neighbors = nn_model.kneighbors(embedding, return_distance=False)[0]
        # print(movies['title'].iloc[neighbors].tolist())
        return {"recommendations":  movies['id'].iloc[neighbors].tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)
# uvicorn filename:object --reload
# uvicorn app:app --reload